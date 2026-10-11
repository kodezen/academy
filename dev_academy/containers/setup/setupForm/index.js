import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import {
	fetchSettings,
	updateSettings,
} from '@Redux/Slices/settingsSlice/settingsSlice';
import SetupContext from './../context/SetupContext';
import FormikWizardContext from './Context/FormikWizardContext';

import Button from '@Components/Button';
import SetupLayout from '../SetupLayout';
import Preloader from '@Components/Loader/Preloader';

import General from './formSteps/General';
import RoleManagement from './formSteps/RoleManagement';
import Payments from './formSteps/Payments';

import { FormikWizard } from 'formik-wizard-form';
import { __ } from '@wordpress/i18n';
import { Form } from 'formik';

Modal.setAppElement( '#academysetupscreenwrap' );

export default function SetupForm() {
	const navigate = useNavigate();
	const { addonsStatus } = useContext( SetupContext );
	const [ loading, isLoading ] = useState( false );
	const settingsFormValues = useSelector( ( state ) => state.settings.data );

	const [ modalIsOpen, setIsOpen ] = useState( false );
	const dispatch = useDispatch();

	const [ activeStepIndex, setActiveStepIndex ] = useState( () => {
		const savedStep = localStorage.getItem( 'academySetupStep' );
		return savedStep ? parseInt( savedStep, 10 ) : 0;
	} );

	useEffect( () => {
		if ( ! settingsFormValues ) {
			isLoading( true );
			dispatch( fetchSettings() ).then( () => {
				isLoading( false );
			} );
		}

		if ( localStorage.getItem( 'academySetupStep' ) ) {
			localStorage.removeItem( 'academySetupStep' );
		}
	}, [] );

	const steps = [
		{ title: __( 'General', 'academy' ), component: General },
		{ title: __( 'RoleManagement', 'academy' ), component: RoleManagement },
		{
			title: __( 'Payments', 'academy' ),
			component: ( formikProps, wizardProps ) => (
				<Payments { ...formikProps } { ...wizardProps } />
			),
		},
	];

	return (
		<>
			{ loading ? (
				<Preloader />
			) : (
				<FormikWizard
					enableReinitialize={ true }
					initialValues={ settingsFormValues }
					onSubmit={ ( values ) => {
						dispatch( updateSettings( { values } ) ).then( () => {
							setIsOpen( true );
							localStorage.removeItem( 'academySetupStep' );
						} );
					} }
					validateOnNext
					activeStepIndex={ activeStepIndex }
					steps={ steps }
				>
					{ ( {
						currentStepIndex,
						renderComponent,
						handlePrev,
						handleNext,
						isPrevDisabled,
						isLastStep,
						resetForm,
						values,
						submitForm,
					} ) => {
						const handleSaveMoveNext = async () => {
							await dispatch( updateSettings( { values } ) );
							handleNext();
						};

						return (
							<Form onSubmit={ submitForm }>
								<FormikWizardContext.Provider
									value={ {
										currentStepIndex,
										handlePrev,
										handleNext,
										isPrevDisabled,
										isLastStep,
										resetForm,
									} }
								>
									{ settingsFormValues && (
										<SetupLayout current={ 1 + currentStepIndex }>
											<div className="academy-setup-screen--fourth__container">
												{ renderComponent() }
												{ /* Payments brings its own actions, with the plugin install. */ }
												{ ! isLastStep && (
													<div className="academy-setup-screen--fourth__actions">
														<Button
															suffix="previous"
															preset="white"
															iconPosition="left"
															border="gray"
															icon={
																<span className="academy-icon academy-icon--arrow-left" />
															}
															label={ __( 'Back', 'academy' ) }
															onClick={ () =>
																isPrevDisabled
																	? navigate( '/instructor' )
																	: handlePrev()
															}
														/>
														<div className="academy-setup-screen--fourth__actions-right">
															<Button
																type="button"
																suffix="skip-general"
																label={ __( 'Skip step', 'academy' ) }
																preset="white"
																border="gray"
																onClick={ () => {
																	resetForm();
																	handleNext();
																} }
															/>
															<Button
																onClick={ () => handleSaveMoveNext() }
																label={ __( 'Next', 'academy' ) }
																iconPosition="right"
																suffix="finish-next"
																icon={
																	<span className="academy-icon academy-icon--arrow-right" />
																}
															/>
														</div>
													</div>
												) }
											</div>
										</SetupLayout>
									) }
								</FormikWizardContext.Provider>
							</Form>
						);
					} }
				</FormikWizard>
			) }
		</>
	);
}
