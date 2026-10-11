import React, { useEffect, useRef } from 'react';
import Button from '@Components/Button';
import { useSelector, useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { createPortal } from 'react-dom';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const iconType = (type) => {
	switch (type) {
		case 'error':
			return 'information-error';
		case 'info':
			return 'information';
		case 'warning':
			return 'notification';
		default:
			return 'filled-checkmark';
	}
};

const Notification = () => {
	const notificationRef = useRef(null);
	const targetElement =
		document.querySelector('#academywrap') ||
		document.querySelector('#academyFrontendDashWrap') ||
		document.querySelector('#academy_curriculum_booking_content') ||
		document.querySelector('#academyLessonsWrap') ||
		document.querySelector('#academyPhpLessonsWrap') ||
		document.querySelector('#academy_frontend_dashboard_react_render') ||
		document.querySelector('.academy-single-booking') ||
		document.querySelector('.academy-single-course');
	const notification = useSelector((state) => state.notification);
	const dispatch = useDispatch();

	const isShowNotification =
		notification?.showNotification || notification?.isShow;

	useEffect(() => {
		if (isShowNotification && targetElement) {
			notificationRef.current.style.position = 'fixed';
			notificationRef.current.style.left = `50%`; // Adjust left position as needed
			notificationRef.current.style.transform = 'translateX(-50%)';
			notificationRef.current.style.bottom = `50px`; // Place it at the bottom
			document.body.appendChild(notificationRef.current);
		} else if (
			notificationRef.current &&
			notificationRef.current.parentNode === document.body
		) {
			document.body.removeChild(notificationRef.current);
		}

		return () => {
			if (
				notificationRef.current &&
				notificationRef.current.parentNode === document.body
			) {
				document.body.removeChild(notificationRef?.current);
			}
		};
	}, [isShowNotification]);

	useEffect(() => {
		if (isShowNotification) {
			const timeout_id = setTimeout(() => {
				closeHandler();
			}, 6000);

			return () => clearTimeout(timeout_id);
		}
	}, [isShowNotification]);

	const closeHandler = () => {
		dispatch(
			showNotification({
				message: '',
				isShow: false,
			})
		);
	};

	return (
		<>
			{isShowNotification &&
				createPortal(
					<div
						className={`academy-notification ${
							notification.type &&
							`academy-notification--${notification.type}`
						}`}
						ref={notificationRef}
					>
						<div className="academy-notification__message">
							<span
								className={
									'academy-icon academy-icon--' +
									iconType(notification.type)
								}
								aria-hidden={true}
							/>
							{notification.isHtml ? (
								<div
									dangerouslySetInnerHTML={{
										__html: notification.message,
									}}
								/>
							) : (
								notification.message
							)}
						</div>
						<Button
							icon={
								<span className="academy-icon academy-icon--close" />
							}
							preset="transparent"
							suffix="close-notification"
							onClick={closeHandler}
							ariaLabel={__('Close notification', 'storeengine')}
						/>
					</div>,
					document.body
				)}
		</>
	);
};

export default Notification;
