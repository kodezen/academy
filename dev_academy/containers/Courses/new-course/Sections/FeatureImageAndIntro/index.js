import React, { useEffect, useState } from 'react';
import {
	VIDEO_TYPE_OPTIONS,
	VideoPreview,
	VideoUploadButton,
	VideoValueInput,
} from './Intro';
import Button from '@Components/Button';
import { __, sprintf } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import AiImageGenerator from '@Components/AiImageGenerator';
import { API, runUploader } from '@Utils/helper';
import './styles.scss';

// The "Change <kind> / Upload <other kind>" pair — same two buttons in every
// state (empty, image set, video set), just relabeled by which kind is
// currently active. The Image button always opens the media picker
// directly; the Video button always opens the source-type menu (even to
// "change" — re-picking a type is simplest, matches the type menu's own
// "pick again" flow rather than a separate re-edit path). The "— or —"
// divider only shows in the fully-empty state, between the two first-pick
// buttons — once a kind is active, the pair reads as Change/Upload, not a
// choice between equals.
const ActionButtons = ( {
	activeKind,
	showOrSeparator,
	onChooseImage,
	onSelectVideoType,
} ) => (
	<div className="academy-media-card__actions">
		<Button
			type="button"
			preset="light-purple"
			size="sm"
			icon={ <span className="academy-icon academy-icon--image" /> }
			label={
				activeKind === 'image'
					? __( 'Change Image', 'academy' )
					: __( 'Upload Image', 'academy' )
			}
			onClick={ onChooseImage }
		/>
		{ showOrSeparator && (
			<span className="academy-media-card__or">
				— { __( 'or', 'academy' ) } —
			</span>
		) }
		<VideoUploadButton
			label={
				activeKind === 'video'
					? __( 'Change Video', 'academy' )
					: __( 'Upload Video', 'academy' )
			}
			onSelect={ onSelectVideoType }
		/>
	</div>
);

// The pending-input state's subtitle, per source type — matches the
// "Add Course Media" Figma reference (node 13734:18196), which only spells
// this out for the URL case ("Paste your YouTube video URL below.").
const pendingDescription = ( type, label ) => {
	if ( type === 'embedded' ) {
		return __( 'Paste your embed code below.', 'academy' );
	}
	if ( type === 'shortcode' ) {
		return __( 'Paste your shortcode below.', 'academy' );
	}
	return sprintf(
		__( 'Paste your %s video URL below.', 'academy' ),
		label
	);
};

/**
 * A course has ONE hero media slot — either a feature image or an intro
 * video, never both. The bordered card (preview left, title/details/actions
 * right — per the "Add Course Media" Figma reference, node 13734:18196) is
 * always on screen, in every state — empty (gray placeholder + upload
 * icon), image set, video set, or a video type picked but not yet given a
 * value — rather than only appearing once media is set, so the layout
 * doesn't jump around as the admin goes through the flow. The delete icon
 * sits inline at the top of the details column (not pinned over the whole
 * card) once something is set or pending; clicking it always clears both
 * fields (`removeAll`) — for a merely-pending type that's a no-op on the
 * image field, so it doubles as "cancel" back to the empty state.
 * `guardedSetFieldValue` keeps the two fields mutually exclusive: committing
 * to one (a real image, or even just picking a video source type) always
 * clears the other.
 */
