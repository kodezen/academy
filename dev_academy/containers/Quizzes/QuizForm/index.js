import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createQuiz, updateQuiz } from '@Redux/Slices/quizSlice/quizSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import StatusBadge from '@Components/StatusBadge';
import Button from '@Components/Button';
import FirstStep from './Step/FirstStep';
import { FormikWizard } from 'formik-wizard-form';
import PropTypes from 'prop-types';
import QuizFormContext from '../context/QuizFormContext';
import QuizHeaderPortalContext from '../context/QuizHeaderPortalContext';
import SecondStep from './Step/SecondStep';
import Steps from './Steps';
import ThirdStep from './Step/ThirdStep';
import { __ } from '@wordpress/i18n';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { quizFormInitialValues } from '../helper';
import TopBar from '@Components/TopBar';
import EditorSubHeader from '@Components/EditorSubHeader';
import StatusSelect from '@Components/SubmitBox/StatusSelect';
import SplitButton from '@Components/SubmitBox/SplitButton';
import { Stepper } from '@Components/ui';
import { getStatusActionLabel } from '@Utils/statusLabel';
import { useScrollToTopOnChange } from '@Utils/hooks/useScrollToTop';
import './styles/index.scss';

const propTypes = {
	data: PropTypes.any,
	cancelHandler: PropTypes.func,
	onBack: PropTypes.func,
};

const QUIZ_STEPS = [
	{ key: 0, label: __('Quiz Info', 'academy') },
	{ key: 1, label: __('Questions', 'academy') },
	{ key: 2, label: __('Settings', 'academy') },
];

// Quizzes support publish/draft/private — no schedule/password axis.
const QUIZ_STATUS_OPTIONS = [
	{
		label: __('Publish', 'academy'),
		value: 'publish',
		description: __('Available to enrolled students', 'academy'),
		color: 'success',
	},
	{
		label: __('Draft', 'academy'),
		value: 'draft',
		description: __('Hidden until published', 'academy'),
		color: 'warning',
	},
	{
		label: __('Private', 'academy'),
		value: 'private',
		description: __('Admins and editors only', 'academy'),
		color: 'danger',
	},
];

// The wizard lib only exposes single-step handleNext/handlePrev (re-bound each
// render), so a free stepper click can't jump directly. This drives it toward
// `target` one step per render: each move changes currentStepIndex, which
// re-runs the effect until the target is reached. handleNext never submits here
// because we only step forward while the current step isn't the last.
function StepNavigator({
	currentStepIndex,
	handleNext,
	handlePrev,
	target,
	onDone,
}) {
	const busyRef = useRef(false);
	useEffect(() => {
		if (target === null || target === undefined) {
			return;
		}
		if (target === currentStepIndex) {
			onDone();
			return;
		}
		if (busyRef.current) {
			return;
		}
		busyRef.current = true;
		const move = target > currentStepIndex ? handleNext : handlePrev;
		Promise.resolve(move()).finally(() => {
			busyRef.current = false;
		});
	}, [target, currentStepIndex, handleNext, handlePrev]);
	return null;
}

// The wizard's step (Quiz Info/Questions/Settings) lives in FormikWizard's own
// state, not the URL, so the app-wide URL-based scroll-to-top hook never sees
// it change — scroll here directly whenever the step does.
function ScrollTopOnStepChange({ currentStepIndex }) {
	useScrollToTopOnChange(currentStepIndex);
	return null;
}

