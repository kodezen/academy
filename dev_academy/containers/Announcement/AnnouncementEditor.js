import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';
import TopBar from '@Components/TopBar';
import { Breadcrumb } from '@Components/ui';
import StatusSelect from '@Components/SubmitBox/StatusSelect';
import StatusBadge from '@Components/StatusBadge';
import { getStatusActionLabel } from '@Utils/statusLabel';
import { API, namespace } from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import {
	createAnnouncement,
	updateAnnouncement,
} from '@Redux/Slices/announcementSlice/announcementSlice';
import AnnouncementForm from './AnnouncementModal/AnnouncementForm';
import { getInitialValues } from './AnnouncementModal/helper';

/*
 * Full-page (route-based) announcement editor — replaces the modal on the
 * Announcements page. Reuses AnnouncementForm + the create/update thunks; the
 * topbar carries the breadcrumb + save.
 */
const AnnouncementEditor = ({ itemId, onSaved, leadingCrumbs }) => {
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

		// updateAnnouncement/createAnnouncement already dispatch their own
		// success OR error notification internally — this only needs to
		// gate onSaved() on the request having actually succeeded (a 403
		// from RestGuard must not look like a save).
		//
		// Saving keeps you on the editor (like WP's "Update"): reset the
		// dirty baseline to what was just saved so the button mutes again,
		// then hand the saved id to onSaved so a brand-new announcement
		// flips the route into edit mode — otherwise the next save would
		// call createAnnouncement again and produce a duplicate.
		const finish = (payload) => {
			actions.setSubmitting(false);
			const succeeded =
				200 === payload?.status || 201 === payload?.status;
			if (!succeeded) {
				return;
			}
			actions.resetForm({ values });
			if (onSaved) {
				onSaved({ id: payload?.data?.id || itemId });
			}
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

	const crumbs = [
		...(leadingCrumbs || []),
		{
			label: itemId
				? __('Edit Announcement', 'academy')
				: __('New Announcement', 'academy'),
		},
	];

	return (
		<Formik
			enableReinitialize={true}
			initialValues={getInitialValues(itemId, formData)}
			onSubmit={onSubmitHandler}
		>
			{({ isSubmitting, dirty, values, setFieldValue }) => (
				<Form>
					<TopBar
						render={() => (
							<div className="flex items-center gap-3">
								<Breadcrumb items={crumbs} />
								<StatusBadge status={values.status || 'draft'} />
							</div>
						)}
						rightContent={() => (
							<div className="academy-course-topbar-right flex items-center gap-3">
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
								/>
							</div>
						)}
					/>
					<div className="academy-page-content academy-page-content--announcement">
						{isLoading ? (
							<div className="academy-preloader">
								<Preloader />
							</div>
						) : (
							<div className="rounded-lg border border-academy-border bg-academy-surface p-6">
								<AnnouncementForm />
							</div>
						)}
					</div>
				</Form>
			)}
		</Formik>
	);
};

export default AnnouncementEditor;
