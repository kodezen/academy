/**
 * Editor UI for the dashboard blocks. Each part is drawn on the server for the
 * person editing, so the editor shows their own dashboard; the home page is
 * made of blocks that can be moved, styled and joined by any other block.
 */
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { RangeControl, SelectControl, Spinner, TextControl, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import { category, header, listView, postContent, people, chartBar, trendingUp, table } from '@wordpress/icons';

const TEMPLATE = [
	[ 'academy/dashboard-sidebar' ],
	[ 'academy/dashboard-topbar' ],
	[
		'academy/dashboard-content',
		{},
		[
			[ 'academy/dashboard-welcome' ],
			[ 'academy/dashboard-stats' ],
			[ 'academy/dashboard-continue' ],
			[ 'academy/dashboard-teaching-courses' ],
		],
	],
];

/**
 * Load Academy's front-end styles into the editor canvas once, so the parts
 * look the way people see them.
 *
 * @return {Object} Ref for the block wrapper.
 */
function useDashboardStyles() {
	const ref = useRef();
	useEffect( () => {
		const doc = ref.current?.ownerDocument;
		if ( ! doc ) {
			return;
		}
		const settings = window.academyBlocks || {};
		[ ...( settings.styles || [] ), ...( settings.dashboardStyles || [] ) ].forEach( ( href, index ) => {
			const id = `academy-dashboard-canvas-style-${ index }`;
			const loaded = [ ...doc.querySelectorAll( 'link[rel="stylesheet"]' ) ].some(
				( link ) => link.href.split( '?' )[ 0 ] === href.split( '?' )[ 0 ]
			);
			if ( doc.getElementById( id ) || loaded ) {
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

/**
 * A part of the dashboard, drawn by the server.
 *
 * @param {Object} props            Props.
 * @param {string} props.name       Block name.
 * @param {string} props.className  Extra class.
 * @param {Object} props.attributes Block attributes.
 * @return {JSX.Element} Part.
 */
function Part( { name, className = '', attributes } ) {
	const blockProps = useBlockProps( { className: `academy-dash-editor-part ${ className }` } );

	return (
		<div { ...blockProps }>
			<div inert="">
				<ServerSideRender
					block={ name }
					attributes={ attributes }
					LoadingResponsePlaceholder={ () => <Spinner /> }
					EmptyResponsePlaceholder={ () => (
						<p className="academy-dash-editor-note">
							{ __( 'Nothing to show for your account here. People who have something to show see it.', 'academy' ) }
						</p>
					) }
				/>
			</div>
		</div>
	);
}

function Toggle( { label, help, attributes, setAttributes, name } ) {
	return (
		<ToggleControl
			__nextHasNoMarginBottom
			className="academy-block-toggle"
			label={ label }
			help={ help }
			checked={ !! attributes[ name ] }
			onChange={ ( value ) => setAttributes( { [ name ]: value } ) }
		/>
	);
}

function DashboardEdit( { attributes, setAttributes } ) {
	const ref = useDashboardStyles();
	const settings = window.academyBlocks?.dashboard || {};
	const blockProps = useBlockProps( {
		ref,
		className: 'academy-dash academy-dash-editor',
		'data-sidebar': attributes.sidebar || settings.sidebar || 'left',
		style: { '--academy-dashboard-sidebar-width': `${ settings.sidebarWidth || 260 }px` },
	} );

	return (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Layout', 'academy' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Menu side', 'academy' ) }
						value={ attributes.sidebar }
						options={ [
							{ label: __( 'Left', 'academy' ), value: '' },
							{ label: __( 'Right', 'academy' ), value: 'right' },
						] }
						onChange={ ( sidebar ) => setAttributes( { sidebar } ) }
					/>
					<p className="components-base-control__help">
						{ __( 'Menu width, colours and which menu items show are set on Academy → Customize → Dashboard.', 'academy' ) }
					</p>
				</AcademyPanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<InnerBlocks template={ TEMPLATE } templateLock={ false } />
			</div>
		</>
	);
}

function ContentEdit() {
	const blockProps = useBlockProps( { className: 'academy-dash-content academy-dash-editor-content' } );
	return (
		<div { ...blockProps }>
			<p className="academy-dash-editor-note">
				{ __( 'The home page. Other pages from the menu (courses, settings…) show here in its place.', 'academy' ) }
			</p>
			<InnerBlocks templateLock={ false } />
		</div>
	);
}

registerBlockType( 'academy/dashboard', {
	icon: category,
	edit: DashboardEdit,
	save: () => <InnerBlocks.Content />,
} );

registerBlockType( 'academy/dashboard-sidebar', {
	icon: listView,
	edit: ( props ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Menu', 'academy' ) }>
					<Toggle { ...props } name="showUser" label={ __( 'Show the account menu', 'academy' ) } />
					<Toggle
						{ ...props }
						name="showViewSwitch"
						label={ __( 'Show view tabs', 'academy' ) }
						help={ __( 'For people who both learn and teach.', 'academy' ) }
					/>
					<Toggle { ...props } name="sticky" label={ __( 'Keep in view while scrolling', 'academy' ) } />
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/dashboard-sidebar" className="is-sidebar" attributes={ props.attributes } />
		</>
	),
} );

registerBlockType( 'academy/dashboard-topbar', {
	icon: header,
	edit: ( props ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Top bar', 'academy' ) }>
					<Toggle { ...props } name="showTitle" label={ __( 'Show the page title', 'academy' ) } />
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/dashboard-topbar" className="is-topbar" attributes={ props.attributes } />
		</>
	),
} );

registerBlockType( 'academy/dashboard-content', {
	icon: postContent,
	edit: ContentEdit,
	save: () => <InnerBlocks.Content />,
} );

registerBlockType( 'academy/dashboard-welcome', {
	icon: people,
	edit: ( props ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Welcome', 'academy' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Greeting', 'academy' ) }
						help={ __( 'Use {name} for the person’s first name. Empty uses the Customize text.', 'academy' ) }
						value={ props.attributes.text }
						onChange={ ( text ) => props.setAttributes( { text } ) }
					/>
					<Toggle { ...props } name="showAvatar" label={ __( 'Show their photo', 'academy' ) } />
					<Toggle { ...props } name="showDate" label={ __( 'Show today’s date', 'academy' ) } />
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/dashboard-welcome" attributes={ props.attributes } />
		</>
	),
} );

registerBlockType( 'academy/dashboard-stats', {
	icon: chartBar,
	edit: ( props ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Numbers', 'academy' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'academy' ) }
						value={ String( props.attributes.columns ) }
						options={ [
							{ label: __( 'Automatic', 'academy' ), value: '0' },
							{ label: '1', value: '1' },
							{ label: '2', value: '2' },
							{ label: '3', value: '3' },
							{ label: '4', value: '4' },
						] }
						onChange={ ( columns ) => props.setAttributes( { columns: Number( columns ) } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Style', 'academy' ) }
						value={ props.attributes.cardStyle }
						options={ [
							{ label: __( 'Card', 'academy' ), value: 'card' },
							{ label: __( 'Soft', 'academy' ), value: 'soft' },
							{ label: __( 'Minimal', 'academy' ), value: 'minimal' },
						] }
						onChange={ ( cardStyle ) => props.setAttributes( { cardStyle } ) }
					/>
					<Toggle { ...props } name="showIcons" label={ __( 'Show icons', 'academy' ) } />
					<p className="components-base-control__help">
						{ __( 'Which numbers show is set on Academy → Customize → Dashboard.', 'academy' ) }
					</p>
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/dashboard-stats" attributes={ props.attributes } />
		</>
	),
} );

registerBlockType( 'academy/dashboard-continue', {
	icon: trendingUp,
	edit: ( props ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Continue learning', 'academy' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Heading', 'academy' ) }
						placeholder={ __( 'Continue learning', 'academy' ) }
						value={ props.attributes.title }
						onChange={ ( title ) => props.setAttributes( { title } ) }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Courses', 'academy' ) }
						help={ __( '0 uses the Customize setting.', 'academy' ) }
						min={ 0 }
						max={ 12 }
						value={ props.attributes.count }
						onChange={ ( count ) => props.setAttributes( { count } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Layout', 'academy' ) }
						value={ props.attributes.layout }
						options={ [
							{ label: __( 'Grid', 'academy' ), value: 'grid' },
							{ label: __( 'List', 'academy' ), value: 'list' },
						] }
						onChange={ ( layout ) => props.setAttributes( { layout } ) }
					/>
					<Toggle { ...props } name="showImage" label={ __( 'Show course images', 'academy' ) } />
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/dashboard-continue" attributes={ props.attributes } />
		</>
	),
} );

registerBlockType( 'academy/dashboard-teaching-courses', {
	icon: table,
	edit: ( props ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Teaching courses', 'academy' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Heading', 'academy' ) }
						value={ props.attributes.title }
						onChange={ ( title ) => props.setAttributes( { title } ) }
					/>
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/dashboard-teaching-courses" attributes={ props.attributes } />
		</>
	),
} );
