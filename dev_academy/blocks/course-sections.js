import { registerBlockType, store as blocksStore } from '@wordpress/blocks';
import { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	ComboboxControl,
	Placeholder,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import useAcademyStyles from './shared/use-academy-styles';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import {
	arrowDown,
	button,
	category,
	commentContent,
	file,
	grid,
	lock,
	listView,
	login,
	megaphone,
	page,
	people,
	postComments,
	postContent,
	search,
	shield,
	starHalf,
	video,
} from '@wordpress/icons';

const COLOR_VARIABLES = {
	accentColor: '--academy-primary-color',
	accentSoftColor: '--academy-secondary-color',
	surfaceColor: '--academy-surface-color',
	lineColor: '--academy-border-color',
};

// Parts of a section that get their own font size, colour and alignment.
const STYLE_GROUPS = {
	title: { label: __( 'Section title', 'academy' ), align: true },
	price: { label: __( 'Price', 'academy' ) },
	list: { label: __( 'Course details list', 'academy' ) },
};

/**
 * Academy colour variables for the editor wrapper, matching
 * Academy\Blocks::academy_colors_style().
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object.
 */
function academyColorsStyle( attributes ) {
	const style = {};
	Object.entries( COLOR_VARIABLES ).forEach( ( [ key, variable ] ) => {
		if ( attributes[ key ] ) {
			style[ variable ] = attributes[ key ];
		}
	} );
	if ( attributes.textColor || attributes.style?.color?.text ) {
		style[ '--academy-text-color' ] = 'currentColor';
		style[ '--academy-text-color-black' ] = 'currentColor';
	}
	const link = attributes.style?.elements?.link?.color?.text;
	if ( link ) {
		style[ '--academy-link-color' ] = link.startsWith( 'var:preset|color|' ) ? `var(--wp--preset--color--${ link.replace( 'var:preset|color|', '' ) })` : link;
	}
	Object.keys( STYLE_GROUPS ).forEach( ( group ) => {
		if ( attributes[ `${ group }FontSize` ] ) {
			style[ `--academy-${ group }-size` ] = `${ attributes[ `${ group }FontSize` ] }px`;
		}
		if ( attributes[ `${ group }Color` ] ) {
			style[ `--academy-${ group }-color` ] = attributes[ `${ group }Color` ];
		}
		if ( attributes[ `${ group }Align` ] ) {
			style[ `--academy-${ group }-align` ] = attributes[ `${ group }Align` ];
		}
	} );
	return style;
}

/**
 * Font size, colour and alignment for named parts of a section.
 *
 * @param {Object}   props               Props.
 * @param {string[]} props.groups        STYLE_GROUPS keys this block supports.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element[]} Panels.
 */
function SectionStyles( { groups, attributes, setAttributes } ) {
	return (
		<div style={ { gridColumn: '1 / -1' } }>
			{ groups.map( ( group ) => (
		<AcademyPanelBody key={ group } className="academy-section-styles" title={ STYLE_GROUPS[ group ].label } initialOpen={ false }>
			<RangeControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Font size (px)', 'academy' ) }
				value={ attributes[ `${ group }FontSize` ] }
				min={ 10 }
				max={ 64 }
				allowReset
				onChange={ ( value ) => setAttributes( { [ `${ group }FontSize` ]: value } ) }
			/>
			{ STYLE_GROUPS[ group ].align && (
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={ __( 'Alignment', 'academy' ) }
					value={ attributes[ `${ group }Align` ] || '' }
					options={ [
						{ label: __( 'Default', 'academy' ), value: '' },
						{ label: __( 'Left', 'academy' ), value: 'left' },
						{ label: __( 'Centre', 'academy' ), value: 'center' },
						{ label: __( 'Right', 'academy' ), value: 'right' },
					] }
					onChange={ ( value ) => setAttributes( { [ `${ group }Align` ]: value || undefined } ) }
				/>
			) }
			<PanelColorSettings
				__experimentalIsRenderedInSidebar
				title={ __( 'Colour', 'academy' ) }
				colorSettings={ [
					{
						label: __( 'Text colour', 'academy' ),
						value: attributes[ `${ group }Color` ],
						onChange: ( value ) => setAttributes( { [ `${ group }Color` ]: value } ),
					},
				] }
			/>
		</AcademyPanelBody>
			) ) }
		</div>
	);
}

// Which parts each section block lets people style separately.
const SECTION_STYLE_GROUPS = {
	'academy/course-description': [ 'title' ],
	'academy/course-additional-info': [ 'title' ],
	'academy/course-curriculum': [ 'title' ],
	'academy/course-rating-summary': [ 'title' ],
	'academy/course-enroll-card': [ 'price', 'list' ],
};

function AcademyColors( { attributes, setAttributes } ) {
	const setting = ( key, label ) => ( {
		label,
		value: attributes[ key ],
		onChange: ( value ) => setAttributes( { [ key ]: value } ),
	} );

	// A panel of its own in the Styles tab, not nested inside the Color panel.
	return (
		<InspectorControls group="styles">
			<PanelColorSettings
				__experimentalIsRenderedInSidebar
				title={ __( 'Academy colours', 'academy' ) }
				initialOpen
				colorSettings={ [
					setting( 'accentColor', __( 'Buttons and highlights', 'academy' ) ),
					setting( 'accentSoftColor', __( 'Soft highlight', 'academy' ) ),
					setting( 'surfaceColor', __( 'Card background', 'academy' ) ),
					setting( 'lineColor', __( 'Borders', 'academy' ) ),
				] }
			/>
		</InspectorControls>
	);
}

/**
 * The course to preview: the course in context, or the latest course when the
 * block sits in a template that is not tied to one course.
 *
 * @param {Object} context Block context.
 * @return {number|null|undefined} Course ID; undefined while loading.
 */
function usePreviewCourseId( context ) {
	const contextId = 'academy_courses' === context?.postType ? context.postId : null;

	return useSelect(
		( select ) => {
			if ( contextId ) {
				return contextId;
			}
			const courses = select( coreStore ).getEntityRecords( 'postType', 'academy_courses', {
				per_page: 1,
				status: 'publish',
				_fields: 'id',
				context: 'view',
			} );
			if ( ! courses ) {
				return undefined;
			}
			return courses[ 0 ]?.id ?? null;
		},
		[ contextId ]
	);
}

/**
 * Previews need the course to be editable by the current user (the block
 * renderer checks it); others see a note instead of an error.
 *
 * @param {number|null|undefined} courseId Course ID.
 * @return {boolean|undefined} Whether the preview may load.
 */
function useCanPreview( courseId ) {
	return useSelect(
		( select ) => {
			if ( ! courseId ) {
				return true;
			}
			return select( coreStore ).canUser( 'update', { kind: 'postType', name: 'academy_courses', id: courseId } );
		},
		[ courseId ]
	);
}

function Preview( { name, attributes, urlQueryArgs, empty } ) {
	const title = useSelect( ( select ) => select( blocksStore ).getBlockType( name )?.title, [ name ] );

	return (
		<ServerSideRender
			block={ name }
			attributes={ attributes }
			urlQueryArgs={ urlQueryArgs }
			skipBlockSupportAttributes
			LoadingResponsePlaceholder={ () => <Spinner /> }
			EmptyResponsePlaceholder={ () => <Placeholder label={ title } instructions={ empty } /> }
			ErrorResponsePlaceholder={ () => (
				<Placeholder label={ title } instructions={ __( 'The preview could not load. The block still works on the site.', 'academy' ) } />
			) }
		/>
	);
}

function makeSectionEdit( empty, controls = [] ) {
	return function SectionEdit( { name, attributes, setAttributes, context } ) {
		const stylesRef = useAcademyStyles();
		const blockProps = useBlockProps( { ref: stylesRef, style: academyColorsStyle( attributes ) } );
		const courseId = usePreviewCourseId( context );
		const canPreview = useCanPreview( courseId );
		const title = useSelect( ( select ) => select( blocksStore ).getBlockType( name )?.title, [ name ] );

		let body;
		if ( undefined === courseId || undefined === canPreview ) {
			body = <Spinner />;
		} else if ( null === courseId ) {
			body = <Placeholder label={ title } instructions={ __( 'Publish a course to preview this block.', 'academy' ) } />;
		} else if ( ! canPreview ) {
			body = <Placeholder label={ title } instructions={ __( 'A preview is shown to people who can edit courses. The block works on the site.', 'academy' ) } />;
		} else {
			body = <Preview name={ name } attributes={ attributes } urlQueryArgs={ { post_id: courseId } } empty={ empty } />;
		}

		return (
			<>
				{ controls.length > 0 && (
					<InspectorControls>
						<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
							{ controls
								.filter( ( control ) => ! control.when || control.when( attributes ) )
								.map( ( control ) => (
									<Control key={ control.key } control={ control } attributes={ attributes } setAttributes={ setAttributes } />
								) ) }
						</AcademyPanelBody>
					</InspectorControls>
				) }
				<AcademyColors attributes={ attributes } setAttributes={ setAttributes } />
				{ SECTION_STYLE_GROUPS[ name ] && (
					<InspectorControls>
						<SectionStyles groups={ SECTION_STYLE_GROUPS[ name ] } attributes={ attributes } setAttributes={ setAttributes } />
					</InspectorControls>
				) }
				<div { ...blockProps }>{ body }</div>
			</>
		);
	};
}

const SECTIONS = [
	[ 'academy/course-media', video, __( 'This course has no intro video or featured image.', 'academy' ) ],
	[ 'academy/course-description', postContent, __( 'This course has no description yet.', 'academy' ) ],
	[ 'academy/course-additional-info', listView, __( 'Add benefits, requirements, audience or materials to the course to show them here.', 'academy' ) ],
	[ 'academy/course-curriculum', listView, __( 'This course has no curriculum yet.', 'academy' ) ],
	[ 'academy/course-instructor-profiles', people, __( 'No instructors assigned to this course.', 'academy' ) ],
	[ 'academy/course-rating-summary', starHalf, __( 'Shown when course reviews are turned on.', 'academy' ) ],
	[ 'academy/course-reviews', postComments, __( 'Shown when course reviews are turned on.', 'academy' ) ],
	[ 'academy/course-review-form', commentContent, __( 'Shown to enrolled students who can review this course.', 'academy' ) ],
	[ 'academy/course-attachments', file, __( 'Shown to enrolled students when the course has attachments (Academy Pro).', 'academy' ) ],
	[ 'academy/course-enroll-card', button, __( 'The enroll box is not available for this course.', 'academy' ) ],
];

const POSITION = {
	key: 'justify',
	type: 'select',
	label: __( 'Position', 'academy' ),
	options: [
		{ label: __( 'Left', 'academy' ), value: 'left' },
		{ label: __( 'Centre', 'academy' ), value: 'center' },
		{ label: __( 'Right', 'academy' ), value: 'right' },
	],
	when: ( attributes ) => !! attributes.width && '100%' !== attributes.width,
};

const SECTION_CONTROLS = {
	'academy/course-media': [ { key: 'width', type: 'width', label: __( 'Width', 'academy' ) }, POSITION ],
	'academy/course-additional-info': [
		{
			key: 'layout',
			type: 'select',
			label: __( 'Layout', 'academy' ),
			options: [
				{ label: __( 'Default: what you’ll learn in a box, the rest in tabs', 'academy' ), value: 'default' },
				{ label: __( 'Tabs: every list in a tab', 'academy' ), value: 'tabs' },
				{ label: __( 'Accordion: panels that open one at a time', 'academy' ), value: 'accordion' },
			],
		},
		{ key: 'openFirst', type: 'toggle', label: __( 'Open the first panel', 'academy' ), when: ( attributes ) => 'accordion' === attributes.layout },
	],
};

SECTIONS.forEach( ( [ name, icon, empty ] ) => {
	registerBlockType( name, { icon, edit: makeSectionEdit( empty, SECTION_CONTROLS[ name ] || [] ) } );
} );

function CourseControl( { value, onChange } ) {
	const courses = useSelect(
		( select ) =>
			select( coreStore ).getEntityRecords( 'postType', 'academy_courses', {
				per_page: 100,
				status: 'publish',
				_fields: 'id,title',
				context: 'view',
			} ),
		[]
	);

	return (
		<ComboboxControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ __( 'Course', 'academy' ) }
			help={ __( 'Leave empty to use the course the block is placed on.', 'academy' ) }
			value={ value || null }
			options={ ( courses || [] ).map( ( course ) => ( {
				value: course.id,
				label: decodeEntities( course.title?.rendered || `#${ course.id }` ),
			} ) ) }
			onChange={ ( id ) => onChange( id ? Number( id ) : undefined ) }
		/>
	);
}

