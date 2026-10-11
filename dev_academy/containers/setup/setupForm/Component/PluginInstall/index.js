import React, { useState, useEffect, useContext } from 'react';
import { __ } from '@wordpress/i18n';
import {
	plugin_root_url,
	makeRequest,
	is_storeengine_active,
	admin_url,
} from '@Utils/helper';
import Button from '@Components/Button';
import PreLoader from '@Components/Loader/Preloader';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import FormikWizardContext from '../../Context/FormikWizardContext';

import './styles.scss';

const PluginInstall = ({ pluginName = 'storeengine' }) => {
	const {
		handlePrev,
		handleNext,
		isPrevDisabled,
		isLastStep,
		resetForm,
		currentStepIndex,
	} = useContext(FormikWizardContext);
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [installLoading, setInstallLoading] = useState(false);
	const [isChecked, setIsChecked] = useState({ [`${pluginName}`]: true });
	const [installingPlugin, setInstallingPlugin] = useState(null);

	const [installedPlugins, setInstalledPlugins] = useState({
		storeengine: false,
	});

	const items = [
		{
			id: 'storeengine',
			show: currentStepIndex === 2,
			logo: `${plugin_root_url}assets/images/plugins-logo/storeengine.svg`,
			title: 'StoreEngine',
			subtitle:
				'The all-in-one payment plugin for WordPress. Developed by Academy LMS Team.',
			description:
				'[Note: StoreEngine is specially designed for Academy LMS, offering a native payment integration for Academy LMS with one-time & subscription payments and a membership system.]',
		},
	];

	useEffect(() => {
		if (is_storeengine_active && currentStepIndex === 2) {
			setInstalledPlugins({
				storeengine: true,
			});
		}
	}, [is_storeengine_active]);

	const installPlugin = async () => {
		setInstallLoading(true);
		await makeRequest({
			action: 'academy/install_plugins',
			plugin_slug: 'storeengine',
		}).then((res) => {
			setInstallLoading(false);
			if (res?.status === 200) {
				setInstalledPlugins({
					storeengine: true,
				});
				dispatch(
					showNotification({
						message: res?.data?.data,
						isShow: true,
						type: 'success',
					})
				);
			} else {
				dispatch(
					showNotification({
						message: res?.data?.data,
						isShow: true,
						type: 'error',
					})
				);
			}
		});
	};

	// Payments is the wizard's last step, so moving on finishes setup —
	// straight to About, which already welcomes you and shows what's next.
	const goNext = () => {
		handleNext();
		if (isLastStep) {
			window.location.href = `${admin_url}admin.php?page=academy-about`;
		}
	};

	const handleNextClick = async () => {
		if (installedPlugins.storeengine && currentStepIndex === 2) {
			goNext();
		} else if (isChecked.storeengine && currentStepIndex === 2) {
			await installPlugin().then(() => {
				goNext();
			});
		} else {
			goNext();
		}
	};

	const isInstalledAndActive =
		is_storeengine_active && installedPlugins.storeengine;
	const btnLabel = !isInstalledAndActive
		? isLastStep
			? __('Install & Finish', 'academy')
			: __('Install & Next', 'academy')
		: isLastStep
			? __('Finish', 'academy')
			: __('Next', 'academy');
	const nextBtnLabel =
		isChecked.storeengine
			? btnLabel
			: __('Finish', 'academy');

	return (
		<div className="academy-install-plugin">
			{isLoading ? (
				<div className="academy-install-plugin__loading">
					<span className="academy-install-plugin__loading-spinner"></span>
					<p>{__('Checking installed plugins…', 'academy')}</p>
				</div>
			) : (
				<>
					{items
						.filter((item) => item.show)
						.map((item) => (
							<div
								key={item.id}
								className="academy-install-plugin__item"
							>
								<div className="academy-install-plugin__top">
									<input
										type="checkbox"
										name={`install_${item.id}`}
										checked={
											isChecked[item.id] ||
											installedPlugins[item.id]
										}
										onChange={() =>
											setIsChecked({
												[item.id]: !isChecked[item.id],
											})
										}
										disabled={
											installLoading ||
											installingPlugin === item.id ||
											installedPlugins[item.id]
										}
									/>
									<div className="academy-install-plugin__left">
										<img src={item.logo} alt={item.title} />
										<h3 className="academy-install-plugin__label">
											<span className="academy-install-plugin__title">
												{item.title}
											</span>
											<span className="academy-install-plugin__subtitle">
												{item.subtitle}
											</span>
										</h3>
									</div>
									{installedPlugins[item.id] && (
										<div className="academy-install-plugin__status">
											<span className="academy-install-plugin__installed">
												{__('Installed', 'academy')}
											</span>
										</div>
									)}
									{installLoading && (
										<div className="academy-install-plugin__status">
											<span className="academy-install-plugin__installing">
												<PreLoader />{' '}
												{__('Installing…', 'academy')}
											</span>
										</div>
									)}
								</div>
							</div>
						))}
					<div className="academy-setup-screen--fourth__actions academy-setup-screen--fourth--plugin-insatller-footer">
						<Button
							suffix={`${
								isPrevDisabled ? 'disabled' : 'previous'
							}`}
							preset="white"
							iconPosition="left"
							border="gray"
							icon={
								<span className="academy-icon academy-icon--arrow-left" />
							}
							label={__('Back', 'academy')}
							onClick={handlePrev}
						/>
						<div className="academy-setup-screen--fourth__actions-right">
							<Button
								suffix="skip-general"
								label={__('Skip step', 'academy')}
								preset="white"
								border="gray"
								onClick={() => {
									if (isLastStep) {
										handleNext();
										window.location.href = `${admin_url}admin.php?page=academy-about`;
									} else {
										resetForm();
										handleNext();
									}
								}}
							/>
							<Button
								onClick={handleNextClick}
								label={nextBtnLabel}
								iconPosition="right"
								suffix="finish-next"
								isLoading={installLoading}
								icon={
									<span className="academy-icon academy-icon--arrow-right" />
								}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default PluginInstall;
