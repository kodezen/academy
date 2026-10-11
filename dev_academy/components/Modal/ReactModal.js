import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@Components/Button';
import Modal from 'react-modal';
import OptionMenu from '@Components/OptionMenu';
import { __ } from '@wordpress/i18n';
import { suffixClassNames, contentClassNames } from './helper';
import './styles.scss';

const propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	largeModalMarginTop: PropTypes.string,
	isOpen: PropTypes.bool,
	isEnabledHeader: PropTypes.bool,
	isEnabledResizer: PropTypes.bool,
	onAfterOpen: PropTypes.func,
	onRequestClose: PropTypes.func,
	style: PropTypes.object,
	externalComponent: PropTypes.object,
	suffix: PropTypes.string,
	size: PropTypes.string,
	isSmallAvailable: PropTypes.bool,
	isLargeAvailable: PropTypes.bool,
	// Rendered centered in the header, between the title and the buttons
	// (e.g. the course editor's Overview/Builder/Settings stepper).
	headerCenter: PropTypes.node,
};

// Need to manage common id - future will be improve here
if (document.getElementById('academywrap')) {
	Modal.setAppElement('#academywrap');
} else if (document.getElementById('academyLessonsWrap')) {
	Modal.setAppElement('#academyLessonsWrap');
} else if (document.getElementById('academyFrontendDashWrap')) {
	Modal.setAppElement('#academyFrontendDashWrap');
} else if (document.getElementById('academyFrontendModalWrap')) {
	Modal.setAppElement('#academyFrontendModalWrap');
}

export default function ReactModal({
	children,
	externalComponent,
	suffix = '',
	title = '',
	subtitle = '',
	onAfterOpen,
	onRequestClose,
	isOpen = false,
	isEnabledHeader = true,
	isEnabledResizer = true,
	isSmallAvailable = true,
	isLargeAvailable = true,
	size = 'medium',
	largeModalMarginTop = '30px',
	headerCenter = null,
	style = {
		overlay: {
			background: 'rgba(35, 40, 45, 0.62)',
			overflowY: 'scroll',
			display: 'flex',
			justifyContent: 'center',
			zIndex: 9999,
		},
		content: {
			inset: 'unset',
			padding: 0,
			overflow: 'none',
			border: 0,
			marginTop: '50px',
		},
	},
}) {
	const [devicePreview, setDevicePreview] = useState({
		expandableSize: size,
		activeIconIndex: 3,
	});

	const iconOptions = [
		'academy-icon academy-icon--large-screen',
		'academy-icon academy-icon--medium-screen',
		'academy-icon academy-icon--small-screen',
		'academy-icon academy-icon--columns',
	];

	const toggleIcon = (index) => {
		setDevicePreview((prevState) => ({
			...prevState,
			activeIconIndex: index,
			expandableSize: ['large', 'medium', 'small'][index],
		}));
	};

	const modalStyle =
		devicePreview?.expandableSize === 'large'
			? {
					...style,
					content: {
						...style.content,
						marginTop: largeModalMarginTop,
					},
				}
			: style;

	const showLargeTab = isLargeAvailable
		? [
				{
					type: 'button',
					label: <span>{__('Full screen', 'academy')}</span>,
					icon: (
						<span className="academy-icon academy-icon--large-screen" />
					),
					onClick: () => toggleIcon(0),
				},
			]
		: [];
	const showSmallTab = isSmallAvailable
		? [
				{
					type: 'button',
					label: <span>{__('Small screen', 'academy')}</span>,
					icon: (
						<span className="academy-icon academy-icon--small-screen" />
					),
					onClick: () => toggleIcon(2),
				},
			]
		: [];

	const modalClass = suffixClassNames(suffix, devicePreview?.expandableSize);
	const contentClass = contentClassNames(devicePreview?.expandableSize);

	useEffect(() => {
		if (window.innerWidth <= 768) {
			setDevicePreview((prevState) => ({
				...prevState,
				activeIconIndex: 0,
				expandableSize: 'large',
			}));
		} else {
			setDevicePreview({
				activeIconIndex: 3,
				expandableSize: size,
			});
		}
	}, [window.innerWidth]);

	return (
		<React.Fragment>
			<Modal
				isOpen={isOpen}
				onAfterOpen={onAfterOpen}
				onRequestClose={onRequestClose}
				contentLabel={title}
				style={modalStyle}
				shouldCloseOnOverlayClick={false}
				ariaHideApp={true}
			>
				<div className={modalClass}>
					{isEnabledHeader && (
						<div
							className={`academy-react-modal__head${
								headerCenter
									? ' academy-react-modal__head--has-center'
									: ''
							}`}
						>
							{title && (
								// One flex item, not two — `academy-react-modal__head`'s
								// `justify-content: space-between` otherwise treats the
								// title and subtitle as separate items and spreads the
								// subtitle out towards the middle of the header instead
								// of keeping it right next to the title on the left.
								<div className="academy-react-modal__head-titles">
									<h3 className="academy-react-modal__head-title">
										{title}
									</h3>
									{subtitle && (
										<p>
											<span className="academy-icon academy-icon--angle-right"></span>
											{subtitle}
										</p>
									)}
								</div>
							)}
							{headerCenter && (
								<div className="academy-react-modal__head-center">
									{headerCenter}
								</div>
							)}
							<div className="academy-react-modal-buttons">
								{isEnabledResizer && (
									<OptionMenu
										icon={
											iconOptions[
												devicePreview?.activeIconIndex
											]
										}
										options={[
											...showLargeTab,
											{
												type: 'button',
												label: (
													<span>
														{__(
															'Medium screen',
															'academy'
														)}
													</span>
												),
												icon: (
													<span className="academy-icon academy-icon--medium-screen" />
												),
												onClick: () => toggleIcon(1),
											},
											...showSmallTab,
										]}
									/>
								)}
								{externalComponent}
								<Button
									type="button"
									onClick={() => onRequestClose()}
									icon={
										<span className="academy-icon academy-icon--close-small" />
									}
									className="academy-btn-close-modal"
								/>
							</div>
						</div>
					)}
					<div className={contentClass}>
						{!isEnabledHeader && (
							<Button
								type="button"
								onClick={() => onRequestClose()}
								icon={
									<span className="academy-icon academy-icon--close"></span>
								}
								className="academy-btn-close-modal"
							/>
						)}
						{children}
					</div>
				</div>
			</Modal>
		</React.Fragment>
	);
}

ReactModal.propTypes = propTypes;