function PdfControl( { value, onChange } ) {
	return (
		<>
			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				type="url"
				label={ __( 'PDF address', 'academy' ) }
				value={ value ?? '' }
				onChange={ onChange }
			/>
			<MediaUploadCheck>
				<MediaUpload
					allowedTypes={ [ 'application/pdf' ] }
					onSelect={ ( media ) => onChange( media?.url ) }
					render={ ( { open } ) => (
						<Button variant="secondary" onClick={ open } style={ { marginTop: -8 } }>
							{ __( 'Choose from Media Library', 'academy' ) }
						</Button>
					) }
				/>
			</MediaUploadCheck>
		</>
	);
}

/**
 * A width as a CSS length, with quick picks for common percentages.
 *
 * @param {Object}   props          Props.
 * @param {string}   props.label    Label.
 * @param {string}   props.help     Help text.
 * @param {string}   props.value    Width, e.g. "60%" or "480px".
 * @param {Function} props.onChange Called with the new width, or undefined for full width.
 * @return {Element} Control.
 */
function WidthControl( { label, help, value, onChange } ) {
	const presets = [ '25%', '50%', '75%', '100%' ];
	return (
		<div className="academy-width-control">
			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ label }
				help={ help || __( 'A percentage, or a size such as 480px or 30rem.', 'academy' ) }
				value={ value || '' }
				placeholder={ __( 'Full width', 'academy' ) }
				onChange={ ( next ) => onChange( next.trim() || undefined ) }
			/>
			<div style={ { display: 'flex', gap: 4, marginTop: 8 } }>
				{ presets.map( ( preset ) => (
					<Button
						key={ preset }
						size="small"
						variant={ ( value || '100%' ) === preset ? 'primary' : 'secondary' }
						onClick={ () => onChange( '100%' === preset ? undefined : preset ) }
					>
						{ preset }
					</Button>
				) ) }
			</div>
		</div>
	);
}

