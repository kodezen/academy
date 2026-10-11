import { Form, Formik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactModal from '@Components/Modal/ReactModal';
import { useDispatch, useSelector } from 'react-redux';
import {
	createNewCourse,
	getCourse,
	updateCourse,
} from '@Redux/Slices/courseSlice/courseSlice';
import { is_admin, route_path } from '@Utils/helper';
import {
	getCourseInitialValues,
	getCustomTaxonomy,
	getCoursePreviewUrl,
	flattenCurriculumTopics,
} from './helper';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import StatusSelect from '@Components/SubmitBox/StatusSelect';
import Button from '@Components/Button';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';
import { fetchSettings } from '@Redux/Slices/settingsSlice/settingsSlice';
import CourseFormInner from './CourseFormInner';
import LessonEditor from './LessonEditor';
import QuizEditor from './QuizEditor';
import TopBar from '@Components/TopBar';
import {
	Stepper,
	OverviewStepIcon,
	BuilderStepIcon,
	SettingsStepIcon,
} from '@Components/ui';
import { applyFilters } from '@wordpress/hooks';
import NavigationBlocker from '@Components/NavigationBlocker';
import { PendingPriceContext } from '@Components/PaidProductSelect/PaidProductPrice/pendingPriceContext';

import './styles.scss';
import AiCourseGeneration from './AiCourseGeneration';

const NewCourse = (props) => {
	const courses = useSelector((state) => state.courses);
	const settings = useSelector((state) => state.settings);
	const dispatch = useDispatch();
	const { id, openModal, onRequestClose, setEditItemID, contentLoading } =
		props;
	const [isLoading, setLoading] = useState(true);
	const [customTaxonomies, setCustomTaxonomies] = useState({});
	// Guards against duplicate course creation: on a NEW course, stepping
	// through "Save & Continue" fires a submit per step before the created id
	// lands in the URL — without these, each submit creates a fresh draft.
	// Refs (not state) so the submit handler reads the latest value
	// synchronously, regardless of Formik closure / re-render timing.
	// `createInFlightRef` blocks a concurrent create; `createdIdRef` turns every
	// submit after the first into an update.
	const createInFlightRef = useRef(false);
	const createdIdRef = useRef(null);
	// A product price typed in before this course was first saved (see
	// `PendingPriceContext`). Kept here rather than in the form, because the
	// form remounts on the save that creates the course. `take` always clears
	// it, and only hands it to the course that save created — never to some
	// other course this editor goes on to open.
	const pendingProductPriceRef = useRef(null);
	const pendingProductPrice = useMemo(
		() => ({
			set: (price) => {
				pendingProductPriceRef.current = price;
			},
			take: (courseId) => {
				const price = pendingProductPriceRef.current;
				pendingProductPriceRef.current = null;
				return courseId &&
					parseInt(courseId) === parseInt(createdIdRef.current)
					? price
					: null;
			},
		}),
		[]
	);
	const navigate = useNavigate();
	const { courseId } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();

	// Route-based curriculum-item editors (replace the old modals). When
	// `curriculum` is lesson/quiz/assignment we swap the tabbed editor for the
	// matching full-page editor, still inside this course Formik so unsaved
	// curriculum survives.
	const curriculumType = searchParams.get('curriculum');
	const isCurriculumRoute = [
		'lesson',
		'quiz',
		'assignment',
		'meeting',
		'booking',
	].includes(curriculumType);
	const routeTopicIndex = parseInt(searchParams.get('topic'), 10);
	// Present only for nested sub-curriculum items: the sub-curriculum topic's
	// index within the module. `null` for a normal top-level curriculum item.
	const routeSubTopicParam = searchParams.get('subtopic');
	const routeSubTopicIndex =
		routeSubTopicParam !== null ? parseInt(routeSubTopicParam, 10) : null;
	const routeItemId = searchParams.get('item_id');

	// While editing a lesson/quiz in the course builder we hoist the item
	// editor's own save button into this topbar (replacing the course Update
	// button) so there's a single, unambiguous primary action. This holds the
	// DOM slot the item editors portal their save button into.
	const [itemActionsNode, setItemActionsNode] = useState(null);
	// The quiz editor portals its own step stepper (Quiz Info/Questions/Settings)
	// into the topbar centre while it's open, so the sub-header is just a Back
	// button. Other item types keep the course stepper in the centre.
	const [centerSlotNode, setCenterSlotNode] = useState(null);
	// Frontend course modal: CourseFormInner portals its Overview/Builder/
	// Settings stepper into the modal header's centre, like the admin topbar.
	const [modalStepperNode, setModalStepperNode] = useState(null);
	const itemHasTopbarSave = [
		'lesson',
		'quiz',
		'assignment',
		'meeting',
		'booking',
	].includes(curriculumType);

	useEffect(() => {
		if (!settings.data) {
			dispatch(fetchSettings());
		}

		if ((!courses.data && id) || (!courses.data && courseId)) {
			setLoading(true);
			dispatch(getCourse(id ? id : courseId))
				.then(async ({ payload }) => {
					// For custom taxonomies handling. Do not touch it.
					return await getCustomTaxonomy(payload);
				})
				.then((res) => {
					setCustomTaxonomies(res);
				})
				.finally(() => setLoading(false));
		} else {
			getCustomTaxonomy() // For custom taxonomies handling. Do not touch it.
				.then((res) => {
					setCustomTaxonomies(res);
				})
				.finally(() => setLoading(false));
		}
	}, [id, courses.data]);

	const handleNavigation = (id, navigate, setEditItemID) => {
		if (is_admin) {
			const navParams = new URLSearchParams(window.location.search);
			navParams.set('id', id);
			navParams.set('action', 'edit');
			navigate(`?${navParams.toString()}`);
		} else {
			setEditItemID(id);
		}
	};

	const onSubmitHandler = (values, actions) => {
		const { updateTime, date, ...restValues } = values;
		// The timer duration is an integer meta (course-active-timer addon).
		// An empty string makes the REST create/update fail with a 400 — which,
		// on create, still leaves the post inserted, so each save spawns a
		// duplicate draft. Coerce it to a safe integer before every save.
		if (restValues.meta) {
			restValues.meta = {
				...restValues.meta,
				academy_course_timer_duration_value:
					parseInt(
						restValues.meta.academy_course_timer_duration_value,
						10
					) || 0,
			};
		}
		actions.setSubmitting(true);
		if (values.title !== '') {
			// Once the course exists (from the URL or a create earlier in this
			// session), every save is an update — never a second create.
			const existingId = id || courseId || createdIdRef.current;
			if (existingId) {
				dispatch(
					updateCourse({ ...restValues, id: existingId, date })
				).then(() => {
					actions.setSubmitting(false);
					// Reset the dirty baseline to exactly what was just saved —
					// i.e. the current form state. Rebuilding it from the server
					// response can differ field-by-field from the live form
					// (e.g. taxonomy/curriculum value shapes), which left the
					// form stuck "dirty" after a successful save.
					actions.resetForm({ values });
				});
			} else if (createInFlightRef.current) {
				// A create is already in flight (rapid multi-step "Save &
				// Continue"). Skip this duplicate submit — its data stays in the
				// still-dirty form and persists on the next save, now an update.
				actions.setSubmitting(false);
			} else if (values.status === 'future') {
				createInFlightRef.current = true;
				dispatch(
					createNewCourse({ ...restValues, status: 'draft' })
				).then(({ payload: response }) => {
					createInFlightRef.current = false;
					createdIdRef.current = response?.id ?? null;
					getCustomTaxonomy(response).then((customTaxonomies) => {
						const newCourse = getCourseInitialValues(
							response.id,
							[response],
							customTaxonomies
						);
						dispatch(
							updateCourse({
								...newCourse,
								date,
								status: 'future',
							})
						).then(({ payload: res }) => {
							actions.setSubmitting(false);
							actions.resetForm({
								values: getCourseInitialValues(
									res.id,
									[res],
									customTaxonomies
								),
							});
							handleNavigation(res.id, navigate, setEditItemID);
						});
					});
				});
			} else {
				createInFlightRef.current = true;
				dispatch(createNewCourse(restValues)).then(
					({ payload: res }) => {
						createInFlightRef.current = false;
						createdIdRef.current = res?.id ?? null;
						getCustomTaxonomy(res).then((customTaxonomies) => {
							actions.setSubmitting(false);
							actions.resetForm({
								values: getCourseInitialValues(
									res.id,
									[res],
									customTaxonomies
								),
							});
							handleNavigation(res.id, navigate, setEditItemID);
						});
					}
				);
			}
		} else {
			dispatch(
				showNotification({
					message: __('Title missing!', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
			setTimeout(() => {
				actions.setSubmitting(false);
			}, 500);
		}
	};

	return (
		<div className="academy-dashboard__content">
			{isLoading ? (
				<Preloader />
			) : (
				<Formik
					initialValues={getCourseInitialValues(
						id,
						courses.data,
						customTaxonomies
					)}
					onSubmit={onSubmitHandler}
					key={id || courseId}
				>
					{({ values, setFieldValue, isSubmitting, dirty }) => {
						const isShowCourseType =
							settings?.data?.monetization_engine !==
							'paid-memberships-pro';

						const curriculum =
							values?.meta?.academy_course_curriculum || [];
						// The Content Drip prerequisite picker (and any other
						// consumer expecting selectable items) needs the actual
						// lessons/quizzes/etc., not the modules that contain them.
						const flatCurriculumTopics =
							flattenCurriculumTopics(curriculum);

						// Fold the saved item (lesson/quiz/assignment) into the
						// course curriculum (same association logic as the
						// builder's topicUpdateHandler) and switch the URL to
						// edit-mode.
						// Insert-or-update `item` in a topics array by (type, id).
						const foldItem = (list, item) => {
							const next = Array.isArray(list) ? [...list] : [];
							const existingIndex = next.findIndex(
								(t) =>
									t?.type === item.type &&
									parseInt(t?.id, 10) ===
										parseInt(item.id, 10)
							);
							if (existingIndex !== -1) {
								next[existingIndex] = item;
							} else {
								next.push(item);
							}
							return next;
						};

						// `navigate: false` folds the item in place without the
						// `item_id` URL sync — used to refresh a curriculum row's
						// display name (e.g. after renaming an already-open quiz)
						// without re-triggering the same-URL navigate that was
						// found to clobber the child editor's just-reset Formik
						// state (see QuizForm's saveHandler).
						const handleItemSaved = (item, { navigate = true } = {}) => {
							const isSub =
								routeSubTopicIndex !== null &&
								!Number.isNaN(routeSubTopicIndex);
							const updated = curriculum.map(
								(module, modIndex) => {
									if (modIndex !== routeTopicIndex)
										return module;
									if (!Array.isArray(module.topics))
										return module;
									// Sub-curriculum item: fold into the nested
									// sub-curriculum topic's own `topics` list.
									if (isSub) {
										return {
											...module,
											topics: module.topics.map(
												(topic, topIndex) =>
													topIndex ===
													routeSubTopicIndex
														? {
																...topic,
																topics: foldItem(
																	topic.topics,
																	item
																),
															}
														: topic
											),
										};
									}
									// Top-level item.
									return {
										...module,
										topics: foldItem(module.topics, item),
									};
								}
							);
							setFieldValue(
								'meta.academy_course_curriculum',
								updated
							);
							if (!navigate) {
								return;
							}
							setFieldValue('updateTime', Date.now());
							const sp = new URLSearchParams(searchParams);
							sp.set('item_id', item.id);
							setSearchParams(sp, { replace: true });
						};
						const handleItemRenamed = (item) =>
							handleItemSaved(item, { navigate: false });

						// Exit the lesson editor back to the course editor at the
						// given step (used by both "Back to builder" and the
						// topbar stepper shown while editing a lesson).
						const goToCourseStep = (key) => {
							const sp = new URLSearchParams(searchParams);
							sp.delete('curriculum');
							sp.delete('topic');
							sp.delete('subtopic');
							sp.delete('item_id');
							sp.set('step', key);
							setSearchParams(sp);
						};

						const backToBuilder = () => goToCourseStep('builder');

						const courseStepTabs = [
							{
								key: 'overview',
								label: __('Overview', 'academy'),
								icon: <OverviewStepIcon />,
							},
							{
								key: 'builder',
								label: __('Builder', 'academy'),
								icon: <BuilderStepIcon />,
							},
							{
								key: 'settings',
								label: __('Settings', 'academy'),
								icon: <SettingsStepIcon />,
							},
						];

						// The status dropdown already shows the chosen status
						// (Publish / Draft / …), so the primary button uses a
						// neutral action label instead of mirroring "Publish".
						const courseSaveLabel =
							id || courseId || values.post_ID
								? __('Update', 'academy')
								: __('Save', 'academy');

						return (
							<Form>
								<NavigationBlocker
									when={dirty}
									url={`${route_path}admin.php?page=academy-courses&id=${
										id || courseId
									}&action=edit`}
								/>
								{isCurriculumRoute && (
									<>
										<TopBar
											render={() => (
												<h3 className="academy-topbar-heading">
													<span className="academy-icon academy-icon--angle-right" />
													{__(
														'Edit Course',
														'academy'
													)}
												</h3>
											)}
											centerContent={() =>
												curriculumType === 'quiz' ? (
													// The quiz editor portals its
													// own step stepper in here.
													<div
														ref={setCenterSlotNode}
														className="academy-topbar-center-slot"
													/>
												) : (
													<Stepper
														steps={courseStepTabs}
														value="builder"
														onChange={goToCourseStep}
													/>
												)
											}
											rightContent={() => (
												<div className="academy-course-topbar-right">
													{getCoursePreviewUrl(
														values.link
													) && (
														<Button
															type="link"
															link={getCoursePreviewUrl(
																values.link
															)}
															target="_blank"
															preset="transparent"
															suffix="course-preview"
															label={__(
																'Preview',
																'academy'
															)}
															icon={
																<span className="academy-icon academy-icon--link-arrow" />
															}
															iconPosition="left"
														/>
													)}
													{itemHasTopbarSave ? (
														// The lesson/quiz editor
														// portals its own primary
														// save button in here (the
														// course keeps autosaving,
														// so no separate course
														// Update is needed while
														// editing an item).
														<div
															ref={setItemActionsNode}
															className="academy-topbar-item-action flex items-center gap-3"
														/>
													) : (
														<StatusSelect
															name="status"
															type="course"
															isSubmitted={
																isSubmitting
															}
															value={values.status}
															saveValueHandler={
																setFieldValue
															}
															label={
																courseSaveLabel
															}
															isMuted={!dirty}
															showStickyOption={
																true
															}
														/>
													)}
												</div>
											)}
										/>
										{curriculumType === 'lesson' && (
											<LessonEditor
												courseTitle={values.title}
												lessonId={routeItemId}
												topics={flatCurriculumTopics}
												dripContentType={
													values?.meta
														?.academy_course_drip_content_type
												}
												isDripContentEnable={
													values?.meta
														?.academy_course_drip_content_enabled
												}
												onSaved={handleItemSaved}
												onBack={backToBuilder}
												topbarActionsNode={
													itemActionsNode
												}
											/>
										)}
										{curriculumType === 'quiz' && (
											<QuizEditor
												courseTitle={values.title}
												itemId={routeItemId}
												topicIndex={routeTopicIndex}
												topics={flatCurriculumTopics}
												dripContentType={
													values?.meta
														?.academy_course_drip_content_type
												}
												isDripContentEnable={
													values?.meta
														?.academy_course_drip_content_enabled
												}
												onSaved={handleItemSaved}
												onRenamed={handleItemRenamed}
												onBack={backToBuilder}
												topbarActionsNode={
													itemActionsNode
												}
												topbarCenterNode={
													centerSlotNode
												}
											/>
										)}
										{[
											'assignment',
											'meeting',
											'booking',
										].includes(curriculumType) &&
											applyFilters(
												`academy.${curriculumType}-editor.page`,
												null,
												{
													courseTitle: values.title,
													itemId: routeItemId,
													topicIndex: routeTopicIndex,
													topics: flatCurriculumTopics,
													dripContentType:
														values?.meta
															?.academy_course_drip_content_type,
													isDripContentEnable:
														values?.meta
															?.academy_course_drip_content_enabled,
													onSaved: handleItemSaved,
													onBack: backToBuilder,
													topbarActionsNode:
														itemActionsNode,
												}
											)}
									</>
								)}
								{!isCurriculumRoute && is_admin && (
									<PendingPriceContext.Provider
										value={pendingProductPrice}
									>
										<CourseFormInner
											id={id}
											isShowCourseType={isShowCourseType}
											setLoading={setLoading}
										/>
									</PendingPriceContext.Provider>
								)}
								{!isCurriculumRoute && !is_admin && (
									<ReactModal
										isOpen={openModal}
										title={__('Course', 'academy')}
										subtitle={
											id || courseId
												? __('Edit course', 'academy')
												: __('Create course', 'academy')
										}
										onRequestClose={onRequestClose}
										suffix="course"
										isEnabledHeader={true}
										size="large"
										isEnabledResizer={false}
										largeModalMarginTop="75px"
										headerCenter={
											<div ref={setModalStepperNode} />
										}
										externalComponent={
											<div className="academy-course-topbar-right">
												<AiCourseGeneration
													ID={id}
													setLoading={setLoading}
													isFrontend={true}
												/>
												<StatusSelect
													name="status"
													type="course"
													isSubmitted={isSubmitting}
													value={values.status}
													saveValueHandler={
														setFieldValue
													}
													label={
														id || values.post_ID
															? __(
																	'Update',
																	'academy'
																)
															: __(
																	'Save',
																	'academy'
																)
													}
													isMuted={!dirty}
													showStickyOption={true}
													disabledOptionValues={
														settings?.data
															?.is_instructor_can_publish_course
															? []
															: ['publish']
													}
													disabledOptionReason={__(
														'Publishing is disabled for instructors by the site admin.',
														'academy'
													)}
												/>
											</div>
										}
									>
										{contentLoading ? (
											<Preloader />
										) : (
											<PendingPriceContext.Provider
												value={pendingProductPrice}
											>
												<CourseFormInner
													id={id}
													isShowCourseType={
														isShowCourseType
													}
													stepperSlotNode={
														modalStepperNode
													}
												/>
											</PendingPriceContext.Provider>
										)}
									</ReactModal>
								)}
							</Form>
						);
					}}
				</Formik>
			)}
		</div>
	);
};

export default NewCourse;
