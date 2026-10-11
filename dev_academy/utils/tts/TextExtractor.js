/**
 * TextExtractor — DOM → readable TtsChunk array
 *
 * Uses a recursive DOM walk to extract sentences as individual chunks.
 * For multi-sentence leaf elements, injects lightweight <span> wrappers
 * so each sentence gets its own node for precise per-sentence highlighting.
 * Call restoreInjectedNodes(container) to undo all DOM changes when done.
 */

// Elements that should never be read (and whose subtrees are skipped)
const SKIP_TAGS = new Set( [
	'button', 'input', 'select', 'textarea',
	'code', 'pre', 'script', 'style', 'noscript',
	'nav', 'form', 'iframe',
	'svg', 'canvas', 'video', 'audio',
] );

const HEADING_TAGS       = new Set( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] );
const LEAF_TAGS          = new Set( [ 'p', 'blockquote', 'figcaption', 'td', 'th' ] );
const LIST_CONTAINER_TAGS = new Set( [ 'ul', 'ol' ] );

// Classes whose elements (and subtrees) must never be read
const SKIP_CLASSES = [
	'academy-tts-player',
	'academy-tts-floating',
	'ql-ui',         // Quill editor bullet/number indicator (empty, visual-only)
];

/**
 * @typedef {{ text: string, node: Element, isHeading: boolean }} TtsChunk
 */

// ─── Sentence splitting ───────────────────────────────────────────────────────

const SENTENCE_END = /([.!?؟।。！？]+)\s*/g;