export default function QuizForm({
	data = {},
	cancelHandler = () => {},
	headerMode = 'inline',
	headerLeft = null,
	onBack,
	// Course-builder only: DOM slot in the course topbar to portal the wizard's
	// save controls (Save / Save & Continue / Update) into, so the primary
	// action lives in the topbar instead of a second bar under it.
	topbarActionsNode = null,
	// Course-builder only: DOM slot in the course topbar CENTRE to portal the
	// step stepper into, leaving the sub-header as just a Back button.
	topbarCenterNode = null,
}) {
	const dispatch = useDispatch();
	const allAddons = useSelector((state) => state.addons);
	const [quizId, setQuizId] = useState(null);
	// A mid-wizard create sets `quizId` (local state) but Formik's own
	// `values.id` stays empty — later steps (e.g. SecondStep passing
	// `quizId={values.id}` down to the question form) read `values.id`
	// directly, so it must be folded in via setFieldValue, not left to only
	// live in this component's local state. Always points at the latest
	// render's setFieldValue so create-success handlers (defined outside the
	// FormikWizard render prop) can reach it.
	const setFieldValueRef = useRef(() => {});
	const [isLoading, setIsLoading] = useState(false);
	// DOM node exposed to descendants (via QuizHeaderPortalContext) so
	// in-context action bars — e.g. the per-question Reset/Add Question
	// buttons — can also portal themselves into the sticky header.
	const [questionActionsNode, setQuestionActionsNode] = useState(null);
	// Target step for a direct stepper click; StepNavigator walks to it.
	const [navTarget, setNavTarget] = useState(null);

	const {
		topicUpdateHandler,
		topicRenameHandler,
		itemIndex,
		subCurriculumIndex,
		subTopicUpdateHandler,
		isSubCurriculum,
		closeModal,
		isAddNewItem,
	} = useContext(QuizFormContext);

	// Only the course builder ('subheader') defaults a new quiz to published (it
	// rides along with the course). The standalone Quizzes menu — whether the
	// wp-admin route ('topbar') or the frontend dashboard modal ('inline') —
	// defaults to draft, so a half-configured new quiz isn't live immediately
	// and the last-step button doesn't read "Update" before anything is saved.
	const isCourseBuilder = headerMode === 'subheader';
	const defaultStatus = isCourseBuilder ? 'publish' : 'draft';
	const resolveStatus = (v) => v?.status || defaultStatus;

	// "Update" (vs "Publish") only makes sense when the quiz was ALREADY
	// published before this editing session — not just because a mid-wizard
	// create has since given it a row/id.
	const openedPublished = Boolean(data?.id) && data?.status === 'publish';

	const onSubmitFormHandler = (values) => {
		// A mid-wizard create only sets local `quizId` state, not form
		// `values.id` — fold it in (without mutating the Formik-owned
		// `values` object, which callers still hold live references to).
		const id = values.id || quizId;

		if (!id) {
			setIsLoading(false);
			return;
		}

		// WP rejects a post update with title, content, AND excerpt all
		// empty ("empty_content") — silently skip rather than firing a save doomed to fail and
		// leaving the wizard's displayed status out of sync with the server.
		if (!values.title && !values.content && !values.excerpt) {
			return;
		}

		dispatch(
			updateQuiz({ ...values, id, status: resolveStatus(values) })
		)
			.then((action) => {
				if (action?.meta?.requestStatus !== 'fulfilled') {
					// updateQuiz already dispatched its own failure
					// notification, so just stop here.
					return;
				}
				setQuizId(action.payload.id);
			})
			.catch(() => {});
	};
	const nextStepHandler = (
		handleNext,
		values,
		currentStepIndex,
		resetForm
	) => {
		setIsLoading(true);
		// `quizId` covers the case where a prior Save already created the quiz
		// (state set, but form `values.id` still empty) — otherwise this would
		// create a second quiz.
		if (!values?.id && !quizId) {
			if (values.title === '') {
				dispatch(
					showNotification({
						message: __('Title is required', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				setIsLoading(false);
			} else {
				dispatch(
					createQuiz({ ...values, status: resolveStatus(values) })
				).then(({ payload: data }) => {
					// Failed create (rejectWithValue payload has no `id`) — stop
					// here instead of reading `data.id` off it and advancing the
					// wizard onto a quiz that doesn't exist.
					if (!data?.id) {
						setIsLoading(false);
						return;
					}
					setQuizId(data.id);
					// Mirror the new id into Formik state so Step 2 (Questions)
					// sees `values.id` — otherwise questions POST with
					// `quiz_id: NaN` and later saves create a duplicate quiz.
					// resetForm (with the id) also moves the dirty baseline.
					resetForm({
						values: {
							...values,
							id: data.id,
							status: resolveStatus(values),
						},
					});
					if (isSubCurriculum) {
						subTopicUpdateHandler(
							{
								id: data.id,
								name: values.title,
								type: 'quiz',
							},
							itemIndex,
							subCurriculumIndex
						);
					} else if (topicUpdateHandler) {
						topicUpdateHandler(
							{
								id: data.id,
								name: values.title,
								type: 'quiz',
							},
							itemIndex
						);
					}
					setTimeout(() => {
						setIsLoading(false);
						handleNext().then(() => {
							if (isAddNewItem) {
								closeModal();
							}
							dispatch(
								showNotification({
									message: __(
										'Successfully Saved!',
										'academy'
									),
									isShow: true,
									type: 'success',
								})
							);
						});
					}, 500);
				});
			}
		} else if (
			currentStepIndex !== 0 &&
			values?.meta?.academy_quiz_questions?.length < 1
		) {
			setTimeout(() => {
				setIsLoading(false);
				dispatch(
					showNotification({
						message: __('Empty Questions!!', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
			}, 500);
		} else {
			// Quiz already exists: nothing is saved in the background any
			// more, so persist the pending edits here before advancing.
			const id = values?.id || quizId;
			const status = resolveStatus(values);
			dispatch(updateQuiz({ ...values, id, status })).then((action) => {
				setIsLoading(false);
				if (action?.meta?.requestStatus !== 'fulfilled') {
					// updateQuiz already notified the failure; stay put.
					return;
				}
				// New dirty baseline = what was just saved, so the button
				// mutes again until the next edit.
				resetForm({ values: { ...values, id, status } });
				handleNext().then(() => {
					dispatch(
						showNotification({
							message: __('Successfully Saved!', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
				});
			});
		}
	};

	// Save & stay — persists the current step and keeps the wizard open, matching
	// the course editor's Save (the terminal publish/close lives on the last
	// step). Creates on first save, updates thereafter; `quizId` is the effective
	// id since a mid-wizard create only sets state, not form `values.id`, so
	// checking `values.id` alone would create a duplicate on the next Save.
	const saveHandler = (values, resetForm, opts = {}) => {
		const { statusOverride = null, closeAfter = false } = opts;
		const status = statusOverride || resolveStatus(values);
		const maybeClose = () => {
			if (!closeAfter) {
				return;
			}
			// Course builder returns to the builder via onBack; the frontend
			// dashboard modal has no onBack, so fall back to cancelHandler,
			// which is the modal's close handler.
			if (onBack) {
				onBack();
			} else {
				cancelHandler();
			}
		};
		const currentId = values?.id || quizId;
		setIsLoading(true);
		if (!currentId) {
			if (values.title === '') {
				dispatch(
					showNotification({
						message: __('Title is required', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				setIsLoading(false);
				return;
			}
			dispatch(createQuiz({ ...values, status })).then(
				({ payload: data }) => {
					setQuizId(data.id);
					setFieldValueRef.current('id', data.id);
					if (isSubCurriculum) {
						subTopicUpdateHandler(
							{ id: data.id, name: values.title, type: 'quiz' },
							itemIndex,
							subCurriculumIndex
						);
					} else if (topicUpdateHandler) {
						topicUpdateHandler(
							{ id: data.id, name: values.title, type: 'quiz' },
							itemIndex
						);
					}
					setIsLoading(false);
					// Reset the dirty baseline to exactly what was just saved,
					// so the status button disables again until the next
					// change (mirrors the course editor's resetForm-on-save).
					resetForm({ values: { ...values, id: data.id, status } });
					dispatch(
						showNotification({
							message: __('Successfully Saved!', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					maybeClose();
				}
			);
		} else {
			dispatch(
				updateQuiz({
					...values,
					id: currentId,
					status,
				})
			).then((action) => {
				setIsLoading(false);
				if (action?.meta?.requestStatus !== 'fulfilled') {
					// updateQuiz already dispatches its own failure
					// notification — just stop here without pretending the
					// save succeeded (no resetForm, no "Successfully Saved!").
					return;
				}
				resetForm({ values: { ...values, id: currentId, status } });
				dispatch(
					showNotification({
						message: __('Successfully Saved!', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				// Unlike the create branch above, this quiz already has an id
				// the parent knows about — topicUpdateHandler/onSaved exists
				// to hand a NEW id up (and, for the standalone Quizzes page,
				// navigates the URL from ?quiz_form=new to ?...&item_id=N).
				// Calling it again here on every subsequent save re-triggers
				// that same-URL navigate, which re-renders the route tree and
				// was clobbering the just-reset Formik state (status/dirty
				// desyncing from what the server actually holds) — so it's
				// intentionally not called on update, only on create.
				//
				// The curriculum tree's displayed name still needs to catch a
				// rename though (it was stuck on the old title until a full
				// reload) — topicRenameHandler/subTopicUpdateHandler cover just
				// that, without the navigate above.
				if (isSubCurriculum && subTopicUpdateHandler) {
					subTopicUpdateHandler(
						{ id: currentId, name: values.title, type: 'quiz' },
						itemIndex,
						subCurriculumIndex
					);
				} else if (topicRenameHandler) {
					topicRenameHandler({
						id: currentId,
						name: values.title,
						type: 'quiz',
					});
				}
				maybeClose();
			});
		}
	};

	// Rendered inside whichever sticky header is active (topbar or subheader);
	// per-question action bars (Reset/Add Question) portal into it via
	// QuizHeaderPortalContext so they stay reachable while scrolled.
	const questionActionsSlot = (
		<div
			className="academy-quiz-header-question-actions"
			ref={setQuestionActionsNode}
		/>
	);

	return (
		<QuizHeaderPortalContext.Provider value={questionActionsNode}>
			<FormikWizard
				// `data` (this component's initial values source) is only
				// ever used once, before this component's first render —
				// QuizEditor deliberately never refetches/updates it after a
				// mid-wizard create (see its own comment: refetching would
				// remount this wizard back to step 1), and quizId/status
				// updates thereafter flow through setFieldValue/resetForm.
				// enableReinitialize was therefore never doing useful work,
				// and was actively harmful: resetForm() on a successful save
				// updates Formik's internal reinitialize baseline to the
				// just-saved (correct) values, which then differs from this
				// permanently-stale `data`-derived initialValues — tripping
				// enableReinitialize into silently resetting the whole form
				// back to blank right after the save completed.
				initialValues={quizFormInitialValues(data, allAddons)}
				onSubmit={(values, actions) => {
					// Status is the author's explicit choice from the last-step
					// StatusSelect (default 'draft'); don't auto-publish just
					// because questions exist.
					onSubmitFormHandler(values, actions);
				}}
				validateOnNext
				activeStepIndex={0}
				steps={[
					{ component: FirstStep },
					{ component: SecondStep },
					{ component: ThirdStep },
				]}
			>
				{({
					values,
					currentStepIndex,
					renderComponent,
					handlePrev,
					handleNext,
					isNextDisabled,
					isPrevDisabled,
					isLastStep,
					dirty,
					resetForm,
					setFieldValue,
				}) => {
					setFieldValueRef.current = setFieldValue;
					const prevButton = !isPrevDisabled && (
						<Button
							type="button"
							preset="light-purple"
							isDisabled={isNextDisabled}
							borderRadius="rounded"
							onClick={handlePrev}
							label={__('Back', 'academy')}
						/>
					);
					// Once the quiz is saved (has an id) any step is directly
					// clickable in the Stepper — backward always, forward only
					// after the first save so you can't skip ahead of an unsaved
					// quiz. StepNavigator walks to the target.
					const isSaved = Boolean(values?.id || quizId);
					const goToStep = (targetStepIndex) => {
						if (targetStepIndex === currentStepIndex) {
							return;
						}
						if (targetStepIndex > currentStepIndex && !isSaved) {
							return;
						}
						setNavTarget(targetStepIndex);
					};
					// Last-step save (standalone Quizzes menu): persist with the
					// author's chosen status (from the StatusSelect dropdown).
					// The wp-admin route editor stays put (leaving is the back
					// button's job); the frontend dashboard modal closes itself
					// once the save lands.
					const finishHandler = () => {
						// Nothing changed since the last save: no-op.
						if (!dirty) {
							return;
						}
						saveHandler(values, resetForm, {
							closeAfter: headerMode === 'inline',
						});
					};
					const rightButtons = (
						<>
							{headerMode === 'inline' && (
								<Button
									type="button"
									suffix="cancel"
									border="purple"
									borderRadius="rounded"
									onClick={() => cancelHandler()}
									label={__('Cancel', 'academy')}
								/>
							)}
							{isLastStep && headerMode === 'subheader' && (
								// Course builder: primary saves and RETURNS to the
								// builder; the caret saves-as-status and keeps you
								// editing (mirrors the lesson/assignment editors).
								<SplitButton
									primaryLabel={getStatusActionLabel(
										values.status || defaultStatus,
										openedPublished
									)}
									primaryLoading={isLoading}
									isMuted={!dirty}
									onPrimary={() => {
										// Nothing to save: the primary does
										// nothing; the caret still opens.
										if (!dirty) {
											return;
										}
										saveHandler(values, resetForm, {
											closeAfter: true,
										});
									}}
									// Every status EXCEPT the current one, so you
									// can always switch — including back to Publish
									// from Draft/Private.
									items={[
										{
											status: 'publish',
											label: __('Publish', 'academy'),
										},
										{
											status: 'draft',
											label: __(
												'Save as Draft',
												'academy'
											),
										},
										{
											status: 'private',
											label: __(
												'Save as Private',
												'academy'
											),
										},
									]
										.filter(
											(it) =>
												it.status !==
												(values.status || defaultStatus)
										)
										.map((it) => ({
											label: it.label,
											description: __(
												'Save and keep editing.',
												'academy'
											),
											onClick: () => {
												saveHandler(values, resetForm, {
													statusOverride: it.status,
												});
											},
										}))}
								/>
							)}
							{isLastStep && headerMode !== 'subheader' && (
								// Standalone Quizzes page / frontend modal: keep the
								// status picker; leaving is the back button's job.
								<StatusSelect
									name="status"
									type="quiz"
									value={values.status || defaultStatus}
									label={getStatusActionLabel(
										values.status || defaultStatus,
										openedPublished
									)}
									statusOptions={QUIZ_STATUS_OPTIONS}
									showPasswordProtection={false}
									submitButtonType="button"
									submitHandler={finishHandler}
									isSubmitted={isLoading}
									isMuted={!dirty}
								/>
							)}
							{!isLastStep && (
								// Earlier steps: save and advance. Plain "Save"
								// (stay on this step) lives in the caret menu,
								// same as the course editor.
								<SplitButton
									primaryLabel={__(
										'Save & Continue',
										'academy'
									)}
									primaryLoading={isLoading}
									isMuted={!dirty}
									onPrimary={() => {
										// Nothing to save: the primary does
										// nothing (use the stepper to move
										// on); the caret still opens.
										if (!dirty) {
											return;
										}
										nextStepHandler(
											handleNext,
											values,
											currentStepIndex,
											resetForm
										);
									}}
									items={[
										{
											label: __('Save', 'academy'),
											description: __(
												'Save without leaving this step',
												'academy'
											),
											onClick: () => {
												saveHandler(values, resetForm);
											},
										},
									]}
								/>
							)}
						</>
					);
					return (
						<>
							<StepNavigator
								currentStepIndex={currentStepIndex}
								handleNext={handleNext}
								handlePrev={handlePrev}
								target={navTarget}
								onDone={() => setNavTarget(null)}
							/>
							<ScrollTopOnStepChange
								currentStepIndex={currentStepIndex}
							/>
							{headerMode === 'topbar' && (
								<TopBar
									render={() => (
										<div className="flex items-center gap-3">
											{headerLeft}
											<StatusBadge
												status={
													values.status || 'draft'
												}
											/>
										</div>
									)}
									centerContent={() => (
										<Stepper
											steps={QUIZ_STEPS}
											value={currentStepIndex}
											onChange={goToStep}
											variant="checklist"
										/>
									)}
									rightContent={() => (
										<div className="academy-course-topbar-right flex items-center gap-3">
											{questionActionsSlot}
											{rightButtons}
										</div>
									)}
								/>
							)}
							{headerMode === 'subheader' &&
								(() => {
									const stepper = (
										<Stepper
											steps={QUIZ_STEPS}
											value={currentStepIndex}
											onChange={goToStep}
											variant="checklist"
										/>
									);
									return (
										<EditorSubHeader
											// Bare (no card chrome) when the
											// stepper has moved to the topbar —
											// just the Back button remains.
											className={
												topbarCenterNode
													? 'academy-editor-subheader--bare'
													: ''
											}
											onBack={onBack}
											backLabel={__(
												'Course Builder',
												'academy'
											)}
											// Stepper moves to the topbar centre
											// when that slot exists, leaving a
											// simple Back button here.
											center={
												topbarCenterNode
													? null
													: stepper
											}
										>
											{questionActionsSlot}
											{/* Save controls portal up to the
											    topbar when that slot exists. */}
											{!topbarActionsNode && rightButtons}
										</EditorSubHeader>
									);
								})()}
							{headerMode === 'subheader' &&
								topbarActionsNode &&
								createPortal(rightButtons, topbarActionsNode)}
							{headerMode === 'subheader' &&
								topbarCenterNode &&
								createPortal(
									<Stepper
										steps={QUIZ_STEPS}
										value={currentStepIndex}
										onChange={goToStep}
										variant="checklist"
									/>,
									topbarCenterNode
								)}
							<div
								className={`academy-quiz-form-wrapper${
									headerMode === 'topbar'
										? ' academy-quiz-form-wrapper--topbar'
										: ''
								}`}
							>
								<div className="academy-quiz-form flex flex-col">
									{headerMode === 'inline' && (
										<Steps
											currentStepIndex={currentStepIndex}
										/>
									)}
									<div className="academy-quiz-form__content rounded-lg border border-academy-border bg-academy-surface p-6">
										{renderComponent()}
									</div>
									{headerMode === 'inline' && (
										<div className="academy-quiz-form__control flex justify-between border-t border-academy-border py-5 mt-2.5 mx-[30px]">
											<div className="academy-quiz-form__control--btn-left">
												{prevButton}
											</div>
											<div className="academy-quiz-form__control--btn-right flex gap-3">
												{rightButtons}
											</div>
										</div>
									)}
								</div>
							</div>
						</>
					);
				}}
			</FormikWizard>
		</QuizHeaderPortalContext.Provider>
	);
}

QuizForm.propTypes = propTypes;
