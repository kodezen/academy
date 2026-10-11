import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Formik } from 'formik';
import Button from '@Components/Button';
import Modal from 'react-modal';
import { __ } from '@wordpress/i18n';
import OptionMenu from '@Components/OptionMenu';
import { suffixClassNames, contentClassNames } from './helper';
import './styles.scss';

const propTypes = {
	title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	isOpen: PropTypes.bool,
	isLoading: PropTypes.bool,
	isLargeAvailable: PropTypes.bool,
	isSmallAvailable: PropTypes.bool,
	onAfterOpen: PropTypes.func,
	onRequestClose: PropTypes.func,
	cancelButtonLabel: PropTypes.string,
	submitButtonLabel: PropTypes.string,
	style: PropTypes.object,
	suffix: PropTypes.string,
	size: PropTypes.string,
	formik: PropTypes.object,
	isEnabledFooter: PropTypes.bool,
	requireDirty: PropTypes.bool,
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

export default function ReactModalFormik({
	children,
	suffix = '',
	title = '',
	isOpen = false,
	isSmallAvailable = true,
	isLargeAvailable = true,
	isEnabledFooter = true,
	onAfterOpen,
	onRequestClose,
	cancelButtonLabel = __('Cancel', 'academy'),
	submitButtonLabel = __('Update', 'academy'),
	size = 'medium',
	formik = {},
	// Most of this modal's callers are "edit and save" forms where nothing to
	// submit until something changes is the right default. A few start from
	// an already-valid, directly-submittable default (a star rating, a
	// duration picker) or bind their only control to local state instead of
	// Formik — for those, the caller opts out here rather than the button
	// being permanently (or spuriously) disabled.
	requireDirty = true,
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
			border: 0,
			overflow: 'none',
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
		devicePreview.expandableSize === 'large'
			? {
					...style,
					content: {
						...style.content,
						marginTop: '30px',
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
	const contentLabel =
		typeof title === 'object' ? title.props.children[0] : title;

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
				contentLabel={contentLabel}
				style={modalStyle}
				shouldCloseOnOverlayClick={false}
				ariaHideApp={true}
			>
				<Formik {...formik}>
					{({ isSubmitting, dirty }) => (
						<Form>
							<div className={modalClass}>
								<div className="academy-react-modal__head">
									{title && (
										<h3 className="academy-react-modal__head-title">
											{title}
										</h3>
									)}
									<div className="academy-react-modal-buttons">
										<OptionMenu
											icon={
												iconOptions[
													devicePreview
														?.activeIconIndex
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
													onClick: () =>
														toggleIcon(1),
												},
												...showSmallTab,
											]}
										/>
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
								<div className={contentClass}>{children}</div>
								{isEnabledFooter && (
									<div className="academy-react-modal__footer">
										<Button
											type="button"
											onClick={() => onRequestClose()}
											borderRadius="rounded"
											preset="cancel"
											label={cancelButtonLabel}
										/>
										<Button
											type="submit"
											borderRadius="rounded"
											label={submitButtonLabel}
											isLoading={isSubmitting}
											isDisabled={requireDirty && !dirty}
										/>
									</div>
								)}
							</div>
						</Form>
					)}
				</Formik>
			</Modal>
		</React.Fragment>
	);
}

ReactModalFormik.propTypes = propTypes;
