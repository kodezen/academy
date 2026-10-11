import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, PanelColorSettings, useBlockProps } from '@wordpress/block-editor';
import { SelectControl, Spinner, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { __, _n, sprintf } from '@wordpress/i18n';
import { starFilled } from '@wordpress/icons';
import useCourse from './shared/use-course';

function Edit( { attributes, setAttributes, context } ) {
	const { showAverage, showCount, hideWhenEmpty, starColor, emptyStarColor, starCount } = attributes;
	const { course } = useCourse( context );
	const single = 'one' === starCount;
	// What the server does with these settings: render.php drops the block
	// entirely when it is set to hide and the course has no reviews.
	const hiddenOnFront = hideWhenEmpty && 0 === Number( course?.rating?.count || 0 );
	const blockProps = useBlockProps( {
		className: [ single ? 'is-single-star' : '', hiddenOnFront ? 'academy-is-hidden-on-front' : '' ]
			.filter( Boolean )
			.join( ' ' ) || undefined,
		style: {
			...( starColor ? { '--academy-star-color': starColor } : {} ),
			...( emptyStarColor ? { '--academy-star-empty-color': emptyStarColor } : {} ),
		},
	} );

	const inspector = (
		<InspectorControls>
			<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Stars', 'academy' ) }
					value={ starCount }
					options={ [
						{ label: __( 'Five stars', 'academy' ), value: 'five' },
						{ label: __( 'One star', 'academy' ), value: 'one' },
					] }
					help={ single ? __( 'Filled once the course has a rating; pair it with the average.', 'academy' ) : undefined }
					onChange={ ( value ) => setAttributes( { starCount: value } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					className="academy-block-toggle"
					label={ __( 'Show average rating', 'academy' ) }
					checked={ showAverage }
					onChange={ ( value ) => setAttributes( { showAverage: value } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					className="academy-block-toggle"
					label={ __( 'Show number of reviews', 'academy' ) }
					checked={ showCount }
					onChange={ ( value ) => setAttributes( { showCount: value } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					className="academy-block-toggle"
					label={ __( 'Hide when there are no reviews', 'academy' ) }
					checked={ hideWhenEmpty }
					onChange={ ( value ) => setAttributes( { hideWhenEmpty: value } ) }
				/>
			</AcademyPanelBody>
			<PanelColorSettings
				__experimentalIsRenderedInSidebar
				title={ __( 'Star colours', 'academy' ) }
				colorSettings={ [
					{
						label: __( 'Filled star', 'academy' ),
						value: starColor,
						onChange: ( value ) => setAttributes( { starColor: value } ),
					},
					{
						label: __( 'Empty star', 'academy' ),
						value: emptyStarColor,
						onChange: ( value ) => setAttributes( { emptyStarColor: value } ),
					},
				] }
			/>
		</InspectorControls>
	);

	if ( ! course ) {
		return (
			<div { ...blockProps }>
				<Spinner />
			</div>
		);
	}

	const average = Number( course.rating?.average || 0 );
	const count = Number( course.rating?.count || 0 );
	// One star is filled once the course has a rating; five stars show the average.
	let fill = Math.max( 0, Math.min( 100, ( average / 5 ) * 100 ) );
	if ( single ) {
		fill = count > 0 ? 100 : 0;
	}

	return (
		<>
			{ inspector }
			<div { ...blockProps }>
				<span
					className="academy-course-rating__stars"
					role="img"
					aria-label={ sprintf(
						/* translators: %s: average rating, e.g. 4.5. */
						__( 'Rated %s out of 5', 'academy' ),
						average.toFixed( 1 )
					) }
				>
					<span
						className="academy-course-rating__fill"
						style={ {
							width: `${ fill }%`,
						} }
					/>
				</span>
				{ showAverage && (
					<span className="academy-course-rating__average">{ average.toFixed( 1 ) }</span>
				) }
				{ showCount && (
					<span className="academy-course-rating__count">
						{ sprintf(
							/* translators: %s: number of reviews. */
							_n( '(%s review)', '(%s reviews)', count, 'academy' ),
							count
						) }
					</span>
				) }
				{ hiddenOnFront && (
					<span className="academy-course-rating__editor-note">
						{ __( 'Hidden until this course has a review', 'academy' ) }
					</span>
				) }
			</div>
		</>
	);
}

registerBlockType( 'academy/course-rating', { edit: Edit, icon: starFilled } );