function Control( { control, attributes, setAttributes } ) {
	const { key, label, type, help } = control;
	const value = attributes[ key ];
	const set = ( next ) => setAttributes( { [ key ]: next } );
	const shared = { __nextHasNoMarginBottom: true, label, help };

	switch ( type ) {
		case 'toggle':
			return <ToggleControl { ...shared } className="academy-block-toggle" checked={ !! value } onChange={ set } />;
		case 'range':
			return <RangeControl { ...shared } __next40pxDefaultSize value={ value } min={ control.min } max={ control.max } onChange={ set } />;
		case 'select':
			return <SelectControl { ...shared } __next40pxDefaultSize value={ value ?? control.default } options={ control.options } onChange={ set } />;
		case 'course':
			return <CourseControl value={ value } onChange={ set } />;
		case 'width':
			return <WidthControl label={ label } help={ help } value={ value } onChange={ set } />;
		case 'pdf':
			return <PdfControl value={ value } onChange={ set } />;
		default:
			return (
				<TextControl
					{ ...shared }
					__next40pxDefaultSize
					type={ 'url' === type ? 'url' : 'text' }
					placeholder={ control.placeholder }
					value={ value ?? '' }
					onChange={ set }
				/>
			);
	}
}

/**
 * Blocks with settings and a server preview.
 *
 * @param {Array}  controls Control definitions.
 * @param {Object} options  { colors, empty, preview: false for a static placeholder }.
 * @return {Function} Edit component.
 */
