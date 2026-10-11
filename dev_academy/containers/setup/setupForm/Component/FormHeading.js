import React from 'react';
import { useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';

export default function FormHeading( { title, subtitle, icon, imgUrl } ) {
	const { resetForm, values, initialValues } = useFormikContext();
	return (
		<div className="academy-setup-screen--fourth__top">
			{ imgUrl ? <img src={ imgUrl } alt={ title } /> : icon }
			<div className="academy-setup-screen--fourth__heading">
				<h1 className="academy-setup-screen__title">{ title }</h1>
				<p className="academy-setup-screen__subtitle">{ subtitle }</p>
			</div>

			<div className="academy-setup-form-reset-button">
				<button
					type="button"
					onClick={ () => resetForm() }
					className={ `${
						values !== initialValues &&
						'academy-setup-form-reset-active'
					}` }
				>
					<span
						className={ `academy-icon academy-icon--Reset-Default` }
					></span>
					<span
						className={ `academy-setup-form-reset-button-text ${
							values !== initialValues &&
							'academy-setup-form-reset-active'
						}` }
					>
						{ __( 'Reset Default', 'academy' ) }
					</span>
				</button>
			</div>
		</div>
	);
}
