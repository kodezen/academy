import React, { useContext, useState, useEffect } from 'react';
import { makeRequest, plugin_root_url } from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import Button from '@Components/Button';
import SetupContext from '../../context/SetupContext';
import { __, sprintf } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { fetchSettings } from '@Redux/Slices/settingsSlice/settingsSlice';
import { useSelector, useDispatch } from 'react-redux';
import SetupLayout from '../../SetupLayout';
import './styles.scss';

const propTypes = {};

const cardDatas = [
	{
		title: __( 'Individual', 'academy' ),
		slug: 'individual',
		description: __(
			'Share your knowledge individually as a Single Instructor ',
			'academy'
		),
		imgUrl: 'assets/images/setup/individual3.0.svg',
	},
	{
		title: __( 'Marketplace', 'academy' ),
		slug: 'marketplace',
		description: __(
			'Enter the marketplace with your eLearning platform and let your Instructors earn',
			'academy'
		),
		imgUrl: 'assets/images/setup/marketplace3.0.svg',
	},
];

export default function Instructor() {
	const navigate = useNavigate();
	const settingsFormValues = useSelector( ( state ) => state.settings.data );
	const { addonsStatus, saveAddonsStatusHandler } = useContext( SetupContext );
	const [ isLoading, setIsloading ] = useState( false );
	const [ selectedCardName, setSelectedCardName ] = useState(
		addonsStatus.multi_instructor ? 'marketplace' : 'individual'
	);
	const dispatch = useDispatch();
	const cardSelectionHandler = ( name ) => {
		setSelectedCardName( name );
	};
	const redirectToPreviousPageHandler = () => {
		setTimeout( () => {
			navigate( '/' );
		}, 500 );
	};

	useEffect( () => {
		if ( ! settingsFormValues ) {
			dispatch( fetchSettings() );
		}
	}, [] );

	const redirectSettingsPageHandler = () => {
		const status = selectedCardName === 'marketplace' ? true : false;
		const params = {
			addon_name: 'Multi Instructor',
			addon_slug: 'multi_instructor',
			status,
			required_plugin: false,
		};
		setTimeout( () => {
			navigate( '/settings' );
		}, 500 );
		setIsloading( true );
		makeRequest( {
			action: 'academy/addons/saved_addon_status',
			...params,
		} ).then( ( response ) => {
			setIsloading( false );
			if ( response.data.success ) {
				saveAddonsStatusHandler( 'multi_instructor', status );
			} else {
				dispatch(
					showNotification( {
						message: sprintf(
							// translators: %s: AddonName
							__( 'Failed To Saved %s', 'academy' ),
							selectedCardName
						),
						isShow: true,
						type: 'error',
					} )
				);
			}
		} );
	};

	return (
		<SetupLayout current={ 0 }>

			<div className="academy-setup-screen--second">
				<div className="academy-setup-screen--second__top">
					<img
						className="academy-entry-top-icon"
						src={ `${ plugin_root_url }assets/images/setup/briefcase.svg` }
						alt={ __( 'instructor', 'academy' ) }
					/>
					<h2 className="academy-setup-screen__title">
						{ __( 'Choose your business type', 'academy' ) }
					</h2>
					<span className="academy-setup-screen__subtitle">
						{ __(
							'Select the model that best suits your eLearning journey.',
							'academy'
						) }
					</span>
				</div>

				<div className="academy-setup-screen--second__cards">
					{ cardDatas.map( ( item, index ) => (
						<div
							className={ `academy-setup-screen--second__card ${
								selectedCardName === item.slug &&
								'academy-setup-screen--second__card--selected'
							}` }
							key={ index }
							onClick={ () => cardSelectionHandler( item.slug ) }
							role="presentation"
						>
							<div className="academy-setup-screen--second__card-input academy-radio-custom">
								<input
									type="radio"
									checked={ selectedCardName === item.slug }
								/>
								<span className="academy-radio-custom academy-radio-custom--mod"></span>
							</div>
							<div className="academy-setup-screen--second__img">
								<img
									src={ `${ plugin_root_url }${ item.imgUrl }` }
									alt={ item.title }
								/>
							</div>

							<div className="academy-setup-screen-title-subtitle">
								<span className="academy-setup-screen-title">
									{ item.title }
								</span>
								<span className="academy-setup-screen-subtitle">
									{ item.description }
								</span>
							</div>
						</div>
					) ) }
				</div>

				<div className="academy-setup-screen--second__bottom">
					<Button
						label={ __( 'Back', 'academy' ) }
						icon={
							<span className="academy-icon academy-icon--angle-left" />
						}
						preset="transparent"
						border="gray"
						suffix="back-business-type"
						onClick={ redirectToPreviousPageHandler }
					/>
					<Button
						suffix="continue"
						isLoading={ isLoading }
						onClick={ redirectSettingsPageHandler }
						iconPosition="right"
						icon={ <span className="academy-icon academy-icon--arrow-right" /> }
						label={ __( 'Next', 'academy' ) }
					/>
				</div>
			</div>
		</SetupLayout>
	);
}

Instructor.propTypes = propTypes;
