import React, { useState } from 'react';
import Button from '@Components/Button';
import SubTopBar from '@Components/SubTopBar';
import { __ } from '@wordpress/i18n';
import { Link } from 'react-router-dom';
import {
	route_path,
	is_admin,
	makeRequest,
	youtube_api_key,
	can,
	permissionDeniedMessage,
	plugin_root_url,
} from '@Utils/helper';
import { Field } from 'formik';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import ReactModalFormik from '@Components/Modal/ReactModalFormik';
import StatusOptions from '@Components/StatusOptions';
import { useDispatch } from 'react-redux';
import CourseType from './new-course/Sections/CourseType';
import { fetchAllCourse } from '@Redux/Slices/courseSlice/courseSlice';
import AiCourseGeneration from './new-course/AiCourseGeneration';
import './styles.scss';

const propTypes = {};

const CourseSubTopBar = ({ setEditItemID, isModalOpen }) => {
	const dispatch = useDispatch();
	const [instantCourseModal, setInstantCourseModal] = useState(false);
	const [yTModalOpen, setYTModalOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState('publish');
	const [updateYoutubeApiKey, setUpdateYoutubeApiKey] = useState('');

	const youTubeApiKey = youtube_api_key === '';
	const canCreateCourse = can('academy.courses.create');

	// Guards every "create a course" entry point in this bar. Buttons stay
	// visibly disabled (see isDisabled/className below); this is the
	// belt-and-suspenders layer for controls a disabled state alone can't
	// stop (a plain <Link>'s href still navigates even when styled
	// disabled) — clicking surfaces the same denial message the API would
	// have returned anyway.
	const guardCreate = (e, action) => {
		if (canCreateCourse) {
			action?.();
			return;
		}
		e.preventDefault();
		dispatch(
			showNotification({
				message: permissionDeniedMessage('academy.courses.create'),
				isShow: true,
				type: 'error',
			})
		);
	};

	const onInstantDemoCourse = (values, actions) => {
		makeRequest({
			action: 'academy/import_from_playlist',
			...values,
			course_status: selectedStatus,
			course_type: values?.meta?.academy_course_type,
		}).then((res) => {
			actions.setSubmitting(false);
			setInstantCourseModal(true);
			if (res?.data?.success) {
				dispatch(fetchAllCourse({}));
				dispatch(
					showNotification({
						message: res?.data?.data?.message,
						isShow: true,
						type: 'success',
					})
				);
				setInstantCourseModal(false);
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

	const onSubmitYtApiCheck = (values, actions) => {
		makeRequest({
			action: 'academy/validate_youtube_api',
			api_key: values.youtube_api_key,
		}).then((res) => {
			actions.setSubmitting(false);
			setYTModalOpen(true);
			if (res?.data?.success) {
				dispatch(
					showNotification({
						message: __('YouTube API Key is valid!', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				setYTModalOpen(false);
				setTimeout(() => {
					window.location.reload();
				}, 500);
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

	const updateApiKey = (value) => {
		makeRequest({
			action: 'academy/validate_youtube_api',
			api_key: value,
		}).then((res) => {
			if (res?.data?.success) {
				dispatch(
					showNotification({
						message: __(
							'YouTube API Key updated successfully!',
							'academy'
						),
						isShow: true,
						type: 'success',
					})
				);
				setUpdateYoutubeApiKey('');
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

	const handleStatusChange = (value) => {
		setSelectedStatus(value);
	};

	return (
		<React.Fragment>
			<SubTopBar heading={__('Courses', 'academy')}>
				{is_admin ? (
					<React.Fragment>
						{youTubeApiKey && (
							<Button
								type="submit"
								preset="transparent"
								suffix="instant-youtube"
								icon={
									<img
										className="academy-btn--instant-youtube__icon"
										src={
											plugin_root_url +
											'assets/images/youtube.svg'
										}
										alt=""
									/>
								}
								label={
									!youTubeApiKey
										? __('Update Api Key', 'academy')
										: __(
												'Instant YouTube Course',
												'academy'
											)
								}
								isDisabled={!canCreateCourse}
								title={
									!canCreateCourse
										? permissionDeniedMessage(
												'academy.courses.create'
											)
										: undefined
								}
								onClick={(e) =>
									guardCreate(e, () =>
										setYTModalOpen(!yTModalOpen)
									)
								}
							/>
						)}

						{!youTubeApiKey && (
							<Button
								type="submit"
								preset="transparent"
								suffix="instant-youtube"
								icon={
									<img
										className="academy-btn--instant-youtube__icon"
										src={
											plugin_root_url +
											'assets/images/youtube.svg'
										}
										alt=""
									/>
								}
								label={__('Instant Course', 'academy')}
								isDisabled={!canCreateCourse}
								title={
									!canCreateCourse
										? permissionDeniedMessage(
												'academy.courses.create'
											)
										: undefined
								}
								onClick={(e) =>
									guardCreate(e, () =>
										setInstantCourseModal(
											!instantCourseModal
										)
									)
								}
							/>
						)}

						<ReactModalFormik
							title={__('Enter Youtube API', 'academy')}
							isOpen={yTModalOpen}
							onRequestClose={() => setYTModalOpen(!yTModalOpen)}
							submitButtonLabel={
								!youTubeApiKey
									? __('Update Api Key', 'academy')
									: __('Submit Api Key', 'academy')
							}
							suffix="review-course"
							size="small"
							isEnabledHeader={false}
							isLargeAvailable={false}
							formik={{
								enableReinitialize: true,
								initialValues: {
									youtube_api_key: '',
								},
								onSubmit: onSubmitYtApiCheck,
							}}
						>
							<Field
								type="text"
								name="youtube_api_key"
								className="academy-input academy-input-create-course-demo"
								placeholder="Enter Youtube Api key"
							/>
						</ReactModalFormik>

						<ReactModalFormik
							title={__(
								'Enter a Valid YouTube Video Playlist URL',
								'academy'
							)}
							isOpen={instantCourseModal}
							onRequestClose={() =>
								setInstantCourseModal(!instantCourseModal)
							}
							submitButtonLabel={__('Submit', 'academy')}
							suffix="review-course"
							size="small"
							isEnabledHeader={false}
							isLargeAvailable={false}
							formik={{
								enableReinitialize: true,
								initialValues: {
									playlist_url: '',
									status: '',
									meta: {
										academy_course_type: 'free',
									},
								},
								onSubmit: onInstantDemoCourse,
							}}
						>
							<div className="academy-column-items">
								<div className="academy-column-items">
									<label className="academy-title">
										{__('Update Api Key', 'academy')}
									</label>
									<div className="academy-item-center">
										<Field
											type="text"
											name="youtube_api_key"
											value={updateYoutubeApiKey}
											onChange={(e) =>
												setUpdateYoutubeApiKey(
													e.target.value
												)
											}
											className="academy-input academy-input-create-course-demo"
											placeholder="Enter Youtube Api key"
										/>
										<Button
											preset="purple"
											label={__(
												'Update Api Key',
												'academy'
											)}
											onClick={() =>
												updateApiKey(
													updateYoutubeApiKey
												)
											}
										/>
									</div>
								</div>
								<div className="academy-column-items">
									<label className="academy-title">
										{__('Enter The URL', 'academy')}
									</label>
									<Field
										type="url"
										name="playlist_url"
										className="academy-input academy-input-create-course-demo"
										placeholder="Enter Playlist URL"
									/>
								</div>
							</div>

							<div className="academy-flex academy-mt-6 academy-mb-6">
								<label className="academy-title-subtitle">
									<span className="academy-title">
										{__('Course Status', 'academy')}
									</span>
									<span className="academy-sub-title">
										{__(
											'Select the status type',
											'academy'
										)}
									</span>
								</label>
								<StatusOptions
									value={selectedStatus}
									options={{
										items: [
											{
												label: __(
													'Published',
													'academy'
												),
												value: 'publish',
											},
											{
												label: __('Draft', 'academy'),
												value: 'draft',
											},
											{
												label: __('Pending', 'academy'),
												value: 'pending',
											},
											{
												label: __('Private', 'academy'),
												value: 'private',
											},
										],
									}}
									onChangeHandler={handleStatusChange}
								/>
							</div>

							<CourseType
								showPaidType={false}
								showRcpType={false}
							/>
						</ReactModalFormik>

						<AiCourseGeneration
							ID={null}
							setLoading={() => {}}
							isFrontend={false}
						/>

						<Link
							to={`${route_path}admin.php?page=academy-courses&action=new`}
							className={`academy-btn academy-btn--md academy-btn--preset-purple academy-btn--add-new-course${
								!canCreateCourse
									? ' academy-btn--disabled'
									: ''
							}`}
							title={
								!canCreateCourse
									? permissionDeniedMessage(
											'academy.courses.create'
										)
									: undefined
							}
							onClick={(e) => {
								if (!canCreateCourse) {
									e.preventDefault();
									dispatch(
										showNotification({
											message: permissionDeniedMessage(
												'academy.courses.create'
											),
											isShow: true,
											type: 'error',
										})
									);
								}
							}}
						>
							<span className="academy-icon academy-icon--plus"></span>
							<span className="academy-btn--label">
								{__('Add New Course', 'academy')}
							</span>
						</Link>
					</React.Fragment>
				) : (
					<Button
						type="button"
						size="sm"
						label={__('Add New Course', 'academy')}
						isDisabled={!canCreateCourse}
						title={
							!canCreateCourse
								? permissionDeniedMessage(
										'academy.courses.create'
									)
								: undefined
						}
						onClick={(e) =>
							guardCreate(e, () => {
								isModalOpen(true);
								setEditItemID(0);
							})
						}
					/>
				)}
			</SubTopBar>
		</React.Fragment>
	);
};

CourseSubTopBar.propTypes = propTypes;
export default CourseSubTopBar;
