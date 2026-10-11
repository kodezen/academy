import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import Calendar from 'react-calendar';
import ReactModal from '@Components/Modal/ReactModal';
import {
	makeRequest,
	current_user_id,
	timezoneOptions,
	current_permalink,
	API,
	namespace,
} from '@Utils/helper';
import 'react-calendar/dist/Calendar.css';
import Notification from '@Components/Notification';
import AcademySelect from '@Components/AcademySelect';
import Preloader from '@Components/Loader/Preloader';
import { getBookingSlotsByDateTime } from './helper';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import PropTypes from 'prop-types';
import Button from '../Button';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { useDispatch } from 'react-redux';
import './styles.scss';

const propTypes = {
	bookingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	settings: PropTypes.object,
	isLesson: PropTypes.bool,
	setToggle: PropTypes.func,
	renderBooking: PropTypes.func,
	isLoading: PropTypes.bool,
	viewFromPhp: PropTypes.bool,
};

const timeFormat = [
	{
		label: '12h',
		value: '12h',
	},
	{
		label: '24h',
		value: '24h',
	},
];

export default function BookingWidget({
	bookingId,
	setToggle,
	setRedirectUrl,
	renderBooking,
	settings = {},
	isLesson = false,
	viewFromPhp = false,
}) {
	const [loginModalIsOpen, setLoginModalOpen] = useState(false);
	const [loginModalContent, setLoginModalContent] = useState(false);
	// Bookings created before array-shaped `booked`/`schedule_repeated_times`
	// existed (e.g. courses carried over from older Academy versions) can
	// still have these fields missing or saved in a non-array shape, which
	// would otherwise crash every `.some()`/`.reduce()`/`.filter()` below —
	// normalize once here instead of guarding every call site.
	const parsedSettings = bookingId && (() => {
		try {
			return JSON.parse(settings) || {};
		} catch (e) {
			return {};
		}
	})();
	const calendarSettings = parsedSettings && {
		...parsedSettings,
		booked: Array.isArray(parsedSettings.booked)
			? parsedSettings.booked
			: [],
		schedule_repeated_times: Array.isArray(
			parsedSettings.schedule_repeated_times
		)
			? parsedSettings.schedule_repeated_times
			: [],
	};

	const dispatch = useDispatch();

	// A user can hold only one live booking per "single" booking item (it has
	// only one possible occurrence), whether they reach it from the Tutor
	// Booking page or from inside a course. If they already have one, show it
	// instead of a calendar that would be refused. "repeated" items have many
	// distinct occurrences, so existing bookings don't block the calendar —
	// hasBookedSlot() below just greys out the specific slots already taken.
	const [existingBookings, setExistingBookings] = useState([]);
	const [isCheckingBooking, setIsCheckingBooking] = useState(
		!!bookingId && parseInt(current_user_id) !== 0
	);
	useEffect(() => {
		if (!bookingId || parseInt(current_user_id) === 0) {
			setIsCheckingBooking(false);
			return;
		}
		setIsCheckingBooking(true);
		makeRequest({
			action: 'academy_pro/booking/frontend/get_booking',
			booking_id: bookingId,
		})
			.then((res) => {
				// The endpoint also returns cancelled bookings, which shouldn't
				// block booking again — only live ones do.
				setExistingBookings(
					res?.data?.success && Array.isArray(res.data.data)
						? res.data.data.filter((item) =>
								['completed', 'processing'].includes(
									item.post_status
								)
							)
						: []
				);
			})
			.catch(() => setExistingBookings([]))
			.finally(() => setIsCheckingBooking(false));
	}, [bookingId]);

	moment.locale('en');

	const repeatedAllowedDays =
		calendarSettings?.schedule_repeated_times &&
		calendarSettings?.schedule_repeated_times.reduce((acc, current) => {
			acc.push(
				current.day.charAt(0).toUpperCase() + current.day.slice(1)
			);
			return acc;
		}, []);

	const doBookedHandler = async (values, actions) => {
		actions.setSubmitting(true);
		if (parseInt(current_user_id) === 0) {
			await API.get(
				`${namespace}popup-login?current_permalink=${current_permalink}`
			).then((res) => {
				setLoginModalContent(res?.data?.markup);
				setLoginModalOpen(true);
				actions.setSubmitting(false);
			});
		} else {
			makeRequest({
				action: 'academy_pro/booking/frontend/do_booked',
				booking_id: bookingId,
				...values,
			}).then((res) => {
				if (res?.data?.success) {
					if (res?.data?.data?.redirect_url) {
						setTimeout(() => {
							if (isLesson) {
								renderBooking();
								if (res?.data?.data.booking_type === 'paid') {
									setRedirectUrl(
										res?.data?.data?.redirect_url
									);
								} else {
									setToggle(true);
									if (!viewFromPhp) {
										dispatch(
											showNotification({
												message:
													res?.data?.data?.message,
												isShow: true,
												type: 'success',
											})
										);
									}
								}
							} else {
								window.location.href =
									res?.data?.data?.redirect_url +
									'?nocache=' +
									Date.now();
								dispatch(
									showNotification({
										message: res?.data?.data?.message,
										isShow: true,
										type: 'success',
									})
								);
							}
							actions.setSubmitting(false);
						}, [500]);
					}
				} else {
					dispatch(
						showNotification({
							message: res?.data?.data?.message,
							isShow: true,
							type: 'error',
						})
					);
					actions.setSubmitting(false);
				}
			});
		}
	};

	const hasBookedSlot = (date, time) => {
		const timeItem = time.split(' ');
		const hasDisableSlot = calendarSettings?.booked.some((item) => {
			const itemMoment = item.schedule_time.split(' ');
			if (itemMoment[0] === date && itemMoment[1] === timeItem[0]) {
				return true;
			}
			return false;
		});
		return hasDisableSlot;
	};

	const closeLoginModal = () => setLoginModalOpen(false);

	const getSelectedDateSlots = (selectedDate) => {
		if (calendarSettings.schedule_type === 'repeated') {
			if (calendarSettings?.schedule_repeated_times.length > 0) {
				const selectedDateTimeItem =
					calendarSettings?.schedule_repeated_times.filter(
						(item) =>
							item.day ===
							moment(selectedDate).format('dddd').toLowerCase()
					);
				return getBookingSlotsByDateTime(
					selectedDate,
					selectedDateTimeItem[0]?.scheduleTimes,
					calendarSettings.duration
				);
			}
		} else if (calendarSettings.schedule_type === 'single') {
			return getBookingSlotsByDateTime(
				selectedDate,
				[
					{
						start_time: calendarSettings?.schedule_time?.start_time,
						end_time: calendarSettings?.schedule_time?.end_time,
					},
				],
				calendarSettings.duration
			);
		}

		return selectedDate;
	};

	if (isCheckingBooking) {
		return <Preloader className="min-h-[100px]" />;
	}

	if (calendarSettings.schedule_type === 'single' && existingBookings.length > 0) {
		return (
			<div className="academy-booking-already-booked">
				<p>
					{__(
						'You have already booked this. To change the time, reschedule or cancel your existing booking from your bookings list.',
						'academy'
					)}
				</p>
				<ul>
					{existingBookings.map((item) => (
						<li key={item.ID}>
							{item?.meta?._academy_booked_schedule_time}
						</li>
					))}
				</ul>
			</div>
		);
	}

	return (
		<React.Fragment>
			<Notification />
			{parseInt(current_user_id) === 0 && (
				<ReactModal
					isOpen={loginModalIsOpen}
					onRequestClose={closeLoginModal}
					suffix="popup-login"
					size="small"
					isEnabledHeader={false}
					style={{
						overlay: {
							background: 'rgba(35, 40, 45, 0.62)',
							overflow: 'visible',
							display: 'flex',
							justifyContent: 'center',
							zIndex: 9999,
						},
						content: {
							inset: 'unset',
							padding: 0,
							border: 0,
							marginTop: '50px',
							overflow: 'visible',
						},
					}}
				>
					<div
						dangerouslySetInnerHTML={{ __html: loginModalContent }}
					></div>
				</ReactModal>
			)}
			<Formik
				enableReinitialize={true}
				initialValues={{
					selectedDate: '',
					selectedTimeSlot: '',
					timeZone: moment.tz.guess(),
					timeFormat: '12h',
				}}
				onSubmit={doBookedHandler}
			>
				{({ isSubmitting, values, setFieldValue }) => {
					const renderTime = (time) => {
						const dateTime = moment(time, 'h:mm A');
						const timeZone = dateTime.tz(values.timeZone);
						return values.timeFormat === '12h'
							? timeZone.format('h:mm A')
							: timeZone.format('HH:mm');
					};

					const handleTitleClass = ({ date, view }) => {
						if (view === 'month') {
							if (
								moment(date)
									.startOf('day')
									.isBefore(moment().startOf('day'))
							) {
								return 'inactive';
							}

							if (
								moment(date).date() ===
									moment(values?.selectedDate)?.date() &&
								moment(date).month() ===
									moment(values?.selectedDate)?.month()
							) {
								return 'date-range-active date-selected';
							} else if (
								calendarSettings.schedule_type === 'repeated'
							) {
								if (
									calendarSettings?.schedule_repeated_times
										.length > 0
								) {
									const dateRangeClasses =
										repeatedAllowedDays.map((item) => {
											if (
												item ===
												moment(date).format('dddd')
											) {
												return 'date-range-active';
											} else if (
												item !==
												moment(date).format('dddd')
											) {
												return 'inactive';
											}
											return '';
										});
									return dateRangeClasses.join(' ');
								}
							} else if (
								calendarSettings.schedule_type === 'single'
							) {
								if (
									moment(date).date() ===
										moment(
											calendarSettings?.schedule_time.date
										)?.date() &&
									moment(date).month() ===
										moment(
											calendarSettings?.schedule_time.date
										)?.month() &&
									moment(date).year() ===
										moment(
											calendarSettings?.schedule_time.date
										)?.year()
								) {
									return 'date-range-active';
								}
								return 'inactive';
							}
							return 'inactive';
						}
					};

					return (
						<Form className="academy-widget--calendar">
							<div className="academy-calendar">
								<div className="academy-time-fields">
									<AcademySelect
										name="timeZone"
										suffix="time-zone"
										options={timezoneOptions}
										value={timezoneOptions.find(
											(item) =>
												item.value === values?.timeZone
										)}
										onChangeHandler={(option) =>
											setFieldValue('timeZone', option)
										}
									/>
									<AcademySelect
										name="timeFormat"
										suffix="time-format"
										options={timeFormat}
										value={timeFormat.find(
											(option) =>
												option.value ===
												values.timeFormat
										)}
										onChangeHandler={(option) =>
											setFieldValue('timeFormat', option)
										}
									/>
								</div>
								<Calendar
									name="selectedDate"
									onChange={(date) => {
										const day = date
											.getDate()
											.toString()
											.padStart(2, '0');
										const month = (date.getMonth() + 1)
											.toString()
											.padStart(2, '0');
										const year = date
											.getFullYear()
											.toString();
										setFieldValue(
											'selectedDate',
											`${year}-${month}-${day}`
										);
									}}
									minDate={new Date()}
									tileClassName={handleTitleClass}
								/>
							</div>
							{values?.selectedDate && (
								<div className="academy-booking-slots">
									<h3>
										{moment(values?.selectedDate).format(
											'dddd, MMMM D'
										)}
									</h3>
									{getSelectedDateSlots(
										values?.selectedDate
									).map((item, index) => {
										const itHasBookedSlot = hasBookedSlot(
											values.selectedDate,
											item.start_time
										);
										return (
											<div
												className={`academy-booking-slots--slot ${
													values?.selectedTimeSlot ===
														item.start_time &&
													'academy-booking-slots--active'
												} ${
													itHasBookedSlot &&
													'academy-booking-slots--slot-booked'
												}`}
												key={index}
												onClick={() =>
													itHasBookedSlot
														? dispatch(
																showNotification(
																	{
																		message:
																			__(
																				'Already Booked!',
																				'academy'
																			),
																		isShow: true,
																		type: 'info',
																	}
																)
															)
														: setFieldValue(
																'selectedTimeSlot',
																item?.start_time
															)
												}
												role="presentation"
											>
												<span className="academy-booking-slot">
													{renderTime(
														item.start_time
													)}{' '}
													{' - '}{' '}
													{renderTime(item.end_time)}
												</span>
												{values?.selectedTimeSlot ===
													item.start_time && (
													<Button
														type="submit"
														label={__(
															'Confirm',
															'academy'
														)}
														isLoading={isSubmitting}
													/>
												)}
											</div>
										);
									})}
								</div>
							)}
						</Form>
					);
				}}
			</Formik>
		</React.Fragment>
	);
}

BookingWidget.propTypes = propTypes;
