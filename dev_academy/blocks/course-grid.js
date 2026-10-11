import { registerBlockVariation } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { grid } from '@wordpress/icons';

export const COURSE_GRID = 'academy/course-grid';

const cardText = { typography: { fontSize: '0.875rem' } };

/**
 * A Query Loop preset for courses. The card is plain blocks, so people can
 * reorder, remove and style every part with the editor's own controls.
 */
registerBlockVariation( 'core/query', {
	name: COURSE_GRID,
	title: __( 'Course Grid', 'academy' ),
	description: __( 'A grid of courses. Each card is built from blocks you can move and style.', 'academy' ),
	category: 'academy',
	keywords: [ __( 'courses', 'academy' ), 'lms', 'academy' ],
	icon: grid,
	scope: [ 'inserter' ],
	isActive: [ 'namespace' ],
	allowedControls: [ 'inherit', 'postCount', 'offset', 'pages', 'order', 'taxQuery', 'search', 'author', 'sticky' ],
	attributes: {
		namespace: COURSE_GRID,
		align: 'wide',
		query: {
			perPage: 6,
			pages: 0,
			offset: 0,
			postType: 'academy_courses',
			order: 'desc',
			orderBy: 'date',
			author: '',
			search: '',
			exclude: [],
			sticky: '',
			inherit: false,
		},
	},
	innerBlocks: [
		[
			'core/post-template',
			{ layout: { type: 'grid', columnCount: 3 } },
			[
				[
					'core/group',
					{
						className: 'academy-course-card',
						style: {
							border: { radius: '12px', width: '1px', style: 'solid', color: '#e4e7ee' },
							spacing: { padding: { top: '0', right: '0', bottom: '0', left: '0' }, blockGap: '0' },
							dimensions: { minHeight: '100%' },
						},
						layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch' },
					},
					[
						[
							'core/post-featured-image',
							{
								isLink: true,
								aspectRatio: '16/9',
								style: { border: { radius: { topLeft: '11px', topRight: '11px', bottomLeft: '0', bottomRight: '0' } } },
							},
						],
						[
							'core/group',
							{
								style: {
									spacing: { padding: { top: '16px', right: '18px', bottom: '18px', left: '18px' }, blockGap: '10px' },
									layout: { selfStretch: 'fill', flexSize: null },
								},
								layout: { type: 'flex', orientation: 'vertical', justifyContent: 'stretch' },
							},
							[
								[ 'core/post-terms', { term: 'academy_courses_category', style: { typography: { fontSize: '0.8125rem' } } } ],
								[
									// No font size: Customize → Shape sets the card
									// title size as a CSS default, so a size chosen
									// on this block here still wins over it.
									'core/post-title',
									{
										isLink: true,
										level: 3,
										style: { typography: { lineHeight: '1.35' }, spacing: { margin: { top: '0', bottom: '0' } } },
									},
								],
								[
									'core/post-excerpt',
									{ className: 'academy-course-card__excerpt', excerptLength: 18, style: { typography: { fontSize: '0.875rem' }, spacing: { margin: { top: '0', bottom: '0' } } } },
								],
								[ 'academy/course-instructors', { style: cardText } ],
								[ 'academy/course-meta', { style: { typography: { fontSize: '0.8125rem' } } } ],
								[
									'core/group',
									{
										style: { spacing: { margin: { top: 'auto' }, padding: { top: '10px' } } },
										layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' },
									},
									[
										[ 'academy/course-rating', { hideWhenEmpty: true, style: cardText } ],
										[ 'academy/course-price', { style: { typography: { fontSize: '1rem' } } } ],
									],
								],
							],
						],
					],
				],
			],
		],
		[ 'core/query-pagination', { layout: { type: 'flex', justifyContent: 'center' } } ],
		[ 'core/query-no-results', {}, [ [ 'core/paragraph', { content: __( 'No courses found.', 'academy' ) } ] ] ],
	],
} );

/**
 * Course Query Loops follow the Course Filters and Course Sort blocks on the
 * same page. This toggle lets a grid (say, "Popular courses") opt out.
 */
const withCourseFilterToggle = createHigherOrderComponent(
	( BlockEdit ) =>
		function CourseFilterToggle( props ) {
			const query = props.attributes?.query;
			if ( 'core/query' !== props.name || 'academy_courses' !== query?.postType ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<AcademyPanelBody title={ __( 'Course filters', 'academy' ) }>
							<ToggleControl
								__nextHasNoMarginBottom
								className="academy-block-toggle"
								label={ __( 'Follow the course filters and sorting on this page', 'academy' ) }
								help={
									query.inherit
										? __( 'This grid shows the course archive, which always follows the filters.', 'academy' )
										: __( 'Turn off for grids that should not change, such as featured courses.', 'academy' )
								}
								checked={ query.inherit || false !== query.academyFilters }
								disabled={ !! query.inherit }
								onChange={ ( value ) => props.setAttributes( { query: { ...query, academyFilters: value } } ) }
							/>
						</AcademyPanelBody>
					</InspectorControls>
				</>
			);
		},
	'withCourseFilterToggle'
);

addFilter( 'editor.BlockEdit', 'academy/course-grid-filter-toggle', withCourseFilterToggle );
