import React, { useState, useEffect } from 'react';
import { getLessonInitialValues } from './helper';
import LessonFormInner from './LessonFormInner';
import Preloader from '@Components/Loader/Preloader';
import PropTypes from 'prop-types';
import ReactModalFormik from '@Components/Modal/ReactModalFormik';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import {
	createNewLesson,
	updateLesson,
} from '@Redux/Slices/lessonSlice/lessonSlice';
import './styles.scss';

const propTypes = {
	updateTopic: PropTypes.bool,
	isModalLoading: PropTypes.bool,
};

function LessonModal(props) {
	const {
		formData,
		isOpenModal,
		onRequestClose,
		dripContentType,
		isDripContentEnable,
		topics,
		currentItemId,
		topicUpdateHandler,
		itemIndex,
		isSubCurriculum,
		subCurriculumIndex,
		subTopicUpdateHandler,
		closeModal,
		isAddNewItem,
		isModalLoading = false,
	} = props;
	const [lessonID, setLessonID] = useState(
		formData?.ID ? formData?.ID : formData?.id
	);
	// `formData` is only ever set once by the caller (the initial GET fetch
	// that runs when the modal opens) and never updated after a save. Deriving
	// `initialValues` straight from that stale prop meant every re-render
	// after a successful save (triggered by the `actions.setValues(...)` below)
	// recomputed `initialValues` from the pre-save snapshot again — harmless
	// for Formik itself (enableReinitialize only resets on an actual value
	// change), but it meant nothing downstream ever saw the fresh saved
	// content unless it came from `values` directly. Tracking the
	// source-of-truth here and refreshing it on every successful save keeps
	// `initialValues` (and anything derived from it, like the lesson content
	// editor's `defaultValue`) consistent with what was actually just saved.
	const [lessonData, setLessonData] = useState(formData);

	useEffect(() => {
		if (formData) {
			setLessonID(formData?.ID ? formData?.ID : formData?.id);
			setLessonData(formData);
		}
	}, [formData]);

	const dispatch = useDispatch();
	const onSubmitHandler = (values, actions) => {
		actions.setSubmitting(true);
		if (values?.lesson_title === '') {
			actions.setSubmitting(false);
			dispatch(
				showNotification({
					message: __('Title Missing', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
		} else if (
			values.meta.video_duration.hours === '' ||
			values.meta.video_duration.minutes === '' ||
			values.meta.video_duration.seconds === ''
		) {
			actions.setSubmitting(false);
			dispatch(
				showNotification({
					message: __('Duration field can not be empty!', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
		} else if (
			isDripContentEnable &&
			(values.meta.drip_content.schedule_by_enroll_date === '' ||
				values.meta.drip_content.schedule_by_topic_complete_date === '')
		) {
			actions.setSubmitting(false);
			dispatch(
				showNotification({
					message: __('Drip content field value required', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
		} else if (values.lesson_title.trim() !== '') {
			actions.setSubmitting(true);
			if (lessonID) {
				// Returned so Formik's submitForm() resolves after the save (the
				// SCORM uploader waits on it for a new lesson's ID).
				return dispatch(updateLesson({ ID: lessonID, formData: values })).then(
					({ payload }) => {
						if (200 === payload?.status) {
							setLessonData(payload.data);
							actions.setValues(
								getLessonInitialValues(lessonID, payload.data)
							);
							actions.setSubmitting(false);
							setTimeout(() => {
								onRequestClose(payload.data);
							}, 500);
						} else {
							actions.setSubmitting(false);
							showNotification({
								message: payload?.data?.data,
								isShow: true,
								type: 'error',
							});
						}
					}
				);
			} else {
				// Returned so Formik's submitForm() resolves after the save (the
				// SCORM uploader waits on it for a new lesson's ID).
				return dispatch(createNewLesson({ formData: values })).then(
					({ payload }) => {
						if (200 === payload?.status) {
							setLessonID(payload.data?.ID);
							if (isSubCurriculum) {
								subTopicUpdateHandler(
									{
										id: payload.data?.ID,
										name: payload.data?.lesson_title,
										type: 'lesson',
									},
									itemIndex,
									subCurriculumIndex
								);
							} else if (topicUpdateHandler) {
								topicUpdateHandler(
									{
										id: payload.data?.ID,
										name: payload.data?.lesson_title,
										type: 'lesson',
									},
									itemIndex
								);
							}
							actions.setSubmitting(false);
							setLessonData(payload.data);
							actions.setValues(
								getLessonInitialValues(
									payload.data.ID,
									payload.data
								)
							);
							dispatch(
								showNotification({
									message: __('Lesson Created', 'academy'),
									isShow: true,
									type: 'success',
								})
							);
							// Close the "Add New Content" dropdown behind this
							// modal, then the modal itself — same as a
							// successful update. Without this, the modal was
							// left open showing "Update Lesson"; clicking it
							// again re-submitted against this now-current
							// lessonID (a real update, not a duplicate), but
							// there was never a reason for the modal to stay
							// open in the first place.
							if (isAddNewItem) {
								closeModal();
							}
							setTimeout(() => {
								onRequestClose(payload.data);
							}, 500);
							actions.setSubmitting(false);
						} else {
							actions.setSubmitting(false);
							showNotification({
								message: payload?.data?.data,
								isShow: true,
								type: 'error',
							});
						}
					}
				);
			}
		}
	};

	return (
		<React.Fragment>
			<ReactModalFormik
				title={__('Lesson', 'academy')}
				isOpen={isOpenModal}
				onRequestClose={onRequestClose}
				submitButtonLabel={
					lessonID
						? __('Update Lesson', 'academy')
						: __('Add lesson', 'academy')
				}
				suffix="lesson-form"
				size="medium"
				formik={{
					enableReinitialize: true,
					initialValues: getLessonInitialValues(lessonID, lessonData),
					onSubmit: onSubmitHandler,
				}}
			>
				{isModalLoading ? (
					<div className="academy-preloader">
						<Preloader />
					</div>
				) : (
					<>
						<LessonFormInner
							dripContentType={dripContentType}
							topics={topics}
							currentItemId={currentItemId}
							isDripContentEnable={isDripContentEnable}
						/>
					</>
				)}
			</ReactModalFormik>
		</React.Fragment>
	);
}

LessonModal.propTypes = propTypes;
export default LessonModal;