function makeSettingsEdit( controls, options = {} ) {
	return function SettingsEdit( { name, attributes, setAttributes, context } ) {
		const stylesRef = useAcademyStyles( options.editorStyles || [] );
		const blockProps = useBlockProps( { ref: options.academyStyles ? stylesRef : undefined, style: options.colors ? academyColorsStyle( attributes ) : undefined } );
		const title = useSelect( ( select ) => select( blocksStore ).getBlockType( name )?.title, [ name ] );
		const contextCourse = 'academy_courses' === context?.postType ? context.postId : undefined;

		let body;
		if ( false === options.preview ) {
			body = <Placeholder label={ title } instructions={ options.empty } />;
		} else if ( options.ready && ! options.ready( attributes ) ) {
			body = <Placeholder label={ title } instructions={ options.empty } />;
		} else {
			body = (
				<div inert="">
					<Preview
						name={ name }
						attributes={ attributes }
						urlQueryArgs={ contextCourse ? { post_id: contextCourse } : undefined }
						empty={ options.empty || __( 'Nothing to show.', 'academy' ) }
					/>
				</div>
			);
		}

		return (
			<>
				{ controls.length > 0 && (
					<InspectorControls>
						<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
							{ controls.filter( ( control ) => ! control.when || control.when( attributes ) ).map( ( control ) => (
								<Control key={ control.key } control={ control } attributes={ attributes } setAttributes={ setAttributes } />
							) ) }
						</AcademyPanelBody>
					</InspectorControls>
				) }
				{ options.colors && <AcademyColors attributes={ attributes } setAttributes={ setAttributes } /> }
				<div { ...blockProps }>{ body }</div>
			</>
		);
	};
}

