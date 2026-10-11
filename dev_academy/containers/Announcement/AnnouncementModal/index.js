import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';
import ReactModal from '@Components/Modal/ReactModal';
import StatusSelect from '@Components/SubmitBox/StatusSelect';
import StatusBadge from '@Components/StatusBadge';
import { getStatusActionLabel } from '@Utils/statusLabel';
import { API, namespace } from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import {
	createAnnouncement,
	updateAnnouncement,
} from '@Redux/Slices/announcementSlice/announcementSlice';
import AnnouncementForm from './AnnouncementForm';
import { getInitialValues } from './helper';
import './styles.scss';

/*
 * Frontend-dashboard announcement editor — a modal, not the route-based
 * full-page editor wp-admin uses (AnnouncementEditor.js). Only mounted while
 * open (see Announcement/index.js), so it never sits in the DOM as an empty
 * card between opens.
 */
const AnnouncementModal = ({ itemId, onRequestClose }) => {
	const dispatch = useDispatch();
	const [formData, setFormData] = useState(false);
	const [isLoading, setLoading] = useState(!!itemId);

	useEffect(() => {
		if (itemId) {
			setLoading(true);
			API.get(`${namespace}academy_announcement/${parseInt(itemId)}`, {
				params: { context: 'edit' },
			})
				.then((res) => setFormData(res.data))
				.finally(() => setLoading(false));
		}
	}, [itemId]);

	const notify = (message, type = 'error') =>
		dispatch(showNotification({ message, isShow: true, type }));

	const onSubmitHandler = (values, actions) => {
		actions.setSubmitting(true);
		if (values.meta.academy_announcements_course_ids.length === 0) {
			actions.setSubmitting(false);
			notify(__('No Course Selected', 'academy'));
			return;
		}
		if (values.title === '') {
			actions.setSubmitting(false);
			notify(__('Title Missing', 'academy'));
			return;
		}
		if (values.content === '') {
			actions.setSubmitting(false);
			notify(__('Content Missing', 'academy'));
			return;
		}

		// createAnnouncement/updateAnnouncement dispatch their own
		// success/error notification internally (see announcementSlice) —
		// re-notifying here was redundant (a second, differently-worded
		// toast on every save) and, worse, unconditional: rejectWithValue
		// still resolves this promise, so a failed request (e.g.
		// RestGuard's 403) fell through to this "success" branch anyway,
		// closing the modal and resetting the dirty baseline as if the
		// save had gone through.
		const finish = (payload) => {
			actions.setSubmitting(false);
			const succeeded =
				200 === payload?.status || 201 === payload?.status;
			if (!succeeded) {
				return;
			}
			// Reset the dirty baseline to what was just saved before closing —
			// onRequestClose() unmounts this modal in the normal case, but if
			// that's ever delayed (or skipped), the button must not stay
			// clickable with nothing new to save: without this, resubmitting
			// the same unchanged values with no itemId keeps calling
			// createAnnouncement, producing duplicate announcements.
			actions.resetForm({ values });
			onRequestClose();
		};

		if (itemId) {
			// Editing an announcement that already exists: WP assigned it a
			// real `post_date` the moment it was first created, so `date`
			// is always a genuine value here — safe to send as-is, same as
			// a freshly picked schedule date.
			dispatch(updateAnnouncement(values)).then(({ payload }) =>
				finish(payload)
			);
			return;
		}

		// Creating a brand-new announcement: the REST API rejects `date` on
		// insert unless it's already a real date — nothing has been
		// assigned yet, so the initial schema's empty string 400s with
		// `rest_invalid_date`. Scheduling a new announcement is therefore a
		// two-step save — create it first (no `date`, forced to `draft` so
		// it never briefly goes out under a status with no date to back
		// it), then immediately update it with the chosen `future`
		// date/status — mirroring the course editor's own create flow
		// (`Courses/new-course/index.js`).
		const { date, ...restValues } = values;
		if (values.status === 'future') {
			dispatch(
				createAnnouncement({ ...restValues, status: 'draft' })
			).then(({ payload }) => {
				if (200 !== payload?.status && 201 !== payload?.status) {
					finish(payload);
					return;
				}
				dispatch(
					updateAnnouncement({
						...restValues,
						ID: payload.data.id,
						date,
						status: 'future',
					})
				).then(({ payload: updatePayload }) => finish(updatePayload));
			});
			return;
		}

		dispatch(createAnnouncement(restValues)).then(({ payload }) =>
			finish(payload)
		);
	};

	return (
		<Formik
			enableReinitialize={true}
			initialValues={getInitialValues(itemId, formData)}
			onSubmit={onSubmitHandler}
		>
			{({ isSubmitting, submitForm, dirty, values, setFieldValue }) => (
				<Form>
					<ReactModal
						isOpen={true}
						title={__('Announcement', 'academy')}
						subtitle={
							itemId
								? __('Edit announcement', 'academy')
								: __('Create announcement', 'academy')
						}
						onRequestClose={onRequestClose}
						suffix="announcements"
						isEnabledHeader={true}
						isEnabledResizer={false}
						size="medium"
						externalComponent={
							<div className="academy-course-topbar-right flex items-center gap-3">
								<StatusBadge status={values.status || 'draft'} />
								{/* react-modal renders its content (this header
									included) through a portal, so StatusSelect's
									primary button is not a DOM descendant of
									Formik's <form> — a plain type="submit" never
									fires the form's submit event, so it's kept a
									plain button that calls submitForm() directly
									(submitButtonType="button" + submitHandler
									below), same as the button it replaces did. */}
								<StatusSelect
									name="status"
									type="announcement"
									isSubmitted={isSubmitting}
									value={values.status}
									saveValueHandler={setFieldValue}
									label={getStatusActionLabel(
										values.status,
										Boolean(itemId) &&
											values.status === 'publish'
									)}
									isMuted={!dirty}
									submitButtonType="button"
									submitHandler={submitForm}
								/>
							</div>
						}
					>
						{isLoading ? (
							<Preloader />
						) : (
							<AnnouncementForm />
						)}
					</ReactModal>
				</Form>
			)}
		</Formik>
	);
};

export default AnnouncementModal;
