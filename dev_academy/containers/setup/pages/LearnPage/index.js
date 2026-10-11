import React, { useContext, useState } from 'react';
import { admin_url, plugin_root_url } from '@Utils/helper';
import Button from '@Components/Button';
import SetupContext from '../../context/SetupContext';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import './styles.scss';

const propTypes = {};

const cardDatas = [
	{
		title: __('Default', 'academy'),
		slug: 'individual',
		description: __(
			'Start with our default settings for straightforward learning.',
			'academy'
		),
		imgUrl: 'assets/images/setup/default-image-lp.svg',
	},
	{
		title: __('Integrating external plugins', 'academy'),
		slug: 'marketplace',
		description: __(
			'Expand learning capabilities using external plugins.',
			'academy'
		),
		imgUrl: 'assets/images/setup/integration-external-plugins.svg',
	},
];

export default function LearnPage() {
	const navigate = useNavigate();
	const { addonsStatus } = useContext(SetupContext);
	const [selectedCardName, setSelectedCardName] = useState(
		addonsStatus.multi_instructor ? 'marketplace' : 'individual'
	);
	const cardSelectionHandler = (name) => {
		setSelectedCardName(name);
	};

	const redirectSettingsPageHandler = () => {
		navigate('/settings');
	};

	return (
		<React.Fragment>
			<div className="academy-setup-screen--third">
				<div className="academy-setup-screen--third__top">
					<h2 className="academy-setup-screen__title">
						{__('Select learn page settings', 'academy')}
					</h2>
					<span className="academy-setup-screen__subtitle">
						{__(
							'Select the model that best suits your eLearning journey.',
							'academy'
						)}
					</span>
				</div>

				<div className="academy-setup-screen--third__cards">
					{cardDatas.map((item, index) => (
						<div
							className={`academy-setup-screen--third__card ${
								selectedCardName === item.slug &&
								'academy-setup-screen--third__card--selected'
							}`}
							key={index}
							onClick={() => cardSelectionHandler(item.slug)}
							role="presentation"
						>
							{/* <div className="academy-radio-input">
								<span className="academy-icon-hover"></span>
								<span className="academy-icon academy-icon--check"></span>
							</div> */}
							<div className="academy-setup-screen--third__img">
								<img
									src={`${plugin_root_url}${item.imgUrl}`}
									alt={item.title}
								/>
							</div>

							<div className="academy-setup-screen-title-subtitle">
								<span className="academy-setup-screen-title">
									{item.title}
								</span>
								<span className="academy-setup-screen-subtitle">
									{item.description}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="academy-setup-screen--third__bottom">
					<Button
						type="link"
						link={admin_url + 'admin.php?page=academy'}
						label={__('Skip to Dashboard', 'academy')}
						icon={
							<span className="academy-icon academy-icon--arrow-left" />
						}
						preset="transparent"
						suffix="back-learn"
					/>
					<Button
						suffix="continue"
						onClick={redirectSettingsPageHandler}
						iconPosition="right"
						label={__('Next', 'academy')}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}

LearnPage.propTypes = propTypes;
