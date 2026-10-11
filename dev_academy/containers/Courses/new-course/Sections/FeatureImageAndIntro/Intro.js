import React, { useEffect, useState } from 'react';
import Button from '@Components/Button';
import { Dropdown } from '@Components/ui';
import { __ } from '@wordpress/i18n';
import { API, plugin_root_url } from '@Utils/helper';
import { external_link, embedded, html5, shortcode } from '@Utils/icons';

const imageIcon = ( file ) => (
	<img src={ `${ plugin_root_url }assets/images/${ file }` } alt="" width="20" height="20" />
);

export const VIDEO_TYPE_OPTIONS = [
	{ label: __( 'Youtube', 'academy' ), value: 'youtube', icon: imageIcon( 'yt.png' ) },
	{ label: __( 'Vimeo', 'academy' ), value: 'vimeo', icon: imageIcon( 'vimeo.png' ) },
	{ label: __( 'External URL', 'academy' ), value: 'external', icon: external_link() },
	{ label: __( 'Embedded', 'academy' ), value: 'embedded', icon: embedded() },
	{ label: __( 'HTML 5 (mp4)', 'academy' ), value: 'html5', icon: html5() },
	{ label: __( 'Shortcode', 'academy' ), value: 'shortcode', icon: shortcode() },
];

export const getYoutubeEmbedUrl = ( url ) => {
	const match = String( url || '' ).match(
		/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
	);
	return match ? `https://www.youtube.com/embed/${ match[ 1 ] }` : null;
};

export const getVimeoEmbedUrl = ( url ) => {
	const match = String( url || '' ).match( /vimeo\.com\/(?:video\/)?(\d+)/ );
	return match ? `https://player.vimeo.com/video/${ match[ 1 ] }` : null;
};

/**
 * The live preview once a type + value both exist — an embedded player for
 * Youtube/Vimeo/External/HTML5, the admin's own pasted markup for Embedded,
 * or just the shortcode text (a shortcode only resolves server-side, there's
 * no way to render it live in the course builder). Sized by its parent
 * (`.academy-media-card__preview`) via `academy-video-preview__frame`, not
 * on its own — it always renders inside that fixed-size slot now.
 *
 * @param {Object} props
 * @param {string} props.type  One of `VIDEO_TYPE_OPTIONS`'s values.
 * @param {string} props.value The stored value for that type (URL, media ID, markup, or shortcode).
 */
export const VideoPreview = ( { type, value } ) => {
	const [ html5Url, setHtml5Url ] = useState( '' );

	useEffect( () => {
		if ( type === 'html5' && value ) {
			API.get( `wp/v2/media/${ value }` ).then( ( res ) => {
				setHtml5Url( res.data?.source_url || '' );
			} );
		}
	}, [ type, value ] );

	if ( type === 'youtube' || type === 'vimeo' ) {
		const embedUrl =
			type === 'youtube'
				? getYoutubeEmbedUrl( value )
				: getVimeoEmbedUrl( value );
		return embedUrl ? (
			<iframe
				className="academy-video-preview__frame"
				src={ embedUrl }
				title={ __( 'Video preview', 'academy' ) }
				allowFullScreen
			/>
		) : (
			<p className="academy-video-preview__fallback">{ value }</p>
		);
	}

	if ( type === 'external' ) {
		return (
			// eslint-disable-next-line jsx-a11y/media-has-caption
			<video
				className="academy-video-preview__frame"
				src={ value }
				controls
			/>
		);
	}

	if ( type === 'html5' ) {
		return html5Url ? (
			// eslint-disable-next-line jsx-a11y/media-has-caption
			<video
				className="academy-video-preview__frame"
				src={ html5Url }
				controls
			/>
		) : null;
	}

	if ( type === 'embedded' ) {
		return (
			<div
				className="academy-video-preview__embed"
				// The admin pastes their own embed markup here by design —
				// same trust level as any other admin-authored HTML field in
				// this builder.
				dangerouslySetInnerHTML={ { __html: value } }
			/>
		);
	}

	return (
		<p className="academy-video-preview__fallback">
			{ __( 'Preview not available for shortcodes:', 'academy' ) } { value }
		</p>
	);
};

