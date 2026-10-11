/**
 * Editor UI for the learn page blocks. The page itself is drawn on the server
 * for a real course, so the editor shows each part as a labelled outline that
 * can be moved, styled and switched on or off.
 */
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { ComboboxControl, SelectControl, Spinner, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import { page, listView, postContent, button, header } from '@wordpress/icons';

const TEMPLATE = [
	[ 'academy/learn-topbar' ],
	[ 'academy/learn-curriculum' ],
	[ 'academy/learn-content' ],
	[ 'academy/learn-footer' ],
];

const ALLOWED = TEMPLATE.map( ( [ name ] ) => name );

/**
 * Load Academy's front-end styles into the editor canvas once, so the parts
 * look the way students see them.
 *
 * @return {Object} Ref for the block wrapper.
 */
function useLearnStyles() {
	const ref = useRef();
	useEffect( () => {
		const doc = ref.current?.ownerDocument;
		if ( ! doc ) {
			return;
		}
		const settings = window.academyBlocks || {};
		[ ...( settings.styles || [] ), ...( settings.learnStyles || [] ) ].forEach( ( href, index ) => {
			const id = `academy-learn-canvas-style-${ index }`;
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
 * A part of the learn page, drawn by the server for a real course.
 *
 * @param {Object} props            Props.
 * @param {string} props.name       Block name.
 * @param {string} props.className  Extra class.
 * @param {Object} props.attributes Block attributes.
 * @param {Object} props.context    Block context.
 * @return {JSX.Element} Part.
 */
function Part( { name, className, attributes, context } ) {
	const blockProps = useBlockProps( { className: `academy-learn-editor-part ${ className }` } );
	const course = context?.[ 'academy/previewCourse' ] || 0;

	return (
		<div { ...blockProps }>
			<div className="academy-learn-editor-part__render" inert="">
				<ServerSideRender
					block={ name }
					attributes={ attributes }
					urlQueryArgs={ course ? { academy_preview_course: course } : {} }
					LoadingResponsePlaceholder={ () => (
						<div className="academy-learn-editor-part__loading">
							<Spinner />
						</div>
					) }
				/>
			</div>
		</div>
	);
}

/**
 * The colours from Customize → Learn Page, as the CSS variables the learn page
 * blocks read. render.php prints these in a <style> inside the frame; the
 * editor draws its own frame, so without this the canvas shows none of them.
 * The canvas is always light mode, so the light set is the one that applies.
 *
 * @return {Object} Style object of CSS variables.
 */
function learnColorVars() {
	const colors = window.academyBlocks?.learn?.colors?.light || {};

	return Object.entries( colors ).reduce( ( vars, [ key, value ] ) => {
		if ( value ) {
			vars[ `--academy-learn-${ key }-color` ] = value;
		}
		return vars;
	}, {} );
}

function LearnPageEdit( { attributes, setAttributes } ) {
	const ref = useLearnStyles();
	const blockProps = useBlockProps( {
		ref,
		className: 'academy-learn academy-learn-editor is-sidebar-open',
		'data-sidebar': attributes.sidebar || window.academyBlocks?.learn?.sidebar || 'left',
		'data-width': attributes.width || window.academyBlocks?.learn?.width || 'standard',
		style: learnColorVars(),
	} );
	const courses = useSelect(
		( select ) =>
			select( coreStore ).getEntityRecords( 'postType', 'academy_courses', {
				per_page: 50,
				status: 'publish',
				_fields: 'id,title',
				context: 'view',
			} ),
		[]
	);

	return (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Preview', 'academy' ) }>
					<ComboboxControl
						__nextHasNoMarginBottom
						label={ __( 'Show this course in the editor', 'academy' ) }
						help={ __( 'Only for previewing here. Students always see the course they are taking.', 'academy' ) }
						value={ attributes.previewCourse || null }
						options={ ( courses || [] ).map( ( course ) => ( {
							value: course.id,
							label: decodeEntities( course.title?.rendered || `#${ course.id }` ),
						} ) ) }
						onChange={ ( value ) => setAttributes( { previewCourse: value ? Number( value ) : 0 } ) }
					/>
				</AcademyPanelBody>
				<AcademyPanelBody title={ __( 'Layout', 'academy' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Curriculum side', 'academy' ) }
						value={ attributes.sidebar }
						options={ [
							{ label: __( 'Use the Customize setting', 'academy' ), value: '' },
							{ label: __( 'Left', 'academy' ), value: 'left' },
							{ label: __( 'Right', 'academy' ), value: 'right' },
						] }
						onChange={ ( sidebar ) => setAttributes( { sidebar } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Content width', 'academy' ) }
						value={ attributes.width }
						options={ [
							{ label: __( 'Use the Customize setting', 'academy' ), value: '' },
							{ label: __( 'Standard', 'academy' ), value: 'standard' },
							{ label: __( 'Wide', 'academy' ), value: 'wide' },
							{ label: __( 'Focused', 'academy' ), value: 'focused' },
						] }
						onChange={ ( width ) => setAttributes( { width } ) }
					/>
				</AcademyPanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<InnerBlocks allowedBlocks={ ALLOWED } template={ TEMPLATE } templateLock={ false } />
			</div>
		</>
	);
}

registerBlockType( 'academy/learn-page', {
	icon: page,
	edit: LearnPageEdit,
	save: () => <InnerBlocks.Content />,
} );

registerBlockType( 'academy/learn-topbar', {
	icon: header,
	edit: ( { attributes, context } ) => (
		<Part name="academy/learn-topbar" className="is-topbar" attributes={ attributes } context={ context } />
	),
} );

registerBlockType( 'academy/learn-curriculum', {
	icon: listView,
	edit: ( { attributes, setAttributes, context } ) => (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Curriculum', 'academy' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						className="academy-block-toggle"
						label={ __( 'Show course progress', 'academy' ) }
						checked={ !! attributes.showProgress }
						onChange={ ( showProgress ) => setAttributes( { showProgress } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						className="academy-block-toggle"
						label={ __( 'Show lesson length', 'academy' ) }
						checked={ !! attributes.showDuration }
						onChange={ ( showDuration ) => setAttributes( { showDuration } ) }
					/>
				</AcademyPanelBody>
			</InspectorControls>
			<Part name="academy/learn-curriculum" className="is-curriculum" attributes={ attributes } context={ context } />
		</>
	),
} );

registerBlockType( 'academy/learn-content', {
	icon: postContent,
	edit: ( { attributes, context } ) => (
		<Part name="academy/learn-content" className="is-content" attributes={ attributes } context={ context } />
	),
} );

registerBlockType( 'academy/learn-footer', {
	icon: button,
	edit: ( { attributes, context } ) => (
		<Part name="academy/learn-footer" className="is-footer" attributes={ attributes } context={ context } />
	),
} );
