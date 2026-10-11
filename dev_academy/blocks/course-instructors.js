import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { RangeControl, Spinner, TextControl, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { __, _n, sprintf } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import useCourse from './shared/use-course';

function Edit( { attributes, setAttributes, context } ) {
	const { showAvatar, avatarSize, prefix, maxShown } = attributes;
	const { course } = useCourse( context );
	const blockProps = useBlockProps();

	const inspector = (
		<InspectorControls>
			<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
				<ToggleControl
					__nextHasNoMarginBottom
					className="academy-block-toggle"
					label={ __( 'Show photos', 'academy' ) }
					checked={ showAvatar }
					onChange={ ( value ) => setAttributes( { showAvatar: value } ) }
				/>
				{ showAvatar && (
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Photo size', 'academy' ) }
						value={ avatarSize }
						min={ 16 }
						max={ 96 }
						onChange={ ( value ) => setAttributes( { avatarSize: value } ) }
					/>
				) }
				<RangeControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Instructors to show', 'academy' ) }
					value={ maxShown }
					min={ 1 }
					max={ 6 }
					onChange={ ( value ) => setAttributes( { maxShown: value } ) }
				/>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Text before names', 'academy' ) }
					help={ __( 'Leave empty to show only the names.', 'academy' ) }
					value={ prefix ?? __( 'By', 'academy' ) }
					onChange={ ( value ) => setAttributes( { prefix: value } ) }
				/>
			</AcademyPanelBody>
		</InspectorControls>
	);

	if ( ! course ) {
		return (
			<div { ...blockProps }>
				<Spinner />
			</div>
		);
	}

	if ( ! course.instructors?.length ) {
		return (
			<>
				{ inspector }
				<div { ...blockProps }>
					<em>{ __( 'No instructors assigned to this course.', 'academy' ) }</em>
				</div>
			</>
		);
	}

	const shown = course.instructors.slice( 0, Math.max( 1, maxShown ) );
	const extra = course.instructors.length - shown.length;
	const label = prefix ?? __( 'By', 'academy' );

	return (
		<>
			{ inspector }
			<div { ...blockProps }>
				{ showAvatar && (
					<span className="academy-course-instructors__avatars" aria-hidden="true">
						{ shown.map( ( person ) =>
							person.avatar ? (
								<img
									key={ person.id }
									src={ person.avatar }
									alt=""
									width={ avatarSize }
									height={ avatarSize }
								/>
							) : (
								<span
									key={ person.id }
									style={ {
										width: avatarSize,
										height: avatarSize,
										borderRadius: '50%',
										background: '#d8dbe2',
										display: 'block',
									} }
								/>
							)
						) }
					</span>
				) }
				<span className="academy-course-instructors__names">
					{ label && <span className="academy-course-instructors__prefix">{ label } </span> }
					{ shown.map( ( person ) => person.name ).join( ', ' ) }
					{ extra > 0 &&
						', ' +
							sprintf(
								/* translators: %s: number of other instructors. */
								_n( '%s other', '%s others', extra, 'academy' ),
								extra
							) }
				</span>
			</div>
		</>
	);
}

registerBlockType( 'academy/course-instructors', { edit: Edit, icon: people } );