const register = ( name, icon, controls, options = {} ) =>
	registerBlockType( name, { icon, edit: makeSettingsEdit( controls, { academyStyles: !! options.colors, ...options } ) } );

register( 'academy/course-filters', search, [
	{ key: 'showSearch', type: 'toggle', label: __( 'Search box', 'academy' ) },
	{ key: 'showCategories', type: 'toggle', label: __( 'Categories', 'academy' ) },
	{ key: 'showLevels', type: 'toggle', label: __( 'Levels', 'academy' ) },
	{ key: 'showTypes', type: 'toggle', label: __( 'Price (free or paid)', 'academy' ) },
	{ key: 'autoApply', type: 'toggle', label: __( 'Apply as soon as a choice changes', 'academy' ) },
] );

register( 'academy/course-sort', arrowDown, [
	{ key: 'showCount', type: 'toggle', label: __( 'Number of courses (on course archives)', 'academy' ) },
	{ key: 'showLabel', type: 'toggle', label: __( 'Show the “Sort by” label', 'academy' ) },
] );

register(
	'academy/login-form',
	lock,
	[
		{ key: 'formTitle', label: __( 'Form title', 'academy' ), placeholder: __( 'Log In into your Account', 'academy' ) },
		{ key: 'usernameLabel', label: __( 'Username field label', 'academy' ), placeholder: __( 'Username or Email Address', 'academy' ) },
		{ key: 'buttonLabel', label: __( 'Button text', 'academy' ), placeholder: __( 'Log In', 'academy' ) },
		{ key: 'redirectUrl', type: 'url', label: __( 'After logging in, go to', 'academy' ), help: __( 'Leave empty to stay on this page.', 'academy' ) },
		{ key: 'registerUrl', type: 'url', label: __( 'Registration page', 'academy' ) },
	],
	{ colors: true }
);

register( 'academy/student-registration-form', people, [], { colors: true } );
register( 'academy/instructor-registration-form', people, [], { colors: true } );

register(
	'academy/password-reset-form',
	lock,
	[
		{ key: 'formTitle', label: __( 'Form title', 'academy' ), placeholder: __( 'Reset Your password', 'academy' ) },
		{ key: 'usernameLabel', label: __( 'Username field label', 'academy' ), placeholder: __( 'Username or Email Address', 'academy' ) },
		{ key: 'buttonLabel', label: __( 'Button text', 'academy' ), placeholder: __( 'Get New Password', 'academy' ) },
	],
	{ colors: true }
);