/**
 * "Upload Video" / "Change Video" trigger — opens a dropdown menu styled
 * like the Course Builder's "Add New Content" dropdown
 * (`builder/topics-select-modal`, `.academy-add-new-content` icon+label
 * rows) instead of the old `AcademySelect` picker, per the reference UI the
 * admin pointed to. Picking a type just reports it up via `onSelect` —
 * `FeatureImageAndIntro/index.js` owns what happens next (HTML5 opens the
 * media picker immediately, the rest wait for a typed value).
 *
 * @param {Object}   props
 * @param {string}   props.label    Button label ("Upload Video"/"Change Video").
 * @param {Function} props.onSelect Called with the picked type's value.
 */
export const VideoUploadButton = ( { label, onSelect } ) => (
	<Dropdown
		contentClassName="academy-content-dropdown academy-content-dropdown--new"
		renderToggle={ ( { isOpen, onToggle } ) => (
			<Button
				type="button"
				onClick={ onToggle }
				aria-expanded={ isOpen }
				preset="light-purple"
				size="sm"
				icon={ <span className="academy-icon academy-icon--video" /> }
				label={ label }
			/>
		) }
		renderContent={ ( { onClose } ) => (
			<div className="academy-add-new-content">
				{ VIDEO_TYPE_OPTIONS.map( ( option ) => (
					<Button
						key={ option.value }
						type="button"
						onClick={ () => {
							onSelect( option.value );
							onClose();
						} }
						icon={ <span className="mt-1.5">{ option.icon }</span> }
						label={ option.label }
					/>
				) ) }
			</div>
		) }
	/>
);

// Embedded markup and shortcodes are routinely multi-line/long, so those two
// keep a textarea — every other type is a plain URL, one line.
const isMultilineType = ( type ) => type === 'embedded' || type === 'shortcode';

const EXAMPLE_PLACEHOLDERS = {
	youtube: __( 'Example: https://www.youtube.com/watch?v=…', 'academy' ),
	vimeo: __( 'Example: https://vimeo.com/…', 'academy' ),
	external: __( 'Example: https://example.com/video.mp4', 'academy' ),
	embedded: __( 'Paste the embed code (iframe)…', 'academy' ),
	shortcode: __( 'Paste the shortcode…', 'academy' ),
};

/**
 * A source type has been picked but doesn't have a value yet (HTML5 sets
 * both together via the media picker, so this only ever shows for the
 * typed-URL/code types) — just the input for that type; cancelling back to
 * the empty state is the card's own delete icon, same as removing a media
 * that's already set (`FeatureImageAndIntro/index.js`'s `removeAll`).
 *
 * @param {Object}   props
 * @param {string}   props.type     The chosen source type.
 * @param {string}   props.value    The in-progress value (always '' here).
 * @param {Function} props.onChange Called with the new value on every keystroke.
 */
export const VideoValueInput = ( { type, value, onChange } ) => {
	const [ isLinkValid, setIsLinkValid ] = useState( true );

	const validateLink = ( raw ) => {
		let isValid = true;
		if ( type === 'youtube' ) {
			isValid =
				/^https?:\/\/(www\.)?youtube\.com/.test( raw ) ||
				/^https?:\/\/youtu\.be\/[^\s/?]+/.test( raw );
		} else if ( type === 'vimeo' ) {
			isValid = /^https?:\/\/(www\.)?vimeo\.com/.test( raw );
		}
		setIsLinkValid( isValid );
		return isValid;
	};

	const className = ! isLinkValid ? 'invalidLink academy-input' : 'academy-input';
	const placeholder =
		EXAMPLE_PLACEHOLDERS[ type ] ||
		__( 'Paste the video URL or code…', 'academy' );
	const handleChange = ( e ) => {
		validateLink( e.target.value );
		onChange( e.target.value );
	};

	return isMultilineType( type ) ? (
		<textarea
			className={ className }
			rows="3"
			value={ value }
			placeholder={ placeholder }
			onChange={ handleChange }
		/>
	) : (
		<input
			type="text"
			className={ className }
			value={ value }
			placeholder={ placeholder }
			onChange={ handleChange }
		/>
	);
};