function splitSentences( text ) {
	if ( ! text || text.length < 60 ) return [ text ];

	const sentences = [];
	let last = 0;
	let m;

	SENTENCE_END.lastIndex = 0;
	while ( ( m = SENTENCE_END.exec( text ) ) !== null ) {
		const end = m.index + m[ 0 ].length;
		const s = text.slice( last, end ).trim();
		if ( s ) sentences.push( s );
		last = end;
	}

	const tail = text.slice( last ).trim();
	if ( tail ) sentences.push( tail );

	return sentences.length ? sentences : [ text ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shouldSkip( node ) {
	const tag = node.tagName.toLowerCase();
	if ( SKIP_TAGS.has( tag ) ) return true;
	if ( node.getAttribute( 'aria-hidden' ) === 'true' ) return true;
	if ( node.hasAttribute( 'hidden' ) ) return true;

	const cls = node.className || '';
	if ( SKIP_CLASSES.some( ( c ) => cls.includes( c ) ) ) return true;

	// Only skip genuinely hidden elements; avoid offsetWidth (unreliable)
	const style = window.getComputedStyle( node );
	if ( style.display === 'none' || style.visibility === 'hidden' ) return true;

	return false;
}

function getText( node ) {
	return ( node.innerText || node.textContent || '' ).trim();
}

/**
 * Returns only the direct/inline text of an <li>, excluding any nested
 * <ul>/<ol> sub-lists so sub-items can be walked and read separately.
 */
function getDirectText( node ) {
	let text = '';
	node.childNodes.forEach( ( child ) => {
		if ( child.nodeType === Node.TEXT_NODE ) {
			text += child.textContent;
		} else if ( child.nodeType === Node.ELEMENT_NODE ) {
			const childTag = child.tagName.toLowerCase();
			// Skip nested list containers and Quill UI decorators
			const cls = child.className || '';
			const isUiDecorator = SKIP_CLASSES.some( ( c ) => cls.includes( c ) );
			if ( ! LIST_CONTAINER_TAGS.has( childTag ) && ! isUiDecorator ) {
				text += child.innerText ?? child.textContent ?? '';
			}
		}
	} );
	return text.trim();
}

function escapeHtml( str ) {
	return str
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}

// ─── Sentence span injection ──────────────────────────────────────────────────

// WeakMap so entries are GC'd automatically when DOM nodes are removed
const _originalHtml = new WeakMap();

function injectSentenceSpans( leafNode, sentences ) {
	_originalHtml.set( leafNode, leafNode.innerHTML );
	leafNode.dataset.ttsInjected = '1';
	leafNode.innerHTML = sentences
		.map( ( s ) => `<span class="academy-tts-sentence">${ escapeHtml( s ) }</span>` )
		.join( '' );
	return Array.from( leafNode.querySelectorAll( '.academy-tts-sentence' ) );
}

/**
 * Removes all injected sentence <span> elements within container,
 * restoring original innerHTML. Safe to call even if nothing was injected.
 *
 * @param {Element} container
 */
export function restoreInjectedNodes( container ) {
	if ( ! container ) return;
	container.querySelectorAll( '[data-tts-injected]' ).forEach( ( el ) => {
		const html = _originalHtml.get( el );
		if ( html !== undefined ) {
			el.innerHTML = html;
			_originalHtml.delete( el );
		}
		delete el.dataset.ttsInjected;
	} );
}

// ─── Recursive walk ───────────────────────────────────────────────────────────

function pushLeafChunks( node, text, chunks ) {
	const sentences = splitSentences( text );
	if ( sentences.length <= 1 ) {
		chunks.push( { text: sentences[ 0 ] ?? text, node, isHeading: false } );
	} else {
		const spans = injectSentenceSpans( node, sentences );
		spans.forEach( ( span, i ) => {
			chunks.push( { text: sentences[ i ], node: span, isHeading: false } );
		} );
	}
}

function walk( node, chunks ) {
	if ( ! node || node.nodeType !== Node.ELEMENT_NODE ) return;
	if ( shouldSkip( node ) ) return;

	const tag = node.tagName.toLowerCase();

	// Headings: one chunk per element, no injection needed
	if ( HEADING_TAGS.has( tag ) ) {
		const text = getText( node );
		if ( text ) chunks.push( { text, node, isHeading: true } );
		return;
	}

	// List items: read own text (excluding nested sub-lists), then recurse
	// into any child <ul>/<ol> so nested items are read as separate chunks.
	if ( tag === 'li' ) {
		const hasNestedList = Array.from( node.children ).some( ( c ) =>
			LIST_CONTAINER_TAGS.has( c.tagName.toLowerCase() )
		);

		if ( hasNestedList ) {
			// Only read direct/inline text — sub-list text comes from recursion below
			const text = getDirectText( node );
			if ( text ) pushLeafChunks( node, text, chunks );
			// Recurse into nested <ul>/<ol> only (not other children)
			node.children && Array.from( node.children ).forEach( ( child ) => {
				if ( LIST_CONTAINER_TAGS.has( child.tagName.toLowerCase() ) ) {
					walk( child, chunks );
				}
			} );
		} else {
			// Simple list item — use getDirectText to skip ql-ui decorators
			const text = getDirectText( node );
			if ( text ) pushLeafChunks( node, text, chunks );
		}
		return;
	}

	// Standard leaf elements
	if ( LEAF_TAGS.has( tag ) ) {
		const text = getText( node );
		if ( text ) pushLeafChunks( node, text, chunks );
		return;
	}

	// Container (includes <ul>, <ol>, <div>, etc.): recurse into children
	for ( let i = 0; i < node.children.length; i++ ) {
		walk( node.children[ i ], chunks );
	}
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Extracts an ordered array of TtsChunks from `container`.
 * Multi-sentence leaf elements get <span> wrappers injected so that
 * highlighting is per-sentence rather than per-element.
 * Call restoreInjectedNodes(container) to undo all DOM changes.
 *
 * @param {Element} container
 * @returns {TtsChunk[]}
 */
export function extractChunks( container ) {
	if ( ! container ) return [];

	const chunks = [];
	walk( container, chunks );

	// Fallback: structured walk found nothing — use all visible text as-is
	if ( chunks.length === 0 ) {
		const text = getText( container );
		if ( text ) {
			splitSentences( text ).forEach( ( s ) =>
				chunks.push( { text: s, node: container, isHeading: false } )
			);
		}
	}

	return chunks;
}
