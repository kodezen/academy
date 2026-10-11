import React, { useEffect, useState } from 'react';
import BookingWidget from '@Components/BookingWidget';
import BookedTable from '@Containers/frontend-curriculums/TutorBooking/BookedTable/index';
import Button from '@Components/Button';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { academy_nonce, ajaxurl } from '@Utils/helper';
import Preloader from '@Components/Loader/Preloader';
import ErrorBoundary from '@Components/ErrorBoundary';
import { Provider } from 'react-redux';
import store from '@Redux/store';

const PhpLessonTutorBooking = (props) => {
	const [booking, setBooking] = useState(false);
	const [loading, setLoading] = useState(false);
	const [toggle, setToggle] = useState(false);
	const [redirectUrl, setRedirectUrl] = useState(false);
	const [showReloadText, setShowReloadText] = useState(false);
	const [canceled, isCanceled] = useState(false);

	const { courseID, bookingID } = props;

	useEffect(() => {
		if ((bookingID && courseID) || canceled) {
			resetState();
			renderBooking();
		}
	}, [bookingID, canceled, courseID]);

	const renderBooking = () => {
		setLoading(true);
		const form_data = new FormData(); // eslint-disable-line
		form_data.append(
			'action',
			'academy_pro/booking/frontend/render_booking'
		);
		form_data.append('security', academy_nonce);
		form_data.append('course_id', courseID);
		form_data.append('booking_id', parseInt(bookingID));
		axios.post(ajaxurl, form_data).then(
			(response) => {
				if (response.data.success && response.data?.data) {
					setBooking(response.data?.data);
					const settings = JSON.parse(response.data?.data.settings);
					setToggle(settings.booked?.length > 0 ? true : false);
					setTimeout(() => {
						setLoading(false);
					}, 500);
				} else {
					setLoading(false);
				}
			},
			(error) => {
				setLoading(false);
				console.log(error); // eslint-disable-line
			}
		);
	};

	const resetState = () => {
		isCanceled(false);
		setBooking(false);
		setToggle(false);
		setRedirectUrl(false);
		setShowReloadText(false);
	};

	return (
		<Provider store={store}>
			<ErrorBoundary
				title={__(
					'Something went wrong while loading your booking.',
					'academy'
				)}
			>
				{loading ? (
					<div className="academy-lessons-content__loader">
						<Preloader />
					</div>
				) : (
					<div className="academy-booking-content">
						{(toggle || redirectUrl) && (
							<Button
								onClick={() => {
									setToggle(false);
									setRedirectUrl(false);
								}}
								icon={
									<span className="academy-icon academy-icon--arrow-left"></span>
								}
								label={__('Booking Calendar', 'academy')}
								suffix="back"
							/>
						)}
						{!toggle && !redirectUrl && (
							<h3>
								{__(
									'Please select a time slot for your booking.',
									'academy'
								)}
							</h3>
						)}
						{toggle ? (
							<div className="academy-booking-content__table">
								<h4>{__('Your bookings list: ', 'academy')}</h4>
								<BookedTable
									booking={booking}
									isCanceled={isCanceled}
								/>
							</div>
						) : (
							<>
								{redirectUrl ? (
									<div className="academy-booking-redirect">
										<h3 className="academy-booking-redirect__message">
											{__(
												'Please proceed to confirm your booking.',
												'academy'
											)}
										</h3>
										{showReloadText && (
											<p className="academy-booking-redirect__text">
												<span
													onClick={() =>
														setToggle(!toggle)
													}
													role="presentation"
												>
													{__('Refresh ', 'academy')}
												</span>
												{__(
													'this page after checkout is complete…',
													'academy'
												)}
											</p>
										)}
										<Button
											label={__('Check Out', 'academy')}
											type="link"
											link={redirectUrl}
											target="_blank"
											onClick={() =>
												setShowReloadText(
													!showReloadText
												)
											}
										/>
									</div>
								) : (
									<BookingWidget
										bookingId={booking && booking?.ID}
										settings={booking && booking?.settings}
										isLesson={true}
										setToggle={setToggle}
										setRedirectUrl={setRedirectUrl}
										renderBooking={renderBooking}
									/>
								)}
							</>
						)}
						{!toggle && !redirectUrl && (
							<Button
								suffix="booking-list"
								onClick={() => setToggle(true)}
								label={__('Booked List', 'academy')}
							/>
						)}
					</div>
				)}
			</ErrorBoundary>
		</Provider>
	);
};

export default PhpLessonTutorBooking;
