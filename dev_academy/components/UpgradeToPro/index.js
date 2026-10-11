import React from 'react';
import { CrownIcon, modalMediumWidthStyles, plugin_root_url } from '@Utils/helper';
import Button from '@Components/Button';
import Modal from 'react-modal';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';

import './styles.scss';

const propTypes = {};

function UpgradeMessage() {
	const upgradeToPro = useSelector((state) => state.upgradeToPro);

	const dispatch = useDispatch();

	const onRequestClose = () => {
		dispatch(upgradeProModal(false));
	};

	const modalStyles = {
		overlay: modalMediumWidthStyles.overlay,
		content: {
			...modalMediumWidthStyles.content,
			border: 'none',
			boxShadow: '0px 12px 72px -8px rgba(16, 24, 40, 0.25)',
		},
	};

	return (
		<>
			<Modal
				isOpen={upgradeToPro?.show_upgrade_modal}
				style={modalStyles}
				contentLabel={__('Upgrade', 'academy')}
			>
				<div className="academy-react-modal__update">
					<Button
						onClick={onRequestClose}
						className="academy-btn-close"
						icon={
							<span className="academy-icon academy-icon--close"></span>
						}
					/>
					<img
						className="academy-upgrade-image"
						src={
							plugin_root_url +
							'assets/images/upgrade-to-pro-illustration.png'
						}
						alt={__('Upgrade to Pro', 'academy')}
					/>
					<p>
						{__('You Must Upgrade to The', 'academy')}{' '}
						<span>{__('Premium', 'academy')}</span>{' '}
						{__('Version to Utilize This Feature', 'academy')}
					</p>
					<Button
						onClick={() =>
							window.open(
								'http://academylms.net/pricing',
								'_blank'
							)
						}
						label={__('Upgrade to Pro', 'academy')}
						icon={<CrownIcon size={20} color="#fff" />}
					/>
				</div>
			</Modal>
		</>
	);
}
UpgradeMessage.propTypes = propTypes;
export default UpgradeMessage;
