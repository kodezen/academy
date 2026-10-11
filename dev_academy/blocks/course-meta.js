import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Spinner, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { __, _n, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import useCourse from './shared/use-course';
import { metaIcons } from './shared/icons';

const TOGGLES = [
	[ 'showLessons', __( 'Lessons', 'academy' ) ],
	[ 'showDuration', __( 'Duration', 'academy' ) ],
	[ 'showLevel', __( 'Level', 'academy' ) ],
	[ 'showEnrolled', __( 'Students', 'academy' ) ],
	[ 'showIcons', __( 'Icons', 'academy' ) ],
];

function Edit( { attributes, setAttributes, context } ) {
	const { course } = useCourse( context );
	const blockProps = useBlockProps();

	const inspector = (
		<InspectorControls>
			<AcademyPanelBody title={ __( 'Show', 'academy' ) }>
				{ TOGGLES.map( ( [ key, label ] ) => (
					<ToggleControl
						__nextHasNoMarginBottom
						className="academy-block-toggle"
						key={ key }
						label={ label }
						checked={ !! attributes[ key ] }
						onChange={ ( value ) => setAttributes( { [ key ]: value } ) }
					/>
				) ) }
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

	const items = [];
	if ( attributes.showLessons && course.lessons > 0 ) {
		/* translators: %s: number of lessons. */
		items.push( [ 'lessons', sprintf( _n( '%s lesson', '%s lessons', course.lessons, 'academy' ), course.lessons ) ] );
	}
	if ( attributes.showDuration && course.duration ) {
		items.push( [ 'duration', course.duration ] );
	}
	if ( attributes.showLevel && course.level ) {
		items.push( [ 'level', course.level ] );
	}
	if ( attributes.showEnrolled ) {
		/* translators: %s: number of students. */
		items.push( [ 'enrolled', sprintf( _n( '%s student', '%s students', course.enrolled, 'academy' ), course.enrolled ) ] );
	}

	return (
		<>
			{ inspector }
			{ items.length ? (
				<ul { ...blockProps }>
					{ items.map( ( [ key, text ] ) => (
						<li key={ key } className={ `academy-course-meta__item academy-course-meta__item--${ key }` }>
							{ attributes.showIcons && metaIcons[ key ] }
							<span>{ text }</span>
						</li>
					) ) }
				</ul>
			) : (
				<div { ...blockProps }>
					<em>{ __( 'Nothing to show for this course.', 'academy' ) }</em>
				</div>
			) }
		</>
	);
}

registerBlockType( 'academy/course-meta', { edit: Edit, icon: info } );