const FeatureImageAndIntro = () => {
	const { values, setFieldValue } = useFormikContext();
	const [ imageUrl, setImageUrl ] = useState( '' );

	const hasImage = !! values?.featured_media;
	const introVideo = values?.meta?.academy_course_intro_video || [];
	const videoType = introVideo[ 0 ] || '';
	const videoValue = introVideo[ 1 ] || '';
	const hasVideoSet = !! videoType && !! videoValue;
	const videoTypePending = !! videoType && ! videoValue;

	useEffect( () => {
		if ( values?.featured_media ) {
			API.get( `wp/v2/media/${ values.featured_media }` ).then( ( res ) => {
				setImageUrl( res.data?.source_url || '' );
			} );
		} else {
			setImageUrl( '' );
		}
	}, [ values?.featured_media ] );

	const guardedSetFieldValue = ( field, value ) => {
		setFieldValue( field, value );
		if ( field === 'featured_media' && value ) {
			setFieldValue( 'meta.academy_course_intro_video', [] );
		} else if (
			field === 'meta.academy_course_intro_video' &&
			Array.isArray( value ) &&
			value[ 0 ]
		) {
			// Committing to a video source type is already a decisive switch
			// away from the image, even before its value is filled in —
			// otherwise the image card and the video type-input would both
			// try to render at once.
			setFieldValue( 'featured_media', 0 );
		}
	};

	const chooseImage = async () => {
		const attachment = await runUploader( { library: { type: 'image' } } );
		if ( attachment ) {
			guardedSetFieldValue( 'featured_media', attachment.id );
		}
	};

	const selectVideoType = ( type ) => {
		if ( type === 'html5' ) {
			runUploader( { library: { type: [ 'video' ] } } ).then(
				( attachment ) => {
					if ( attachment ) {
						guardedSetFieldValue(
							'meta.academy_course_intro_video',
							[ 'html5', attachment.id.toString() ]
						);
					}
				}
			);
			return;
		}
		guardedSetFieldValue( 'meta.academy_course_intro_video', [ type, '' ] );
	};

	const setVideoValue = ( value ) => {
		guardedSetFieldValue( 'meta.academy_course_intro_video', [
			videoType,
			value,
		] );
	};

	const removeAll = () => {
		setFieldValue( 'featured_media', 0 );
		setFieldValue( 'meta.academy_course_intro_video', [] );
	};

	const videoTypeLabel =
		VIDEO_TYPE_OPTIONS.find( ( option ) => option.value === videoType )
			?.label || videoType;

	const DeleteCorner = () => (
		<button
			type="button"
			className="academy-media-card__delete"
			onClick={ removeAll }
			aria-label={ __( 'Delete', 'academy' ) }
		>
			<span className="academy-icon academy-icon--delete" />
		</button>
	);

	return (
		<div className="academy-content-wrap academy-course-content-section--feature-intro">
			<span className="academy-heading">
				{ __( 'Add Course Media', 'academy' ) }
			</span>

			<div className="academy-course-content-section--upload">
				<AiImageGenerator
					title={ __( 'Generate Feature Image', 'academy' ) }
					courseTitle={ values.title }
					values={ values }
					setFieldValue={ guardedSetFieldValue }
				/>

				<div className="academy-media-card">
					<div
						className={ `academy-media-card__preview${
							hasVideoSet
								? ' academy-media-card__preview--video'
								: ''
						}${
							! hasVideoSet && ! hasImage
								? ' academy-media-card__preview--empty'
								: ''
						}` }
						style={
							hasImage
								? {
										backgroundImage: imageUrl
											? `url(${ imageUrl })`
											: 'none',
									}
								: undefined
						}
					>
						{ hasVideoSet ? (
							<VideoPreview type={ videoType } value={ videoValue } />
						) : (
							! hasImage && (
								<span className="academy-media-card__preview-icon">
									<span className="academy-icon academy-icon--upload" />
								</span>
							)
						) }
					</div>
					<div className="academy-media-card__details">
						<div className="academy-media-card__header">
							<div className="academy-media-card__text">
								<span className="academy-media-card__title">
									{ hasImage
										? __( 'Feature Image', 'academy' )
										: hasVideoSet
											? __( 'Intro Video', 'academy' )
											: videoTypePending
												? __(
														'Add Intro Video',
														'academy'
													)
												: __(
														'Upload a feature image or intro video.',
														'academy'
													) }
								</span>

								{ hasImage && (
									<>
										<p className="academy-media-card__desc">
											<span>
												{ __(
													'File Support:',
													'academy'
												) }
											</span>{ ' ' }
											.jpg, .jpeg, .gif, .png
										</p>
										<p className="academy-media-card__desc">
											<span>
												{ __(
													'Recommended size:',
													'academy'
												) }
											</span>{ ' ' }
											700x430 pixels
										</p>
									</>
								) }
								{ hasVideoSet && (
									<p className="academy-media-card__desc">
										{ sprintf(
											__( 'Source: %s', 'academy' ),
											videoTypeLabel
										) }
									</p>
								) }
								{ videoTypePending && (
									<p className="academy-media-card__desc">
										{ pendingDescription(
											videoType,
											videoTypeLabel
										) }
									</p>
								) }
								{ ! hasImage &&
									! hasVideoSet &&
									! videoTypePending && (
										<>
											<p className="academy-media-card__desc">
												{ __(
													'Images: .jpg, .jpeg, .gif, .png',
													'academy'
												) }
											</p>
											<p className="academy-media-card__desc">
												{ __(
													'Video: YouTube, Vimeo, MP4 and more',
													'academy'
												) }
											</p>
										</>
									) }
							</div>

							{ ( hasImage || hasVideoSet || videoTypePending ) && (
								<DeleteCorner />
							) }
						</div>

						{ videoTypePending ? (
							<VideoValueInput
								type={ videoType }
								value={ videoValue }
								onChange={ setVideoValue }
							/>
						) : (
							<ActionButtons
								activeKind={ hasImage ? 'image' : hasVideoSet ? 'video' : null }
								showOrSeparator
								onChooseImage={ chooseImage }
								onSelectVideoType={ selectVideoType }
							/>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeatureImageAndIntro;
