/**
 * Add Academy's own stylesheets to the document a block is shown in (the
 * editor canvas iframe), once, when the first such block appears.
 *
 * Blocks that print Academy's markup — a course section, a course card's
 * wishlist button — need Academy's CSS and icon font in the canvas, or they
 * are drawn unstyled and the icon-font glyphs come out blank.
 *
 * @param {string[]} extra Other style sets from academyBlocks to add too.
 * @return {Object} Ref for the block wrapper.
 */
import { useEffect, useRef } from '@wordpress/element';

export default function useAcademyStyles( extra = [] ) {
	const ref = useRef();
	useEffect( () => {
		const doc = ref.current?.ownerDocument;
		if ( ! doc ) {
			return;
		}
		const loaded = [ ...doc.querySelectorAll( 'link[rel="stylesheet"]' ) ].map( ( link ) => link.href.split( '?' )[ 0 ] );
		// The common styles, plus any set a block asks for (the dashboard's).
		const hrefs = [ ...( window.academyBlocks?.styles || [] ), ...extra.flatMap( ( key ) => window.academyBlocks?.[ key ] || [] ) ];
		hrefs.forEach( ( href ) => {
			const id = `academy-blocks-canvas-style-${ href.split( '?' )[ 0 ].replace( /[^a-z0-9]+/gi, '-' ).slice( -60 ) }`;
			// Another plugin may already load the same file into the canvas.
			if ( doc.getElementById( id ) || loaded.includes( href.split( '?' )[ 0 ] ) ) {
				return;
			}
			const link = doc.createElement( 'link' );
			link.id = id;
			link.rel = 'stylesheet';
			link.href = href;
			doc.head.appendChild( link );
		} );
	}, [] );
	return ref;
}
