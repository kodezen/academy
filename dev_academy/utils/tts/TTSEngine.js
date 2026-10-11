/**
 * TTSEngine — core Text-to-Speech state machine.
 *
 * Owns the full lifecycle of a speech session: voice loading, sequential
 * chunk iteration, highlight management, and clean teardown.
 *
 * Highlight levels:
 *   1. Sentence (.academy-tts-active)   — set by _setActiveChunk on chunk.node
 *   2. Word    (.academy-tts-word-active) — set by onboundary on word spans
 *
 * Word spans are injected into sentence-span nodes (<span.academy-tts-sentence>)
 * at the start of each utterance and removed on utterance end. This keeps the
 * DOM pristine for non-active chunks and preserves inline formatting (bold,
 * links, etc.) in single-sentence elements that don't receive span injection.
 */

import { extractChunks, restoreInjectedNodes } from '@Utils/tts/TextExtractor';
import { selectVoice } from '@Utils/tts/VoiceSelector';

export const TTS_STATE = {
	STOPPED: 'stopped',
	PLAYING: 'playing',
	PAUSED: 'paused',
};

// ─── Word-span helpers ────────────────────────────────────────────────────────

function escapeHtml( str ) {
	return str
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}

// Saves pre-word-injection innerHTML so clearWordSpans can restore it exactly.
const _preWordHtml = new WeakMap();

/**
 * Replaces a sentence-span node's content with one <span> per word.
 * Only called on .academy-tts-sentence nodes whose content is known plain text.
 *
 * @param {Element} node   - the sentence span
 * @param {string}  text   - plain text of the utterance
 * @returns {Element[]}    - injected word spans
 */
function injectWordSpans( node, text ) {
	_preWordHtml.set( node, node.innerHTML );

	const wordRegex = /\S+/g;
	let html = '';
	let lastEnd = 0;
	let m;

	while ( ( m = wordRegex.exec( text ) ) !== null ) {
		// Preserve whitespace between words
		html += escapeHtml( text.slice( lastEnd, m.index ) );
		html += `<span class="academy-tts-word" data-tts-c="${ m.index }">${ escapeHtml( m[ 0 ] ) }</span>`;
		lastEnd = m.index + m[ 0 ].length;
	}
	html += escapeHtml( text.slice( lastEnd ) );

	node.innerHTML = html;
	return Array.from( node.querySelectorAll( '.academy-tts-word' ) );
}

/**
 * Restores a node's content to its pre-word-injection state.
 * Safe to call on a node that was never injected.
 *
 * @param {Element} node
 */
