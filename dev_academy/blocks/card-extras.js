import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Spinner, TextControl, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { __ } from '@wordpress/i18n';
import { SVG, Path } from '@wordpress/primitives';
import { starFilled } from '@wordpress/icons';
import useCourse from './shared/use-course';
import useAcademyStyles from './shared/use-academy-styles';

// Traced from the "heart-o" glyph in assets/lib/css/selection.json, so the
// inserter/toolbar icon matches the icon-font glyph the block itself renders.
const heart = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1184 1024" width="1em" height="1em" aria-hidden="true" focusable="false">
		<Path
			fill="currentColor"
			d="M990.55 144.423c51.79 44.6 86.318 97.832 103.587 159.697 17.261 60.425 17.98 118.693 2.154 174.803s-43.155 104.307-82.001 144.59l-377.663 384.135c-23.019 23.021-50.354 34.53-82.007 34.53s-58.987-11.507-82.006-34.53l-377.66-384.135c-38.845-40.283-66.181-88.479-82.006-144.59-15.825-57.548-15.107-116.535 2.158-176.962s51.794-112.938 103.587-157.538c61.863-51.794 134.518-74.093 217.964-66.899 84.885 5.756 157.539 38.845 217.965 99.271 60.426-60.426 132.361-93.516 215.807-99.271 84.881-7.194 158.255 15.107 220.124 66.899zM940.916 550.138c41.719-43.161 62.578-95.672 62.578-157.538 0-63.303-25.894-119.412-77.685-168.328-43.163-34.53-93.516-49.635-151.066-45.319-56.11 4.316-104.307 27.336-144.59 69.057l-75.533 75.533-75.533-75.533c-40.283-41.723-89.2-64.741-146.747-69.057-56.11-4.316-105.745 10.791-148.905 45.319-51.794 48.916-77.691 105.026-77.691 168.328 0 61.864 20.861 114.378 62.584 157.538l379.819 384.134c4.316 5.754 8.632 5.754 12.95 0l379.82-384.134z"
		/>
	</SVG>
);

registerBlockType( 'academy/course-badge', {
	icon: starFilled,
	edit: function Edit( { attributes: { text }, setAttributes, context } ) {
		const { course, isSample } = useCourse( context );
		const featured = isSample || !! course?.is_sticky;
		const blockProps = useBlockProps( {
			style: featured ? undefined : { opacity: 0.45 },
			title: featured ? undefined : __( 'Shown only on featured courses.', 'academy' ),
		} );

		return (
			<>
				<InspectorControls>
					<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Badge text', 'academy' ) }
							placeholder={ __( 'Featured', 'academy' ) }
							value={ text ?? '' }
							onChange={ ( value ) => setAttributes( { text: value } ) }
							help={ __( 'The badge appears only on courses marked as featured.', 'academy' ) }
						/>
					</AcademyPanelBody>
				</InspectorControls>
				{ course ? <span { ...blockProps }>{ text || __( 'Featured', 'academy' ) }</span> : <Spinner /> }
			</>
		);
	},
} );

registerBlockType( 'academy/course-wishlist', {
	icon: heart,
	edit: function Edit( { attributes: { showLabel }, setAttributes } ) {
		// The heart is an icon-font glyph: load Academy's styles (icon font
		// included) into the canvas, or it comes out blank.
		const ref = useAcademyStyles();
		const blockProps = useBlockProps( { ref } );

		return (
			<>
				<InspectorControls>
					<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
						<ToggleControl
							__nextHasNoMarginBottom
							className="academy-block-toggle"
							label={ __( 'Show the “WishList” label', 'academy' ) }
							help={ __( 'Shown when Course Wishlist is turned on in Academy LMS settings.', 'academy' ) }
							checked={ showLabel }
							onChange={ ( value ) => setAttributes( { showLabel: value } ) }
						/>
					</AcademyPanelBody>
				</InspectorControls>
				<span { ...blockProps } role="img" aria-label={ __( 'Add to wishlist', 'academy' ) }>
					{ /* The same icon-font glyph render.php prints, so the card
					     in the editor matches what students see. The SVG above
					     stays the block's inserter icon. */ }
					<i className="academy-icon academy-icon--heart-o" aria-hidden="true" />
					{ showLabel && __( 'WishList', 'academy' ) }
				</span>
			</>
		);
	},
} );
