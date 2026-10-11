import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';
import LessonFormInner from '@Containers/Lesson/LessonModal/LessonFormInner';
import { getLessonInitialValues } from '@Containers/Lesson/LessonModal/helper';
import {
	createNewLesson,
	updateLesson,
} from '@Redux/Slices/lessonSlice/lessonSlice';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { API, namespace, generateSlug } from '@Utils/helper';
import { Breadcrumb } from '@Components/ui';
import SplitButton from '@Components/SubmitBox/SplitButton';
import TopBar from '@Components/TopBar';
import EditorSubHeader from '@Components/EditorSubHeader';
import '@Containers/Lesson/LessonModal/styles.scss';

/*
 * Full-page (route-based) lesson editor — replaces the old LessonModal for the
 * admin course builder. Rendered inside NewCourse so it shares the course
 * Formik tree: the unsaved curriculum survives while you edit a lesson here.
 *
 * On save the lesson is persisted immediately (create/update thunk) and the
 * parent's `onSaved` folds the lesson into the course curriculum + makes the
 * URL edit-mode (lesson_id) so a refresh keeps editing.
 */
const LessonEditor = ({
	courseTitle,
	lessonId,
	topics,
	dripContentType,
	isDripContentEnable,
	onSaved,
	onBack,
	leadingCrumbs,
	headerMode = 'subheader',
	// DOM slot in the course topbar to portal the save button into (course
	// builder only). When absent, the button falls back into the sub-header.
	topbarActionsNode = null,
}) => {
	const dispatch = useDispatch();
	const [lessonID, setLessonID] = useState(lessonId || null);
	const [formData, setFormData] = useState(false);
	const [isLoading, setLoading] = useState(!!lessonId);
	// Id whose data is already in the form. Starts null even when a lessonId is
	// given so the first open of an existing lesson still fetches.
	const loadedIdRef = useRef(null);
	// Whether the current save should return to the course builder afterwards
	// (primary "Save" closes; the caret's "Save as …" keeps you editing).
	const closeAfterSaveRef = useRef(false);
	// Status to force for the current save (set by the caret items). Overrides
	// the form value at submit time so it's immune to Formik state-flush timing.
	const pendingStatusRef = useRef(null);

	useEffect(() => {
		const incoming = lessonId ? parseInt(lessonId) : null;
		// Skip the (full-form-preloader) fetch when we already have this id in
		// the form — e.g. right after creating/saving here, the parent flips the
		// URL to edit mode (item_id) and the id "changes" even though the form is
		// already populated from the save response. Refetching would blank the
		// entire form behind the preloader for no reason.
		if (!incoming || incoming === loadedIdRef.current) {
			return;
		}
		setLoading(true);
		API.get(`${namespace}lessons/${incoming}`, {
			params: { context: 'edit' },
		})
			.then((res) => {
				setFormData(res.data);
				setLessonID(res.data?.ID || incoming);
				loadedIdRef.current = res.data?.ID || incoming;
			})
			.finally(() => setLoading(false));
	}, [lessonId]);

	// A brand-new lesson: jump to the top of the editor and focus the title so
	// you can start typing immediately instead of hunting for the field. The
	// content (WYSIWYG) editor loads asynchronously and can steal focus once it
	// mounts, so we also guard: if focus lands in the content editor shortly
	// after opening, bounce it back to the title a single time.
	useEffect(() => {
		if (lessonId) {
			return undefined;
		}
		const getTitle = () =>
			document.querySelector('input.academy-input[name="lesson_title"]');
		const focusTitle = () => {
			const el = getTitle();
			if (el) {
				el.focus({ preventScroll: true });
			}
		};

		let cleaned = false;
		const onFocusIn = (e) => {
			if (
				e.target &&
				e.target.closest &&
				e.target.closest('.academy-editor-tinymce-wrapper')
			) {
				focusTitle();
				cleanup();
			}
		};
		function cleanup() {
			if (cleaned) {
				return;
			}
			cleaned = true;
			document.removeEventListener('focusin', onFocusIn, true);
		}

		// (The course builder scrolls to top on the route change itself.)
		const initial = setTimeout(focusTitle, 60);
		document.addEventListener('focusin', onFocusIn, true);
		// Stop guarding after the editor has had time to settle.
		const stop = setTimeout(cleanup, 2000);

		return () => {
			clearTimeout(initial);
			clearTimeout(stop);
			cleanup();
		};
	}, []);

	const notifyError = (actions, message) => {
		actions.setSubmitting(false);
		dispatch(showNotification({ message, isShow: true, type: 'error' }));
	};

	const onSubmitHandler = (values, actions) => {
		actions.setSubmitting(true);
		if (values?.lesson_title?.trim() === '') {
			return notifyError(actions, __('Title Missing', 'academy'));
		}
		if (
			values.meta.video_duration.hours === '' ||
			values.meta.video_duration.minutes === '' ||
			values.meta.video_duration.seconds === ''
		) {
			return notifyError(
				actions,
				__('Duration field can not be empty!', 'academy')
			);
		}
		if (
			isDripContentEnable &&
			(values.meta.drip_content.schedule_by_enroll_date === '' ||
				values.meta.drip_content.schedule_by_topic_complete_date === '')
		) {
			return notifyError(
				actions,
				__('Drip content field value required', 'academy')
			);
		}

		// Always send a slug, even when the slug UI is collapsed/hidden: fall
		// back to one derived from the title. On create the backend also
		// uniquifies it, so a duplicate title never blocks the save.
		const baseValues =
			values?.lesson_name && values.lesson_name.trim() !== ''
				? values
				: { ...values, lesson_name: generateSlug(values.lesson_title) };
		// A caret "Save as Draft/Private" forces the status regardless of the
		// (async) Formik field update; the primary save keeps the current one.
		const submitValues = pendingStatusRef.current
			? { ...baseValues, lesson_status: pendingStatusRef.current }
			: baseValues;
		pendingStatusRef.current = null;
		const shouldClose = closeAfterSaveRef.current;
		closeAfterSaveRef.current = false;
		const maybeClose = () => {
			if (shouldClose && onBack) {
				onBack();
			}
		};

		if (lessonID) {
			// Returned so Formik's submitForm() resolves after the save (the
			// SCORM uploader waits on it for a new lesson's ID).
			return dispatch(updateLesson({ ID: lessonID, formData: submitValues })).then(
				({ payload }) => {
					actions.setSubmitting(false);
					if (200 === payload?.status) {
						// resetForm (not setValues) so the dirty baseline moves to
						// exactly what was just saved — setValues only touched
						// `values`, leaving the stale pre-save `initialValues` (from
						// the `formData` prop, which updates on its own schedule)
						// as the comparison point, so the form stayed "dirty" and
						// the Save button stuck enabled right after a save. Same
						// fix as Courses/new-course/index.js's onSubmitHandler.
						// Keep `formData` (Formik's enableReinitialize source) in
						// step with the save, so the editor that stays open on
						// the standalone page never reinitialises from stale data.
						setFormData(payload.data);
						actions.resetForm({
							values: getLessonInitialValues(
								lessonID,
								payload.data
							),
						});
						if (onSaved) {
							onSaved({
								id: lessonID,
								name: payload.data?.lesson_title,
								type: 'lesson',
							});
						}
						dispatch(
							showNotification({
								message: __('Lesson Updated', 'academy'),
								isShow: true,
								type: 'success',
							})
						);
						maybeClose();
					}
					// On failure updateLesson's own catch already dispatched
					// the real server message (RestGuard's denial reason,
					// etc.) — payload here doesn't carry it (rejectWithValue
					// shapes it as {message, success}, not {data:{data}}), so
					// calling notifyError with the wrong path only ever
					// produced a second, blank toast on top of the real one.
				}
			);
		} else {
			// Returned so Formik's submitForm() resolves after the save (the
			// SCORM uploader waits on it for a new lesson's ID).
			return dispatch(createNewLesson({ formData: submitValues })).then(
				({ payload }) => {
					actions.setSubmitting(false);
					if (200 === payload?.status) {
						const newId = payload.data?.ID;
						setLessonID(newId);
						// Mark as loaded so the parent's URL switch to edit mode
						// (item_id) doesn't retrigger the full-form fetch below.
						loadedIdRef.current = parseInt(newId);
						// See the updateLesson branch above for why this is
						// resetForm rather than setValues.
						// Without this, `formData` stays `false` for a new
						// lesson; once lessonID is set, initialValues becomes
						// getLessonInitialValues(newId, false) = the blank
						// schema and enableReinitialize wipes the form.
						setFormData(payload.data);
						actions.resetForm({
							values: getLessonInitialValues(
								newId,
								payload.data
							),
						});
						if (onSaved) {
							onSaved({
								id: newId,
								name: payload.data?.lesson_title,
								type: 'lesson',
							});
						}
						dispatch(
							showNotification({
								message: __('Lesson Created', 'academy'),
								isShow: true,
								type: 'success',
							})
						);
						maybeClose();
					}
					// See the updateLesson branch above for why this no
					// longer calls notifyError on failure.
				}
			);
		}
	};

	const crumbs = [
		...(leadingCrumbs || [
			{ label: courseTitle || __('Course', 'academy'), onClick: onBack },
			{ label: __('Course Builder', 'academy'), onClick: onBack },
		]),
		{
			label: lessonID
				? __('Edit Lesson', 'academy')
				: __('New Lesson', 'academy'),
		},
	];

	return (
		<Formik
			enableReinitialize={true}
			initialValues={getLessonInitialValues(lessonID, formData)}
			onSubmit={onSubmitHandler}
		>
			{({ isSubmitting, values, submitForm, setFieldValue, dirty }) => {
				// Save-as-status without leaving the editor (caret items).
				const saveAndStay = (status) => {
					closeAfterSaveRef.current = false;
					pendingStatusRef.current = status;
					setFieldValue('lesson_status', status);
					submitForm();
				};
				// Primary save = save with the current status and RETURN to the
				// course builder; the caret keeps you editing (save & stay).
				const currentStatus = values.lesson_status || 'publish';
				// "Update Lesson" only when the lesson was ALREADY published when
				// this editor opened. A lesson that's just being published now —
				// a brand-new one, or one switched here from Draft/Private via
				// the caret — reads "Publish Lesson"; Draft/Private read
				// "Save <status>".
				const openedPublished =
					Boolean(formData) &&
					formData.lesson_status === 'publish';
				const primaryLabel =
					currentStatus === 'draft'
						? __('Save Draft', 'academy')
						: currentStatus === 'private'
							? __('Save Private', 'academy')
							: openedPublished
								? __('Update Lesson', 'academy')
								: __('Publish Lesson', 'academy');
				// Caret menu = every OTHER status, so you can always switch — in
				// particular back to Publish from Draft/Private (which the fixed
				// draft/private list never allowed).
				const STATUS_ITEMS = [
					{ status: 'publish', label: __('Publish', 'academy') },
					{ status: 'draft', label: __('Save as Draft', 'academy') },
					{ status: 'private', label: __('Save as Private', 'academy') },
				];
				const saveButton = (
					<SplitButton
						primaryLabel={primaryLabel}
						primaryLoading={isSubmitting}
						isMuted={!dirty}
						onPrimary={() => {
							// Course builder (subheader): saving a lesson is a
							// step in building the curriculum, so return to it.
							// Standalone Lessons page (topbar): behave like the
							// standard WP "Update" — stay on the editor.
							closeAfterSaveRef.current = headerMode !== 'topbar';
							pendingStatusRef.current = null;
							submitForm();
						}}
						items={STATUS_ITEMS.filter(
							(it) => it.status !== currentStatus
						).map((it) => ({
							label: it.label,
							onClick: () => saveAndStay(it.status),
						}))}
					/>
				);
				return (
				/*
				 * NOTE: this editor renders inside NewCourse's course <form>, so
				 * it must NOT emit its own <form> element — nested forms are
				 * invalid HTML and make the "Add Lesson" submit fall through to a
				 * native submit, reloading the whole page. We keep the Formik
				 * context (fields/validation still work) but submit imperatively
				 * via submitForm() from plain type="button" buttons.
				 */
				<div>
					{/* topbar mode: breadcrumb + actions in the topbar itself
					    (standalone Lessons page). subheader mode: in a bar below
					    the topbar (course builder, where NewCourse owns the
					    topbar with the stepper + course save). */}
					{headerMode === 'topbar' && (
						<TopBar
							render={() => <Breadcrumb items={crumbs} />}
							rightContent={() => (
								<div className="academy-course-topbar-right">
										{saveButton}
									</div>
							)}
						/>
					)}
					<div className="academy-page-content academy-page-content--course academy-editor academy-editor--course">
						{headerMode === 'subheader' && (
							<EditorSubHeader
								className="academy-editor-subheader--bare"
								onBack={onBack}
								backLabel={__(
									'Course Builder',
									'academy'
								)}
							>
								{/* When the topbar slot exists the save button
								    is portaled up there; only fall back to the
								    sub-header if it isn't available yet. */}
								{!topbarActionsNode && saveButton}
							</EditorSubHeader>
						)}
						{headerMode === 'subheader' &&
							topbarActionsNode &&
							createPortal(saveButton, topbarActionsNode)}
						{isLoading ? (
							<div className="academy-preloader">
								<Preloader />
							</div>
						) : (
							<LessonFormInner
								dripContentType={dripContentType}
								topics={topics}
								currentItemId={lessonID}
								isDripContentEnable={isDripContentEnable}
							/>
						)}
					</div>
				</div>
			);
			}}
		</Formik>
	);
};

export default LessonEditor;