function clearWordSpans( node ) {
	if ( ! node ) return;
	const saved = _preWordHtml.get( node );
	if ( saved !== undefined ) {
		node.innerHTML = saved;
		_preWordHtml.delete( node );
	}
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export class TTSEngine {
	/**
	 * @param {{
	 *   rate?          : number,
	 *   pitch?         : number,
	 *   highlight?     : boolean,
	 *   autoScroll?    : boolean,
	 *   onStateChange? : (state: string) => void,
	 *   onChunkChange? : (chunk: import('@Utils/tts/TextExtractor').TtsChunk|null, index: number) => void,
	 * }} options
	 */
	constructor( options = {} ) {
		// Language is read from the page's <html lang> so it always matches
		// the lesson content without any admin configuration.
		this._lang = document.documentElement.lang || 'en-US';
		this._rate = options.rate ?? 1;
		this._pitch = options.pitch ?? 1;
		this._highlight = options.highlight !== false;
		this._autoScroll = options.autoScroll !== false;

		this._onStateChange = options.onStateChange ?? ( () => {} );
		this._onChunkChange = options.onChunkChange ?? ( () => {} );

		this._state = TTS_STATE.STOPPED;
		this._chunks = [];
		this._index = 0;
		this._voice = null;
		this._activeChunk = null;
		this._container = null;
		this._destroyed = false;
	}

	// ─── Getters ────────────────────────────────────────────────────────────

	get state() {
		return this._state;
	}
	get index() {
		return this._index;
	}
	get totalChunks() {
		return this._chunks.length;
	}

	// ─── Internal helpers ────────────────────────────────────────────────────

	_emit( state ) {
		this._state = state;
		if ( ! this._destroyed ) this._onStateChange( state );
	}

	_setActiveChunk( chunk, index ) {
		if ( this._activeChunk?.node ) {
			this._activeChunk.node.classList.remove( 'academy-tts-active' );
		}

		this._activeChunk = chunk ?? null;

		if ( chunk?.node ) {
			if ( this._highlight ) {
				chunk.node.classList.add( 'academy-tts-active' );
			}
			if ( this._autoScroll ) {
				chunk.node.scrollIntoView( { behavior: 'smooth', block: 'center' } );
			}
		}

		if ( ! this._destroyed ) {
			this._onChunkChange( this._activeChunk, index ?? this._index );
		}
	}

	_clearHighlights() {
		this._chunks.forEach( ( c ) =>
			c.node?.classList.remove( 'academy-tts-active' )
		);
	}

	/**
	 * Speaks the chunk at `index`, injecting word spans and wiring
	 * onboundary for word-level highlighting.
	 */
	_speak( index ) {
		if ( this._destroyed || this._state !== TTS_STATE.PLAYING ) return;

		if ( index >= this._chunks.length ) {
			this._finish();
			return;
		}

		this._index = index;
		const chunk = this._chunks[ index ];
		this._setActiveChunk( chunk, index );

		// ── Word span injection ────────────────────────────────────────────
		// Inject into every chunk node. _preWordHtml saves the original
		// innerHTML (including ql-ui spans, <strong>, etc.) and clearWordSpans
		// restores it when the utterance ends, so no content is permanently lost.
		const wordSpans = chunk.node ? injectWordSpans( chunk.node, chunk.text ) : [];
		let activeWordSpan = null;

		// ── Utterance ──────────────────────────────────────────────────────
		const utterance = new window.SpeechSynthesisUtterance( chunk.text );
		utterance.rate = this._rate;
		utterance.pitch = this._pitch;
		utterance.lang = this._lang;
		if ( this._voice ) {
			const voicePrefix  = this._voice.lang.split( '-' )[ 0 ].toLowerCase();
			const configPrefix = this._lang.split( '-' )[ 0 ].toLowerCase();
			if ( voicePrefix === configPrefix ) {
				utterance.voice = this._voice;
			}
		}

		// ── Word boundary (Chrome/Firefox; graceful no-op on Safari) ──────
		utterance.onboundary = ( e ) => {
			if ( e.name !== 'word' ) return;
			if ( this._state !== TTS_STATE.PLAYING || this._destroyed ) return;

			if ( activeWordSpan ) {
				activeWordSpan.classList.remove( 'academy-tts-word-active' );
			}

			// Exact start-position match first
			let target = wordSpans.find(
				( s ) => parseInt( s.dataset.ttsC, 10 ) === e.charIndex
			);
			// Fallback: highest word-start ≤ charIndex (handles off-by-one in some engines)
			if ( ! target ) {
				target = wordSpans.reduce( ( best, s ) => {
					const start = parseInt( s.dataset.ttsC, 10 );
					return start <= e.charIndex &&
						( ! best || parseInt( best.dataset.ttsC, 10 ) < start )
						? s
						: best;
				}, null );
			}

			if ( target ) {
				target.classList.add( 'academy-tts-word-active' );
				activeWordSpan = target;
			}
		};

		utterance.onend = () => {
			clearWordSpans( chunk.node );
			activeWordSpan = null;
			if ( ! this._destroyed && this._state === TTS_STATE.PLAYING ) {
				this._speak( this._index + 1 );
			}
		};

		utterance.onerror = ( e ) => {
			clearWordSpans( chunk.node );
			activeWordSpan = null;
			// 'interrupted' / 'canceled' are expected when stop() calls cancel()
			const benign = [ 'interrupted', 'canceled' ];
			if ( ! benign.includes( e.error ) && ! this._destroyed ) {
				this._finish();
			}
		};

		// Always resume before speak — clears any lingering paused state in Chrome.
		window.speechSynthesis.resume();
		window.speechSynthesis.speak( utterance );
	}

	_finish() {
		clearWordSpans( this._activeChunk?.node );
		this._clearHighlights();
		restoreInjectedNodes( this._container );

		const container = this._container;
		this._activeChunk = null;
		this._chunks = [];
		this._index = 0;
		this._container = null;
		this._emit( TTS_STATE.STOPPED );
		if ( ! this._destroyed ) this._onChunkChange( null, 0 );

		// Scroll back to the top of the lesson content once reading is complete.
		// The wrapper has display:contents so it has no box; scroll its first
		// real child instead, falling back to the page top.
		if ( container ) {
			const firstEl = container.firstElementChild;
			if ( firstEl ) {
				firstEl.scrollIntoView( { behavior: 'smooth', block: 'start' } );
			} else {
				window.scrollTo( { top: 0, behavior: 'smooth' } );
			}
		}
	}

	// ─── Public API ──────────────────────────────────────────────────────────

	/**
	 * Pre-loads the best available voice for this engine's language.
	 * Called on mount so play() can speak synchronously (required by iOS Safari).
	 */
	async preloadVoice() {
		if ( this._destroyed ) return;
		this._voice = await selectVoice( this._lang );
	}

	/**
	 * Start reading from the beginning of `container`.
	 * Synchronous so speak() stays within the user-gesture tick.
	 *
	 * @param {Element} container
	 */
	play( container ) {
		if ( this._destroyed ) return;

		// Restore sentence spans from any previous play session before re-extracting
		if ( this._container ) restoreInjectedNodes( this._container );

		if ( this._state !== TTS_STATE.STOPPED ) {
			this._state = TTS_STATE.STOPPED;
			window.speechSynthesis.cancel();
		}
		clearWordSpans( this._activeChunk?.node );
		this._clearHighlights();

		this._container = container;
		this._chunks = extractChunks( container );
		this._index = 0;

		if ( ! this._chunks.length ) return;

		this._emit( TTS_STATE.PLAYING );
		this._speak( 0 );
	}

	pause() {
		if ( this._destroyed || this._state !== TTS_STATE.PLAYING ) return;
		// Set state BEFORE cancel() so onend/onerror handlers see PAUSED
		// and do not advance to the next chunk.
		this._state = TTS_STATE.PAUSED;
		// Use cancel() instead of speechSynthesis.pause() — Chrome's pause()
		// leaves synthesis in a broken state that resume() cannot recover from.
		window.speechSynthesis.cancel();
		// Clear word-level highlight but keep sentence highlight so the user
		// can see exactly where playback was paused.
		clearWordSpans( this._activeChunk?.node );
		this._onStateChange( TTS_STATE.PAUSED );
	}

	resume() {
		if ( this._destroyed || this._state !== TTS_STATE.PAUSED ) return;
		this._emit( TTS_STATE.PLAYING );
		// Restart the current chunk from the beginning (most reliable cross-browser).
		this._speak( this._index );
	}

	stop() {
		if ( this._destroyed ) return;
		const wasActive = this._state !== TTS_STATE.STOPPED;
		this._state = TTS_STATE.STOPPED;
		if ( wasActive ) {
			window.speechSynthesis.cancel();
		}
		clearWordSpans( this._activeChunk?.node );
		this._clearHighlights();
		restoreInjectedNodes( this._container );
		this._activeChunk = null;
		this._chunks = [];
		this._index = 0;
		this._container = null;
		if ( wasActive && ! this._destroyed ) {
			this._onStateChange( TTS_STATE.STOPPED );
			this._onChunkChange( null, 0 );
		}
	}

	/**
	 * Update rate / pitch settings.
	 * Takes effect at the start of the next utterance (no restart required).
	 *
	 * @param {{ rate?: number, pitch?: number }} options
	 */
	configure( options = {} ) {
		if ( options.rate !== undefined ) this._rate = options.rate;
		if ( options.pitch !== undefined ) this._pitch = options.pitch;
	}

	/**
	 * Start reading from the element the user clicked, finding the closest
	 * readable ancestor (heading, paragraph, list item, etc.) and then
	 * locating the matching chunk after DOM extraction so reading begins
	 * at exactly that position.
	 *
	 * Safe to call while playing, paused, or stopped.
	 *
	 * @param {Element} clickedEl  - event.target from the click handler
	 * @param {Element} container  - the lesson content wrapper element
	 */
	playFrom( clickedEl, container ) {
		if ( this._destroyed ) return;

		// Resolve the closest readable element BEFORE extractChunks mutates the DOM.
		const READABLE_TAGS = new Set( [
			'p', 'li', 'blockquote', 'figcaption', 'td', 'th',
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		] );
		let targetEl = clickedEl;
		while ( targetEl && targetEl !== container ) {
			if ( READABLE_TAGS.has( targetEl.tagName?.toLowerCase() ) ) break;
			targetEl = targetEl.parentElement;
		}
		if ( ! targetEl || targetEl === container ) targetEl = null;

		// Tear down any active session
		if ( this._container ) restoreInjectedNodes( this._container );
		if ( this._state !== TTS_STATE.STOPPED ) {
			this._state = TTS_STATE.STOPPED;
			window.speechSynthesis.cancel();
		}
		clearWordSpans( this._activeChunk?.node );
		this._clearHighlights();

		this._container = container;
		this._chunks = extractChunks( container );

		if ( ! this._chunks.length ) return;

		// Find the first chunk that belongs to targetEl.
		// After extraction, single-sentence elements are chunk.node themselves;
		// multi-sentence elements have injected <span> children as chunk.node,
		// so targetEl.contains(chunk.node) catches both cases.
		let startIndex = 0;
		if ( targetEl ) {
			const idx = this._chunks.findIndex(
				( c ) => c.node === targetEl || targetEl.contains( c.node )
			);
			if ( idx !== -1 ) startIndex = idx;
		}

		this._index = startIndex;
		this._emit( TTS_STATE.PLAYING );
		this._speak( startIndex );
	}

	/**
	 * Must be called when the owning React component unmounts.
	 * Stops speech, clears highlights, restores injected DOM nodes,
	 * and prevents future callbacks.
	 */
	destroy() {
		const wasActive = this._state !== TTS_STATE.STOPPED;
		this._state = TTS_STATE.STOPPED;
		if ( wasActive ) {
			window.speechSynthesis.cancel();
		}
		clearWordSpans( this._activeChunk?.node );
		this._clearHighlights();
		restoreInjectedNodes( this._container );
		this._activeChunk = null;
		this._chunks = [];
		this._index = 0;
		this._container = null;

		this._destroyed = true;
		this._onStateChange = () => {};
		this._onChunkChange = () => {};
	}
}
