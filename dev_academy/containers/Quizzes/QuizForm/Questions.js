import React, { useEffect, useState } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import QuestionForm from '../QuestionForm';
import QuestionReuse from './QuestionReuse';
import { Dropdown } from '@Components/ui';
import { __ } from '@wordpress/i18n';
import {
	getQuestion,
	getAnswers,
	createQuestionAnswers,
	questionTypeOption,
} from '../helper';
import { createQuestion } from '@Redux/Slices/quizQuestionSlice/quizQuestionSlice';
import { arrayMoveImmutable } from 'array-move';
import { API, namespace } from '@Utils/helper';
import OptionMenu from '@Components/OptionMenu';
import Button from '@Components/Button';
import Preloader from '@Components/Loader/Preloader';
import ReactModal from '@Components/Modal/ReactModal';
import MathJaxLateX from '@Components/MathJaxLateX';
import QuizAudioPlayer from '@Components/QuizAudioPlayer';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';

const propTypes = {};

const ChevronUpIcon = ({ size = 20, color = 'currentColor' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M18 15l-6-6-6 6" />
	</svg>
);

const EditIcon = ({ size = 18, color = 'currentColor' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
	</svg>
);

const CopyIcon = ({ size = 16, color = 'currentColor' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	</svg>
);

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const ArrowUpIcon = ({ size = 16, color = 'currentColor' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 19V5" />
		<path d="M5 12l7-7 7 7" />
	</svg>
);

const ArrowDownIcon = ({ size = 16, color = 'currentColor' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 5v14" />
		<path d="M19 12l-7 7-7-7" />
	</svg>
);

// question_settings arrives as a JSON string; tolerate an already-decoded
// object or a bad value without crashing.
const parseSettings = (settings) => {
	if (typeof settings === 'string') {
		try {
			return JSON.parse(settings);
		} catch (e) {
			return {};
		}
	}
	return settings || {};
};

const typeLabel = (value) =>
	questionTypeOption.find((opt) => opt.value === value)?.label || value;

// Only the drag handle initiates a sort, so clicks inside the expanded editor
// never start a drag.
const DragHandle = sortableHandle(() => (
	<span className="academy-icon academy-icon--drag academy-question-card__drag" />
));

const CardsContainer = sortableContainer(({ children }) => (
	<div className="academy-question-cards">{children}</div>
));

const SortableCard = sortableElement(({ children }) => (
	<div className="academy-question-card">{children}</div>
));

/*
 * Accordion-style question builder: each question is a self-contained card
 * whose header carries an explicit Edit icon (opening it fetches the question,
 * so it's a deliberate action, not a cheap chevron toggle). One card is
 * expanded at a time; adding opens a fresh card in create mode.
 */
export default function Questions({ quizId, data }) {
	const { setFieldValue } = useFormikContext();
	const dispatch = useDispatch();

	// activeKey: a question id (editing), 'new' (adding), or null (collapsed).
	const [activeKey, setActiveKey] = useState(null);
	const [editLoadingId, setEditLoadingId] = useState(false);
	const [deletingId, setDeletingId] = useState(false);
	const [duplicatingId, setDuplicatingId] = useState(false);
	const [questionResponse, setQuestionResponse] = useState(false);
	const [questionFormInitialValues, setQuestionFormInitialValues] =
		useState(false);

	// Read-only preview modal state.
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewData, setPreviewData] = useState(null);
	const [previewAudioUrl, setPreviewAudioUrl] = useState('');

	useEffect(() => {
		const audioId = previewData?.question?.question_audio_id;
		if (audioId && '0' !== audioId) {
			API.get(`wp/v2/media/${audioId}`).then((res) =>
				setPreviewAudioUrl(res.data.source_url)
			);
		} else {
			setPreviewAudioUrl('');
		}
	}, [previewData]);

	const collapse = () => {
		setActiveKey(null);
		setQuestionResponse(false);
		setQuestionFormInitialValues(false);
	};

	const openNew = () => {
		setQuestionResponse(false);
		setQuestionFormInitialValues(false);
		setActiveKey('new');
	};

	const openEdit = (question) => {
		if (activeKey === question.id) {
			collapse();
			return;
		}
		setEditLoadingId(question.id);
		setQuestionFormInitialValues({
			question_title: question.title,
			question_id: question.id,
		});
		getQuestion(question?.id)
			.then((res) => {
				setQuestionResponse({
					...res,
					question_settings: parseSettings(res?.question_settings),
				});
				setActiveKey(question.id);
			})
			.finally(() => setEditLoadingId(false));
	};

	const openPreview = (question) => {
		setPreviewOpen(true);
		setPreviewLoading(true);
		setPreviewData({ title: question.title });
		Promise.all([getQuestion(question.id)])
			.then(([res]) =>
				getAnswers(question.id, res?.question_type).then((ansRes) => ({
					question: {
						...res,
						question_settings: parseSettings(
							res?.question_settings
						),
					},
					answers: ansRes?.data || [],
				}))
			)
			.then((payload) => setPreviewData(payload))
			.finally(() => setPreviewLoading(false));
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		setFieldValue(
			'meta.academy_quiz_questions',
			arrayMoveImmutable([...data], oldIndex, newIndex)
		);
	};

	return (
		<>
			<FieldArray
				name="meta.academy_quiz_questions"
				render={(arrayHelpers) => {
					const addQuestionHandler = (question) => {
						if (!question) {
							return;
						}
						const replaceIndex = data.findIndex(
							(item) =>
								parseInt(item.id) ===
								parseInt(question?.question_id)
						);
						if (replaceIndex !== -1) {
							arrayHelpers.replace(replaceIndex, {
								id: parseInt(question?.question_id),
								title: question?.question_title,
							});
						} else {
							arrayHelpers.push({
								id: parseInt(question?.question_id),
								title: question?.question_title,
							});
						}
						// Fold the saved question into the list and close the form.
						collapse();
					};

					// "Reuse Content" picker toggles existing questions into the
					// quiz. Add guards against a double-push race; remove finds
					// the row by id so the checkbox stays in sync with the list.
					const addReuseQuestion = (question) => {
						const alreadyIn = data.some(
							(item) =>
								parseInt(item.id) === parseInt(question.id)
						);
						if (!alreadyIn) {
							arrayHelpers.push({
								id: parseInt(question.id),
								title: question.title,
							});
						}
					};

					const removeReuseQuestion = (id) => {
						const index = data.findIndex(
							(item) => parseInt(item.id) === parseInt(id)
						);
						if (index !== -1) {
							arrayHelpers.remove(index);
						}
					};

					// Same reuse dropdown is offered from the empty state and
					// the bottom of a populated list.
					const reuseContentDropdown = (
						<Dropdown
							contentClassName="academy-content-dropdown academy-content-dropdown--reuse"
							align="right"
							renderToggle={({ isOpen, onToggle }) => (
								<Button
									type="button"
									onClick={onToggle}
									aria-expanded={isOpen}
									preset="border-purple"
									icon={
										<span className="academy-icon academy-icon--duplicate-content" />
									}
									iconPosition="right"
									label={__('Reuse Content', 'academy')}
									suffix="reuse-content"
								/>
							)}
							renderContent={() => (
								<QuestionReuse
									existingIds={data.map((d) =>
										parseInt(d.id)
									)}
									onAdd={addReuseQuestion}
									onRemove={removeReuseQuestion}
								/>
							)}
						/>
					);

					const deleteQuestion = (question, index) => {
						// eslint-disable-next-line
						if (!window.confirm(__('Are you sure?', 'academy'))) {
							return;
						}
						setDeletingId(question.id);
						API.post(
							`${namespace}quiz_questions/${parseInt(question.id)}`,
							{},
							{ headers: { 'X-HTTP-Method-Override': 'DELETE' } }
						).then(() => {
							setDeletingId(false);
							arrayHelpers.remove(index);
							if (activeKey === question.id) {
								collapse();
							}
							dispatch(
								showNotification({
									message: __('Question Deleted', 'academy'),
									isShow: true,
									type: 'success',
								})
							);
						});
					};

					// Reorder without dragging — mirrors onSortEnd, persisted with
					// the quiz meta on the next (auto)save.
					const moveQuestion = (index, direction) => {
						const target = index + direction;
						if (target < 0 || target >= data.length) {
							return;
						}
						arrayHelpers.move(index, target);
					};

					// Clone an existing question (fields + answers) into a brand
					// new question. There's no server duplicate endpoint, so read
					// the source, create a copy, then copy its answers over.
					const duplicateQuestion = async (question) => {
						setDuplicatingId(question.id);
						try {
							const full = await getQuestion(question.id);
							if (!full) {
								return;
							}
							const ansRes = await getAnswers(
								question.id,
								full.question_type
							);
							// Drop server ids so the answers are created fresh
							// against the new question.
							const answers = (ansRes?.data || []).map(
								// eslint-disable-next-line no-unused-vars
								({ id, question_id, ...rest }) => rest
							);
							const payload = {
								quiz_id: parseInt(quizId),
								question_title: `${
									full.question_title ||
									question.title ||
									__('Untitled Question', 'academy')
								} (${__('copy', 'academy')})`,
								question_content: full.question_content || '',
								question_explanation:
									full.question_explanation || '',
								question_level: full.question_level || '',
								question_type: full.question_type,
								question_score: full.question_score,
								question_negative_score:
									full.question_negative_score,
								question_image_id: full.question_image_id || 0,
								question_audio_id: full.question_audio_id || 0,
								question_settings: parseSettings(
									full.question_settings
								),
								correct_answer: full.correct_answer || '',
							};
							const { payload: created } = await dispatch(
								createQuestion(payload)
							);
							if (created?.question_id) {
								createQuestionAnswers(answers, {
									quiz_id: parseInt(quizId),
									question_id: parseInt(created.question_id),
									question_type: created.question_type,
								});
								arrayHelpers.push({
									id: parseInt(created.question_id),
									title: created.question_title,
								});
							}
						} finally {
							setDuplicatingId(false);
						}
					};

					const questionForm = (
						<QuestionForm
							quizId={quizId}
							initialValues={questionFormInitialValues}
							addQuestionHandler={addQuestionHandler}
							questionResponse={questionResponse}
							setQuestionResponse={setQuestionResponse}
							setQuestionFormInitialValues={
								setQuestionFormInitialValues
							}
							onClose={collapse}
						/>
					);

					const buildOptions = (question, index) => {
						const isActive = activeKey === question.id;
						return [
							{
								type: 'button',
								label: __('Edit', 'academy'),
								icon: (
									<span className="academy-icon academy-icon--edit-two" />
								),
								isLoading: editLoadingId === question.id,
								onClick: () => openEdit(question),
								hasBorder: true,
							},
							{
								type: 'button',
								label: __('Duplicate', 'academy'),
								icon: <CopyIcon />,
								isLoading: duplicatingId === question.id,
								onClick: () => duplicateQuestion(question),
							},
							{
								type: 'button',
								label: __('Move Up', 'academy'),
								icon: <ArrowUpIcon />,
								isDisabled: index === 0,
								onClick: () => moveQuestion(index, -1),
							},
							{
								type: 'button',
								label: __('Move Down', 'academy'),
								icon: <ArrowDownIcon />,
								isDisabled: index === data.length - 1,
								onClick: () => moveQuestion(index, 1),
							},
							{
								type: 'button',
								label: __('Preview', 'academy'),
								icon: <EyeIcon />,
								onClick: () => openPreview(question),
								hasBorder: isActive,
							},
							...(isActive
								? [
										{
											type: 'button',
											label: __('Collapse', 'academy'),
											icon: <ChevronUpIcon size={16} />,
											onClick: collapse,
										},
									]
								: []),
							{
								type: 'button',
								label: __('Delete', 'academy'),
								suffix: 'trash',
								icon: (
									<span className="academy-icon academy-icon--trash-delete" />
								),
								isLoading: deletingId === question.id,
								onClick: () => deleteQuestion(question, index),
							},
						];
					};

					return (
						<div className="academy-questions">
							<div className="academy-questions__head">
								<div className="academy-questions__head-info">
									<h3 className="academy-questions__title">
										{__('Questions', 'academy')}
									</h3>
									<span className="academy-questions__count">
										{data.length}{' '}
										{data.length === 1
											? __('question', 'academy')
											: __('questions', 'academy')}
									</span>
								</div>
							</div>

							{data.length === 0 && activeKey !== 'new' && (
								<div className="academy-question-btn-field">
									<div className="academy-questions--icon">
										<span className="academy-icon academy-icon--question" />
									</div>
									<h3 className="academy-title">
										{__(
											'Add your questions here',
											'academy'
										)}
									</h3>
									<p className="academy-sub-title">
										{__(
											"You haven't added any questions yet.",
											'academy'
										)}
										<br />
										{__('Start by adding one!', 'academy')}
									</p>
									<div className="flex items-center gap-3">
										<Button
											icon={
												<span className="academy-icon academy-icon--simple-add" />
											}
											iconPosition="right"
											label={__(
												'Add Questions',
												'academy'
											)}
											onClick={openNew}
											suffix="add-question"
										/>
										{reuseContentDropdown}
									</div>
								</div>
							)}

							<CardsContainer onSortEnd={onSortEnd} useDragHandle>
								{data.map((question, index) => (
									<SortableCard
										key={`q-${question.id}`}
										index={index}
									>
										<div
											className={`academy-question-card__head${
												activeKey === question.id
													? ' academy-question-card__head--active'
													: ''
											}`}
										>
											<div className="academy-question-card__head-left">
												<DragHandle />
												<span className="academy-question-card__index">
													{index + 1}.
												</span>
												<span className="academy-question-card__title">
													<MathJaxLateX
														text={
															question?.title ||
															__(
																'Untitled Question',
																'academy'
															)
														}
													/>
												</span>
											</div>
											<div className="academy-question-card__head-right">
												{/* Explicit Edit icon replaces the
												    old chevron toggle: opening a
												    question fetches its data, so
												    it's a deliberate action with
												    its own loading state. */}
												<Button
													preset="transparent"
													size="sm"
													suffix="question-edit"
													isLoading={
														editLoadingId ===
														question.id
													}
													onClick={() =>
														openEdit(question)
													}
													icon={
														activeKey ===
														question.id ? (
															<ChevronUpIcon
																size={18}
															/>
														) : (
															<span className="academy-icon academy-icon--edit-two" />
														)
													}
												/>
												<OptionMenu
													icon="three-dots-menu"
													suffix="question"
													options={buildOptions(
														question,
														index
													)}
												/>
											</div>
										</div>
										{activeKey === question.id && (
											<div className="academy-question-card__body">
												{questionForm}
											</div>
										)}
									</SortableCard>
								))}
							</CardsContainer>

							{activeKey === 'new' && (
								<div className="academy-question-card academy-question-card--new">
									<div className="academy-question-card__body">
										{questionForm}
									</div>
								</div>
							)}

							{data.length > 0 && activeKey !== 'new' && (
								<div className="flex items-center justify-center gap-3">
									<Button
										icon={
											<span className="academy-icon academy-icon--simple-add" />
										}
										iconPosition="right"
										label={__('Add Question', 'academy')}
										onClick={openNew}
										suffix="add-question"
									/>
									{reuseContentDropdown}
								</div>
							)}
						</div>
					);
				}}
			/>

			<ReactModal
				title={__('Question Preview', 'academy')}
				isOpen={previewOpen}
				onRequestClose={() => setPreviewOpen(false)}
				isSmallAvailable={false}
				suffix="question-preview"
				size="medium"
			>
				{previewLoading || !previewData?.question ? (
					<div className="academy-quiz-loader h-[150px]">
						<Preloader />
					</div>
				) : (
					<div className="academy-question-preview p-4">
						<span className="academy-question-preview__type inline-block mb-2 text-sm text-academy-primary-color">
							{typeLabel(previewData.question.question_type)}
							{' · '}
							{previewData.question.question_score}{' '}
							{__('point(s)', 'academy')}
						</span>
						<h3 className="academy-question-preview__title text-lg font-medium mb-3">
							<MathJaxLateX
								text={
									previewData.question.question_title ||
									previewData.title ||
									__('Untitled Question', 'academy')
								}
							/>
						</h3>
						{previewAudioUrl && (
							<div className="academy-question-preview__audio mb-4">
								<QuizAudioPlayer src={previewAudioUrl} />
							</div>
						)}
						{previewData.question.question_content && (
							<p className="academy-question-preview__desc mb-4 text-academy-sub-title">
								<MathJaxLateX
									text={previewData.question.question_content}
								/>
							</p>
						)}
						{previewData.answers.length > 0 ? (
							<ul className="academy-question-preview__answers flex flex-col gap-2">
								{previewData.answers.map((answer, i) => (
									<li
										key={answer.id || i}
										className={`flex items-center justify-between rounded-md border px-4 py-3 ${
											answer.is_correct
												? 'border-academy-primary-color bg-academy-secondary-color'
												: 'border-academy-border'
										}`}
									>
										<span>{answer.answer_title}</span>
										{!!answer.is_correct && (
											<span className="text-xs font-medium text-academy-primary-color">
												{__('Correct', 'academy')}
											</span>
										)}
									</li>
								))}
							</ul>
						) : (
							<p className="text-academy-sub-title">
								{__(
									'This question type has no predefined options.',
									'academy'
								)}
							</p>
						)}
						{previewData.question.question_explanation && (
							<div className="academy-question-preview__explanation mt-4 rounded-md bg-academy-secondary-color p-3">
								<strong>{__('Explanation:', 'academy')}</strong>{' '}
								{previewData.question.question_explanation}
							</div>
						)}
					</div>
				)}
			</ReactModal>
		</>
	);
}

Questions.propTypes = propTypes;