register(
	'academy/enroll-form',
	button,
	[
		{ key: 'courseId', type: 'course', label: __( 'Course', 'academy' ) },
		{
			key: 'layout',
			type: 'select',
			label: __( 'Layout', 'academy' ),
			options: [
				{ label: __( 'Classic', 'academy' ), value: 'legacy' },
				{ label: __( 'Modern', 'academy' ), value: 'modern' },
			],
		},
	],
	{
		colors: true,
		empty: __( 'Choose a course, or place the block on a course page.', 'academy' ),
	}
);

register( 'academy/pdf', page, [ { key: 'src', type: 'pdf', label: __( 'PDF', 'academy' ) }, { key: 'width', type: 'width', label: __( 'Width', 'academy' ) }, { key: 'height', label: __( 'Height', 'academy' ), placeholder: '600px' } ], {
	ready: ( attributes ) => !! attributes.src,
	empty: __( 'Choose a PDF in the block settings.', 'academy' ),
} );

// The dashboard of the person editing, drawn by the server, with the
// dashboard's own styles in the canvas.
register( 'academy/student-dashboard', grid, [], {
	colors: true,
	editorStyles: [ 'dashboardStyles' ],
	empty: __( 'Students and instructors see their dashboard here: courses, progress, quizzes, certificates and settings.', 'academy' ),
} );

register(
	'academy/enrolled-courses',
	grid,
	[
		{
			key: 'show',
			type: 'select',
			label: __( 'Courses', 'academy' ),
			options: [
				{ label: __( 'All enrolled', 'academy' ), value: 'all' },
				{ label: __( 'In progress', 'academy' ), value: 'in-progress' },
				{ label: __( 'Completed', 'academy' ), value: 'completed' },
			],
		},
		{ key: 'count', type: 'range', label: __( 'Courses per page', 'academy' ), min: 1, max: 48 },
		{ key: 'columns', type: 'range', label: __( 'Columns', 'academy' ), min: 1, max: 6 },
		{ key: 'pagination', type: 'toggle', label: __( 'Pagination', 'academy' ) },
		{ key: 'showImage', type: 'toggle', label: __( 'Course image', 'academy' ) },
		{ key: 'showTopics', type: 'toggle', label: __( 'Lessons and quizzes', 'academy' ) },
		{ key: 'showEnrolled', type: 'toggle', label: __( 'Enrolled date', 'academy' ) },
		{ key: 'showButton', type: 'toggle', label: __( 'Continue button', 'academy' ) },
	],
	{ colors: true, empty: __( 'Signed-in students see the courses they are enrolled in.', 'academy' ) }
);

register(
	'academy/course-categories',
	category,
	[
		{
			key: 'layout',
			type: 'select',
			label: __( 'Layout', 'academy' ),
			default: 'cards',
			options: [
				{ label: __( 'Cards: icon above the name', 'academy' ), value: 'cards' },
				{ label: __( 'Horizontal: icon beside the name', 'academy' ), value: 'horizontal' },
				{ label: __( 'Image cards: picture on top', 'academy' ), value: 'image-cards' },
				{ label: __( 'Image tiles: name over the picture', 'academy' ), value: 'overlay' },
				{ label: __( 'Featured: the top category large', 'academy' ), value: 'featured' },
				{ label: __( 'Circles: round pictures', 'academy' ), value: 'circles' },
				{ label: __( 'Carousel: one row that scrolls', 'academy' ), value: 'carousel' },
				{ label: __( 'Pills: a row of tags', 'academy' ), value: 'pills' },
				{ label: __( 'List: one per line', 'academy' ), value: 'list' },
			],
		},
		{
			key: 'columns',
			type: 'range',
			label: __( 'Columns', 'academy' ),
			min: 1,
			max: 8,
			when: ( attributes ) => ! [ 'pills', 'list' ].includes( attributes.layout ),
			help: __( 'For the carousel: cards in view at once.', 'academy' ),
		},
		{ key: 'max', type: 'range', label: __( 'Categories to show', 'academy' ), min: 1, max: 100 },
		{ key: 'showImage', type: 'toggle', label: __( 'Category images', 'academy' ), when: ( attributes ) => ! [ 'overlay', 'featured' ].includes( attributes.layout ) },
		{ key: 'showCount', type: 'toggle', label: __( 'Number of courses', 'academy' ) },
		{ key: 'showDescription', type: 'toggle', label: __( 'Category description', 'academy' ), when: ( attributes ) => ! [ 'pills', 'circles' ].includes( attributes.layout ) },
		{ key: 'showArrow', type: 'toggle', label: __( 'Arrow', 'academy' ), when: ( attributes ) => [ 'horizontal', 'list' ].includes( attributes.layout ) },
		{ key: 'parentOnly', type: 'toggle', label: __( 'Top-level categories only', 'academy' ) },
		{ key: 'hideEmpty', type: 'toggle', label: __( 'Hide categories without courses', 'academy' ) },
	],
	{ empty: __( 'No course categories yet.', 'academy' ) }
);

