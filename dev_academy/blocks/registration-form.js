/**
 * Registration Form and Form Field blocks: a sign-up form for students or
 * instructors, laid out and worded in the block editor. What a sign-up must
 * contain is checked on the server against the saved blocks.
 */
import { createBlock, registerBlockType } from '@wordpress/blocks';
import {
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
	InnerBlocks,
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { Button, Notice, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { people } from '@wordpress/icons';


// Fields that make the account; everything else is a profile field.
const BASIC = [ 'first-name', 'last-name', 'email', 'confirm-email', 'password', 'confirm-password' ];
// The sign-up can't work without these.
const ACCOUNT = [ 'email', 'password', 'confirm-password' ];
const CHOICES = [ 'select', 'radio', 'checkbox' ];

// Keys kept for Academy's own account settings (matches the server's list).
const isReserved = ( name ) => {
	const key = String( name || '' ).replace( /-/g, '_' );
	return (
		/^(instructor_|is_academy|student_|dashboard_|menu_|guardian|earning|withdraw|capabilit|user_level|role)/.test( key ) ||
		[ 'form_id', 'profile_photo', 'cover_photo', 'status' ].includes( key )
	);
};

const TYPES = [
	{ label: __( 'Text', 'academy' ), value: 'text' },
	{ label: __( 'Paragraph', 'academy' ), value: 'textarea' },
	{ label: __( 'Email', 'academy' ), value: 'email' },
	{ label: __( 'Phone', 'academy' ), value: 'tel' },
	{ label: __( 'Number', 'academy' ), value: 'number' },
	{ label: __( 'Date', 'academy' ), value: 'date' },
	{ label: __( 'Website', 'academy' ), value: 'url' },
	{ label: __( 'Dropdown', 'academy' ), value: 'select' },
	{ label: __( 'Choose one', 'academy' ), value: 'radio' },
	{ label: __( 'Checkboxes', 'academy' ), value: 'checkbox' },
];

const field = ( name, fieldType, label, extra = {} ) => [ 'academy/form-field', { name, fieldType, label, ...extra } ];

const TEMPLATE = [
	field( 'first-name', 'text', __( 'First name', 'academy' ), { width: 'half', placeholder: __( 'First name', 'academy' ) } ),
	field( 'last-name', 'text', __( 'Last name', 'academy' ), { width: 'half', placeholder: __( 'Last name', 'academy' ) } ),
	field( 'email', 'email', __( 'Email', 'academy' ), { required: true, placeholder: __( 'you@example.com', 'academy' ) } ),
	field( 'password', 'password', __( 'Password', 'academy' ), { required: true, width: 'half' } ),
	field( 'confirm-password', 'password', __( 'Confirm password', 'academy' ), { required: true, width: 'half' } ),
];

const newId = () =>
	window.crypto?.randomUUID ? window.crypto.randomUUID() : `form-${ Date.now().toString( 36 ) }-${ Math.random().toString( 36 ).slice( 2, 8 ) }`;

const slug = ( text ) =>
	String( text || '' )
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' )
		.slice( 0, 40 );

/**
 * Every Registration Form block in the editor, in document order.
 *
 * @param {Array} blocks Blocks.
 * @return {Array} Forms.
 */
const findForms = ( blocks ) =>
	blocks.flatMap( ( block ) => [
		...( 'academy/registration-form' === block.name ? [ block ] : [] ),
		...findForms( block.innerBlocks || [] ),
	] );

/**
 * Names of the Form Field blocks inside a block.
 *
 * @param {Object} block Block.
 * @return {Array} Names.
 */
const fieldNames = ( block ) =>
	( block?.innerBlocks || [] ).flatMap( ( inner ) => [
		...( 'academy/form-field' === inner.name ? [ inner.attributes.name ] : [] ),
		...fieldNames( inner ),
	] );

function RegistrationFormEdit( { attributes, setAttributes, clientId } ) {
	const { role, formId, submitLabel, redirectUrl, showLoginLink, buttonColor } = attributes;
	const { forms, self } = useSelect(
		( select ) => {
			const editor = select( 'core/block-editor' );
			return { forms: findForms( editor.getBlocks() ), self: editor.getBlock( clientId ) };
		},
		[ clientId ]
	);

	// Each form needs its own ID, including a copy of another form.
	useEffect( () => {
		const first = forms.find( ( form ) => form.attributes.formId === formId );
		if ( ! formId || ( first && first.clientId !== clientId ) ) {
			setAttributes( { formId: newId() } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ formId, forms.length ] );

	const names = fieldNames( self );
	const missing = ACCOUNT.filter( ( name ) => ! names.includes( name ) );
	const label = submitLabel || ( 'instructor' === role ? __( 'Register as Instructor', 'academy' ) : __( 'Register as Student', 'academy' ) );
	// This block uses live InnerBlocks editing, not ServerSideRender, so
	// render.php (and its --academy-text-color-black:currentColor, which
	// .academy-reg-form__label listens for) never runs in the editor —
	// core's own text-color style lands on this wrapper via useBlockProps()
	// regardless, but the Academy variable the label CSS depends on needs
	// setting here too, or picking a color has no visible effect while
	// editing even though it works once saved and viewed on the front end.
	const blockProps = useBlockProps( {
		className: 'academy-reg-block academy-reg-editor',
		style: attributes.textColor || attributes.style?.color?.text
			? { '--academy-text-color': 'currentColor', '--academy-text-color-black': 'currentColor' }
			: undefined,
	} );
	const colorSettings = useMultipleOriginColorsAndGradients();

	return (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Form', 'academy' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Signs up', 'academy' ) }
						value={ role }
						options={ [
							{ label: __( 'Students', 'academy' ), value: 'student' },
							{ label: __( 'Instructors', 'academy' ), value: 'instructor' },
						] }
						onChange={ ( value ) => setAttributes( { role: value } ) }
						help={ __( 'New instructors wait for approval unless you approve them automatically in Settings.', 'academy' ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Button', 'academy' ) }
						placeholder={ label }
						value={ submitLabel }
						onChange={ ( value ) => setAttributes( { submitLabel: value } ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						type="url"
						label={ __( 'After signing up, go to', 'academy' ) }
						help={ __( 'Empty: the dashboard.', 'academy' ) }
						placeholder="https://"
						value={ redirectUrl }
						onChange={ ( value ) => setAttributes( { redirectUrl: value } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						className="academy-block-toggle"
						label={ __( 'Show a log in link', 'academy' ) }
						checked={ !! showLoginLink }
						onChange={ ( value ) => setAttributes( { showLoginLink: value } ) }
					/>
				</AcademyPanelBody>
			</InspectorControls>
			{ /* A row of the block's Color panel, like its own colours, not a panel inside it. */ }
			<InspectorControls group="color">
				<ColorGradientSettingsDropdown
					__experimentalIsRenderedInSidebar
					panelId={ clientId }
					settings={ [
						{
							label: __( 'Button', 'academy' ),
							colorValue: buttonColor,
							onColorChange: ( value ) => setAttributes( { buttonColor: value } ),
							isShownByDefault: true,
							resetAllFilter: () => ( { buttonColor: undefined } ),
							clearable: true,
							enableAlpha: true,
						},
					] }
					{ ...colorSettings }
				/>
			</InspectorControls>
			<div { ...blockProps }>
				{ missing.length > 0 && (
					<Notice status="warning" isDismissible={ false }>
						{ sprintf(
							/* translators: %s: missing field names. */
							__( 'Add these fields, or no one can sign up: %s. Use the + inside the form.', 'academy' ),
							missing.join( ', ' )
						) }
					</Notice>
				) }
				<div className="academy-reg-form">
					<div className="academy-reg-form__fields">
						<InnerBlocks
							allowedBlocks={ [ 'academy/form-field', 'core/paragraph', 'core/heading', 'core/separator' ] }
							template={ TEMPLATE }
							templateLock={ false }
						/>
					</div>
					<div className="academy-reg-form__footer">
						<button
							type="button"
							className="academy-btn academy-btn--bg-purple academy-reg-form__submit"
							style={ buttonColor ? { backgroundColor: buttonColor } : undefined }
							tabIndex={ -1 }
						>
							{ label }
						</button>
						{ showLoginLink && (
							<p className="academy-reg-form__login">
								{ __( 'Already have an account?', 'academy' ) } <a href="#login">{ __( 'Log in', 'academy' ) }</a>
							</p>
						) }
					</div>
				</div>
			</div>
		</>
	);
}

/**
 * Choices of a dropdown, radio or checkbox field.
 *
 * @param {Object}   props          Props.
 * @param {Array}    props.options  { label, value }.
 * @param {Function} props.onChange Update them.
 * @return {JSX.Element} Editor.
 */
function OptionsEditor( { options, onChange } ) {
	const update = ( index, changes ) => onChange( options.map( ( option, i ) => ( i === index ? { ...option, ...changes } : option ) ) );

	return (
		<div className="academy-field-options">
			{ options.map( ( option, index ) => (
				<div key={ index } style={ { display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 8 } }>
					<TextControl
						__nextHasNoMarginBottom
						label={ 0 === index ? __( 'Choice', 'academy' ) : undefined }
						value={ option.label }
						onChange={ ( value ) =>
							update( index, {
								label: value,
								// The value follows the wording until it's set by hand.
								value: ! option.value || option.value === slug( option.label ) ? slug( value ) : option.value,
							} )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ 0 === index ? __( 'Saved as', 'academy' ) : undefined }
						value={ option.value }
						onChange={ ( value ) => update( index, { value: slug( value ) } ) }
					/>
					<Button
						icon="no-alt"
						label={ __( 'Remove choice', 'academy' ) }
						onClick={ () => onChange( options.filter( ( item, i ) => i !== index ) ) }
					/>
				</div>
			) ) }
			<Button variant="secondary" onClick={ () => onChange( [ ...options, { label: '', value: '' } ] ) }>
				{ __( 'Add a choice', 'academy' ) }
			</Button>
		</div>
	);
}

/**
 * What the field looks like on the page.
 *
 * @param {Object} props            Props.
 * @param {Object} props.attributes Field attributes.
 * @return {JSX.Element} Preview.
 */
function FieldPreview( { attributes } ) {
	const { fieldType, placeholder, options } = attributes;
	if ( 'textarea' === fieldType ) {
		return <textarea className="academy-form-control" rows={ 3 } placeholder={ placeholder } readOnly tabIndex={ -1 } />;
	}
	if ( 'select' === fieldType ) {
		return (
			<select className="academy-form-control academy-reg-form__select" tabIndex={ -1 } disabled>
				<option>{ placeholder || __( 'Choose…', 'academy' ) }</option>
			</select>
		);
	}
	if ( 'radio' === fieldType || ( 'checkbox' === fieldType && options.length ) ) {
		return (
			<div className="academy-reg-form__choices">
				{ ( options.length ? options : [ { label: __( 'Add choices in the settings', 'academy' ) } ] ).map( ( option, index ) => (
					<span key={ index } className="academy-reg-form__choice">
						<input type={ fieldType } disabled tabIndex={ -1 } />
						<span>{ option.label }</span>
					</span>
				) ) }
			</div>
		);
	}
	if ( 'checkbox' === fieldType ) {
		return null;
	}
	return (
		<div className="academy-reg-form__control">
			<input className="academy-form-control" type={ fieldType } placeholder={ placeholder } readOnly tabIndex={ -1 } />
		</div>
	);
}

function FormFieldEdit( { attributes, setAttributes, clientId } ) {
	const { name, fieldType, label, placeholder, help, required, width, options } = attributes;
	const isBasic = BASIC.includes( name );
	const isAccount = ACCOUNT.includes( name );
	const single = 'checkbox' === fieldType && ! options.length;
	const siblings = useSelect(
		( select ) => {
			const editor = select( 'core/block-editor' );
			const formId = editor.getBlockParentsByBlockName( clientId, 'academy/registration-form', true )[ 0 ];
			return formId ? fieldNames( editor.getBlock( formId ) ) : [];
		},
		[ clientId ]
	);
	const taken = siblings.filter( ( item ) => item === name ).length > 1;
	const reserved = ! BASIC.includes( name ) && isReserved( name );

	// A new profile field gets a key from its label.
	useEffect( () => {
		if ( ! name ) {
			setAttributes( { name: slug( label ) || `field-${ Math.random().toString( 36 ).slice( 2, 7 ) }` } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const blockProps = useBlockProps( {
		className: `academy-form-group academy-reg-form__field academy-field-editor${ 'half' === width ? ' is-half' : '' }`,
	} );
	const star = ( required || isAccount ) && <span className="academy-reg-form__required"> *</span>;

	return (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Field', 'academy' ) }>
					{ ! isBasic && (
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Type', 'academy' ) }
							value={ fieldType }
							options={ TYPES }
							onChange={ ( value ) => setAttributes( { fieldType: value } ) }
						/>
					) }
					<TextControl __nextHasNoMarginBottom label={ __( 'Label', 'academy' ) } value={ label } onChange={ ( value ) => setAttributes( { label: value } ) } />
					{ ! [ 'radio', 'checkbox' ].includes( fieldType ) && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Placeholder', 'academy' ) }
							value={ placeholder }
							onChange={ ( value ) => setAttributes( { placeholder: value } ) }
						/>
					) }
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Help text', 'academy' ) }
						value={ help }
						onChange={ ( value ) => setAttributes( { help: value } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						className="academy-block-toggle"
						label={ __( 'Required', 'academy' ) }
						help={ isAccount ? __( 'Every account needs this.', 'academy' ) : undefined }
						checked={ isAccount || !! required }
						disabled={ isAccount }
						onChange={ ( value ) => setAttributes( { required: value } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Width', 'academy' ) }
						value={ width }
						options={ [
							{ label: __( 'Full row', 'academy' ), value: 'full' },
							{ label: __( 'Half row', 'academy' ), value: 'half' },
						] }
						onChange={ ( value ) => setAttributes( { width: value } ) }
					/>
					{ ! isBasic && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Saved as', 'academy' ) }
							help={ sprintf(
								/* translators: %s: user meta key. */
								__( 'Kept on the person’s profile as academy_%s.', 'academy' ),
								name || 'field'
							) }
							value={ name }
							onChange={ ( value ) => setAttributes( { name: slug( value ) } ) }
						/>
					) }
				</AcademyPanelBody>
				{ CHOICES.includes( fieldType ) && (
					<AcademyPanelBody title={ __( 'Choices', 'academy' ) }>
						{ 'checkbox' === fieldType && (
							<p className="components-base-control__help">
								{ __( 'No choices: one checkbox, such as “I agree to the terms”.', 'academy' ) }
							</p>
						) }
						<OptionsEditor options={ options } onChange={ ( value ) => setAttributes( { options: value } ) } />
					</AcademyPanelBody>
				) }
			</InspectorControls>
			<div { ...blockProps }>
				{ single ? (
					<span className="academy-reg-form__choice">
						<input type="checkbox" disabled tabIndex={ -1 } />
						<RichText
							tagName="span"
							value={ label }
							allowedFormats={ [] }
							placeholder={ __( 'I agree to the terms', 'academy' ) }
							onChange={ ( value ) => setAttributes( { label: value } ) }
						/>
						{ star }
					</span>
				) : (
					<span className="academy-reg-form__label">
						<RichText
							tagName="span"
							value={ label }
							allowedFormats={ [] }
							placeholder={ __( 'Label', 'academy' ) }
							onChange={ ( value ) => setAttributes( { label: value } ) }
						/>
						{ star }
					</span>
				) }
				<FieldPreview attributes={ attributes } />
				{ help && <p className="academy-reg-form__help">{ help }</p> }
				{ reserved && (
					<Notice status="error" isDismissible={ false }>
						{ __( 'This “Saved as” is kept for Academy’s own settings, so the field is left out. Choose another in the settings.', 'academy' ) }
					</Notice>
				) }
				{ taken && (
					<Notice status="error" isDismissible={ false }>
						{ __( 'Another field is saved the same way. Give each field its own “Saved as” in the settings.', 'academy' ) }
					</Notice>
				) }
			</div>
		</>
	);
}

const fromClassic = ( role ) => ( {
	type: 'block',
	blocks: [ `academy/${ role }-registration-form` ],
	transform: () =>
		createBlock(
			'academy/registration-form',
			{ role },
			TEMPLATE.map( ( [ blockName, attrs ] ) => createBlock( blockName, attrs ) )
		),
} );

registerBlockType( 'academy/registration-form', {
	icon: people,
	edit: RegistrationFormEdit,
	save: () => <InnerBlocks.Content />,
	transforms: { from: [ fromClassic( 'student' ), fromClassic( 'instructor' ) ] },
} );

const preset = ( variation, title, attributes, description ) => ( {
	name: variation,
	title,
	description,
	attributes,
	scope: [ 'inserter' ],
	isActive: ( blockAttributes ) =>
		BASIC.includes( attributes.name ) ? blockAttributes.name === attributes.name : ! BASIC.includes( blockAttributes.name ) && blockAttributes.fieldType === attributes.fieldType,
} );

registerBlockType( 'academy/form-field', {
	icon: 'feedback',
	edit: FormFieldEdit,
	variations: [
		preset( 'first-name', __( 'First name', 'academy' ), { name: 'first-name', fieldType: 'text', label: __( 'First name', 'academy' ), width: 'half' } ),
		preset( 'last-name', __( 'Last name', 'academy' ), { name: 'last-name', fieldType: 'text', label: __( 'Last name', 'academy' ), width: 'half' } ),
		preset( 'email', __( 'Email', 'academy' ), { name: 'email', fieldType: 'email', label: __( 'Email', 'academy' ), required: true } ),
		preset( 'confirm-email', __( 'Confirm email', 'academy' ), { name: 'confirm-email', fieldType: 'email', label: __( 'Confirm email', 'academy' ), required: true } ),
		preset( 'password', __( 'Password', 'academy' ), { name: 'password', fieldType: 'password', label: __( 'Password', 'academy' ), required: true } ),
		preset( 'confirm-password', __( 'Confirm password', 'academy' ), {
			name: 'confirm-password',
			fieldType: 'password',
			label: __( 'Confirm password', 'academy' ),
			required: true,
		} ),
		preset( 'text', __( 'Text field', 'academy' ), { fieldType: 'text', label: __( 'Text', 'academy' ), name: '' }, __( 'A profile field, with Academy Pro.', 'academy' ) ),
		preset( 'textarea', __( 'Paragraph field', 'academy' ), { fieldType: 'textarea', label: __( 'About you', 'academy' ), name: 'about' } ),
		preset( 'tel', __( 'Phone field', 'academy' ), { fieldType: 'tel', label: __( 'Phone number', 'academy' ), name: 'phone-number' } ),
		preset( 'url', __( 'Website field', 'academy' ), { fieldType: 'url', label: __( 'Website', 'academy' ), name: 'website' } ),
		preset( 'date', __( 'Date field', 'academy' ), { fieldType: 'date', label: __( 'Date of birth', 'academy' ), name: 'date-of-birth' } ),
		preset( 'number', __( 'Number field', 'academy' ), { fieldType: 'number', label: __( 'Number', 'academy' ), name: '' } ),
		preset( 'select', __( 'Dropdown field', 'academy' ), {
			fieldType: 'select',
			label: __( 'Choose one', 'academy' ),
			name: '',
			options: [
				{ label: __( 'Option one', 'academy' ), value: 'option-one' },
				{ label: __( 'Option two', 'academy' ), value: 'option-two' },
			],
		} ),
		preset( 'radio', __( 'Choice field', 'academy' ), {
			fieldType: 'radio',
			label: __( 'Choose one', 'academy' ),
			name: '',
			options: [
				{ label: __( 'Option one', 'academy' ), value: 'option-one' },
				{ label: __( 'Option two', 'academy' ), value: 'option-two' },
			],
		} ),
		preset( 'checkbox', __( 'Checkbox field', 'academy' ), {
			fieldType: 'checkbox',
			label: __( 'I agree to the terms', 'academy' ),
			name: 'terms',
			required: true,
		} ),
	],
} );
