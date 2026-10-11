import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { TextControl, ToggleControl, SelectControl } from '@wordpress/components';
import AcademyPanelBody from './shared/panel-body';
import { __ } from '@wordpress/i18n';
import { button } from '@wordpress/icons';
import clsx from 'clsx';

function Edit( { attributes, setAttributes } ) {
	const { text, continueText, completeText, showContinue, width, action } = attributes;
	const blockProps = useBlockProps( {
		className: clsx( 'wp-element-button', { 'is-full-width': 'full' === width } ),
	} );

	return (
		<>
			<InspectorControls>
				<AcademyPanelBody title={ __( 'Settings', 'academy' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Button action', 'academy' ) }
						value={ action }
						options={ [
							{ label: __( 'Link to the course', 'academy' ), value: 'link' },
							{ label: __( 'Enroll or buy right here', 'academy' ), value: 'enroll' },
						] }
						help={
							'enroll' === action
								? __( 'Shows the enroll, add to cart or membership form from your Academy LMS store settings.', 'academy' )
								: __( 'Students go to the course page. Enrolled students continue where they stopped.', 'academy' )
						}
						onChange={ ( value ) => setAttributes( { action: value } ) }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Width', 'academy' ) }
						value={ width }
						options={ [
							{ label: __( 'Fit the text', 'academy' ), value: 'auto' },
							{ label: __( 'Full width', 'academy' ), value: 'full' },
						] }
						onChange={ ( value ) => setAttributes( { width: value } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						className="academy-block-toggle"
						label={ __( 'Enrolled students see “Continue learning”', 'academy' ) }
						help={ __( 'Links straight to the lesson they stopped at.', 'academy' ) }
						checked={ showContinue }
						onChange={ ( value ) => setAttributes( { showContinue: value } ) }
					/>
					{ showContinue && (
						<>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Text for enrolled students', 'academy' ) }
								placeholder={ __( 'Continue learning', 'academy' ) }
								value={ continueText ?? '' }
								onChange={ ( value ) => setAttributes( { continueText: value } ) }
							/>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Text after completing the course', 'academy' ) }
								placeholder={ __( 'Review course', 'academy' ) }
								value={ completeText ?? '' }
								onChange={ ( value ) => setAttributes( { completeText: value } ) }
							/>
						</>
					) }
				</AcademyPanelBody>
			</InspectorControls>
			{ 'enroll' === action ? (
				<div { ...blockProps }>
					{ __( 'Enroll / buy form', 'academy' ) }
				</div>
			) : (
			<RichText
				{ ...blockProps }
				tagName="div"
				aria-label={ __( 'Button text', 'academy' ) }
				placeholder={ __( 'View course', 'academy' ) }
				value={ text }
				allowedFormats={ [] }
				withoutInteractiveFormatting
				onChange={ ( value ) => setAttributes( { text: value } ) }
			/>
			) }
		</>
	);
}

registerBlockType( 'academy/course-enroll-button', { edit: Edit, icon: button } );