register( 'academy/course-search', search, [
	{ key: 'placeholder', label: __( 'Placeholder', 'academy' ), placeholder: __( 'Search courses…', 'academy' ) },
	{ key: 'buttonText', label: __( 'Button text', 'academy' ), placeholder: __( 'Search', 'academy' ) },
	{ key: 'showButton', type: 'toggle', label: __( 'Show button', 'academy' ) },
	{ key: 'width', type: 'width', label: __( 'Width', 'academy' ) },
	{
		key: 'justify',
		type: 'select',
		label: __( 'Position', 'academy' ),
		options: [
			{ label: __( 'Left', 'academy' ), value: 'left' },
			{ label: __( 'Centre', 'academy' ), value: 'center' },
			{ label: __( 'Right', 'academy' ), value: 'right' },
		],
		when: ( attributes ) => !! attributes.width && '100%' !== attributes.width,
	},
] );

register(
	'academy/course-announcements',
	megaphone,
	[ { key: 'max', type: 'range', label: __( 'Announcements to show', 'academy' ), min: 1, max: 20 } ],
	{ colors: true, empty: __( 'Enrolled students see the latest announcements for this course here.', 'academy' ) }
);

// Blocks for Academy Pro features, offered only when the feature is on.
const optional = window.academyBlocks?.optional || [];

if ( optional.includes( 'certificate-verification' ) ) {
	register(
		'academy/certificate-verification',
		shield,
		[
			{
				key: 'layout',
				type: 'select',
				label: __( 'Layout', 'academy' ),
				options: [
					{ label: __( 'Stacked: heading, picture, then the form', 'academy' ), value: 'stacked' },
					{ label: __( 'Side by side: picture beside the form', 'academy' ), value: 'split' },
					{ label: __( 'One line: number and button in a row', 'academy' ), value: 'inline' },
					{ label: __( 'Banner: a wide band', 'academy' ), value: 'banner' },
				],
			},
			{ key: 'showHeading', type: 'toggle', label: __( 'Heading', 'academy' ) },
			{ key: 'showImage', type: 'toggle', label: __( 'Certificate picture', 'academy' ), when: ( attributes ) => [ 'stacked', 'split' ].includes( attributes.layout || 'stacked' ) },
		],
		{ colors: true }
	);
}

if ( optional.includes( 'social-login' ) ) {
	register(
		'academy/social-login',
		login,
		[
			{ key: 'isRegister', type: 'toggle', label: __( 'Use for sign-up', 'academy' ), help: __( 'New visitors get an account when they continue.', 'academy' ) },
			{
				key: 'role',
				type: 'select',
				label: __( 'New accounts are', 'academy' ),
				options: [
					{ label: __( 'Students', 'academy' ), value: 'academy_student' },
					{ label: __( 'Instructors', 'academy' ), value: 'academy_instructor' },
				],
			},
			{ key: 'showDivider', type: 'toggle', label: __( 'Show the “OR” divider', 'academy' ) },
		],
		{ empty: __( 'Google and Facebook sign-in buttons appear here once they are set up in Academy settings.', 'academy' ) }
	);
}
