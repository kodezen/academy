import React, { useState } from 'react';
import {
	admin_url,
	toplevel_menu_title,
	plugin_root_url,
	makeRequest,
} from '@Utils/helper';
import Button from '@Components/Button';
import { __, sprintf } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';

import './styles.scss';

const propTypes = {};

export default function Welcome() {
	const [isLoading, setIsLoading] = useState(false);
	const [showMessage, setShowMessage] = useState(false);
	const navigate = useNavigate();
	const redirectHandler = () => {
		setIsLoading(false);
		setTimeout(() => {
			navigate('/instructor');
		}, 500);

		makeRequest({ action: 'insights_optin', slug: 'academy' });
	};

	const redirectTODataHandler = () => {
		setIsLoading(false);
		setTimeout(() => {
			navigate('/instructor');
		}, 500);
	};

	return (
		<React.Fragment>
			<div
				className="academy-setup-screen--first"
				style={{ minHeight: `${window.innerHeight - 16}px` }}
			>
				<div className="academy-setup-screen--first__content">
					<div className="academy-setup-screen--first__header">
						<img
							className="academy-entry-icon"
							src={`${plugin_root_url}assets/images/logo-full.svg`}
							alt={__('logo', 'academy')}
						/>
						<h2 className="academy-setup-screen__title">
							{sprintf(
								// translators: %s: BrandingName
								__('Welcome to %s', 'academy'),
								toplevel_menu_title
							)}
							!
						</h2>
						<p className="academy-setup-screen__subtitle">
							{__(
								`From Single Instructor to massive learning platforms,`,
								'academy'
							)}{' '}
							<span className="academy-setup-screen__brand">
								{toplevel_menu_title}
							</span>{' '}
							{__(
								`evolves with you to develop your dream eLearning website.`,
								'academy'
							)}
						</p>
					</div>
					{/* Todo: uncomment this section if video is used infuture */}
					{/* <div className="academy-setup-screen--first__video">
						<iframe
							title="Academy LMS"
							width="708px"
							height="410"
							src="https://www.youtube.com/embed/s00SPMwdTCw"
							frameBorder="0"
							allowFullScreen
						/>
					</div> */}
					<div className="academy-setup-screen--first__illustration">
						<img
							src={`${plugin_root_url}assets/images/setup/welcome.png`}
							alt={'welcome'}
						/>
					</div>
				</div>

				<div className="academy-setup-screen--first__bottom">
					<div className="academy-setup-screen--first__bottom-message">
						<p className="academy-title">
							<span className="academy-title--declaration">
								{__(
									'By proceeding, you consent to this plugin collecting your information.',
									'academy'
								)}
								<Button
									label={__('What we collect?', 'academy')}
									onClick={() => setShowMessage(!showMessage)}
									preset="transparent"
									suffix="declaration"
								/>
							</span>
							{showMessage && (
								<>
									<p className="academy-m-0">
										We collect your{' '}
										<strong>
											site URL, plugin version, WordPress
											version, PHP version
										</strong>
										, and <strong>admin email</strong> to
										better tailor our updates and improve
										plugin performance.
									</p>
									<p className="academy-m-0">
										<em>
											No sensitive or personal data is
											collected. You can unsubscribe at
											any time.
										</em>
									</p>
								</>
							)}
						</p>
					</div>

					<Button
						preset="purple"
						onClick={() => {
							redirectHandler();
							setIsLoading(true);
						}}
						isLoading={isLoading}
						icon={
							<span className="academy-icon academy-icon--arrow-right"></span>
						}
						iconPosition="right"
						suffix="lets-start"
						label={__('Proceed to next step', 'academy')}
					/>
					<Button
						type="link"
						onClick={() => {
							redirectTODataHandler();
						}}
						className="academy-screen-steps-footer-text"
						label={__('Skip this step', 'academy')}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}

Welcome.propTypes = propTypes;
