import React, { useEffect, useState } from 'react';
import { Formik, Field, useFormikContext } from 'formik';
import {
	createQuestionAnswers,
	getAnswers,
	questionSchema,
	questionTypeOption,
	questionLevelOption,
	questionImageSizeOptions,
	questionImageAlignmentOptions,
} from '../helper';

import AnswerFields from './AnswerFields';
import Select from '@Components/AcademySelect';
import SwitchControl from '@Components/Formik/SwitchControl';
import Editor from '@Components/Editor';
import { Radio } from '@Components/ui';
import Button from '@Components/Button';
import Preloader from '@Components/Loader/Preloader';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import AcademySeparator from '@Components/AcademySeparator';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import {
	createQuestion,
	updateQuestion,
} from '@Redux/Slices/quizQuestionSlice/quizQuestionSlice';
import AiTextGenerator from '@Components/AiTextGenerator';
import './styles.scss';
import { QuizUploadImage } from '@Components/QuizUploadImage';
import { QuizUploadAudio } from '@Components/QuizUploadAudio';

const resetAnswers = [
	{
		answer_title: __('True', 'academy'),
		view_format: 'text',
		question_type: 'trueFalse',
		is_correct: false,
	},
	{
		answer_title: __('False', 'academy'),
		view_format: 'text',
		question_type: 'trueFalse',
		is_correct: false,
	},
];
const propTypes = {};

const QuestionFormInner = ({
	isLoading,
	setLoading,
	questionResponse,
	quizId,
	setQuestionResponse,
	setQuestionFormInitialValues,
	setAnswerResponse,
	onClose,
}) => {
	const { values, setFieldValue, isSubmitting, submitForm, resetForm } =
		useFormikContext();
	// Editing a question that already has a description opens with the
	// field expanded, instead of hiding existing content behind "Add
	// Description" — only genuinely empty questions start collapsed.
	const [showDescription, isShowDescription] = useState(
		() => !!values.question_content
	);
	const [showExplanation, setShowExplanation] = useState(false);
	const [resetLoading, isResetLoading] = useState(false);
	const dispatch = useDispatch();

	const handleQuizSubmit = async () => {
		try {
			if (values.question_title === '') {
				dispatch(
					showNotification({
						message: __('Question title missing', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
			} else if (
				values.question_type === 'multipleChoice' ||
				values.question_type === 'singleChoice' ||
				values.question_type === 'dropDown' ||
				values.question_type === 'trueFalse'
			) {
				const hasCorrectAnswer = values.answers.some(
					(answer) => answer.is_correct
				);
				if (hasCorrectAnswer) {
					await handleSubmitAndReset();
				} else {
					dispatch(
						showNotification({
							message: __(
								'Please select correct answer',
								'academy'
							),
							isShow: true,
							type: 'error',
						})
					);
				}
			} else {
				await handleSubmitAndReset();
			}
		} catch (error) {
		} finally {
		}
	};

	// Just submit — the Save button's own spinner (isSubmitting) is the only
	// loader, and on success onSubmit collapses the card (add) or the parent
	// folds+closes it (edit). No full-form Preloader flash, no blank-out reset:
	// the card closing after the save resolves is the feedback the user wants.
	const handleSubmitAndReset = async () => {
		await submitForm();
	};

	useEffect(() => {
		if (
			Array.isArray(values.answers) &&
			!values?.answers.length &&
			values?.question_type === 'trueFalse'
		) {
			setFieldValue('answers', resetAnswers);
		}
	}, [values.answers]);

	// Cancel/Reset + Add/Update Question. Rendered both in the sticky header bar
	// (portaled up) and again as an inline footer under the form, so the save
	// action is reachable without scrolling back to the top — in add and edit
	// modes alike (the label follows questionResponse).
	const renderActions = (keyPrefix) => (
		<>
			<Button
				key={`${keyPrefix}-cancel`}
				size="sm"
				type="button"
				preset="cancel"
				suffix="cancel"
				onClick={() => {
					if (onClose) onClose();
					setQuestionFormInitialValues(false);
					setQuestionResponse(false);
					setAnswerResponse([]);
					isResetLoading(true);
					setTimeout(() => {
						resetForm({
							values: {
								...questionSchema,
								quiz_id: quizId,
								answers: resetAnswers,
							},
						});
						isResetLoading(false);
					}, 500);
				}}
				label={
					questionResponse
						? __('Cancel', 'academy')
						: __('Close', 'academy')
				}
			/>
			<Button
				key={`${keyPrefix}-submit`}
				size="sm"
				type="button"
				preset="secondary"
				suffix="question-submit"
				onClick={handleQuizSubmit}
				isLoading={isSubmitting}
				label={
					questionResponse
						? __('Update Question', 'academy')
						: __('Add Question', 'academy')
				}
			/>
		</>
	);

	return (
		<div className="academy-question-form-wrap">
			{resetLoading ? (
				<div className="academy-question-form--loading">
					<Preloader />
				</div>
			) : (
				<>
					<div className="academy-question-form">
						<div className="academy-question-form__field">
							<div className="entry-left w-full">
								<div className="academy-question-from__questions">
									<div className="academy-question-from__questions--title flex flex-col">
										<div className="academy-ai-generate--item-wrap academy-mb-2 justify-between">
											<label
												htmlFor="questionTitle"
												className="academy-title"
											>
												{__(
													'Question Title',
													'academy'
												)}
											</label>
											<div className="academy-question-title__actions flex items-center gap-4">
												<div className="academy-question-title__format flex items-center gap-4">
													<Radio
														id="questionTitleFormatPlain"
														name="question_title_type"
														value="plain"
														checked={
															values.question_title_type !==
															'rich'
														}
														onChange={() =>
															setFieldValue(
																'question_title_type',
																'plain'
															)
														}
														label={__(
															'Plain',
															'academy'
														)}
													/>
													<Radio
														id="questionTitleFormatRich"
														name="question_title_type"
														value="rich"
														checked={
															values.question_title_type ===
															'rich'
														}
														onChange={() =>
															setFieldValue(
																'question_title_type',
																'rich'
															)
														}
														label={__(
															'Rich text',
															'academy'
														)}
													/>
												</div>
												<AiTextGenerator
													title={__(
														'Generate Question Title',
														'academy'
													)}
													name="question_title"
													saveHandler={setFieldValue}
													label={__(
														'Append to Question title',
														'academy'
													)}
												/>
											</div>
										</div>
										{values.question_title_type ===
										'rich' ? (
											<div className="academy-mb-4">
												<Editor
													name="question_title"
													defaultValue={
														values.question_title
													}
													saveValueHandler={
														setFieldValue
													}
													suffix="question-title"
												/>
											</div>
										) : (
											<Field
												type="text"
												id="questionTitle"
												name="question_title"
												className="academy-input academy-mb-4"
												placeholder={__(
													'Add question title here',
													'academy'
												)}
											/>
										)}
										<div className="academy-question-from__questions--audio flex flex-col academy-mb-4">
											<label className="academy-title academy-mb-2">
												{__(
													'Audio (Optional)',
													'academy'
												)}
											</label>
											<QuizUploadAudio
												name="question_audio_id"
												saveValueHandler={
													setFieldValue
												}
												value={parseInt(
													values.question_audio_id
												)}
											/>
										</div>
										<div className="academy-question-from__questions--description-container flex flex-col gap-3">
											{!showDescription ? (
												<Button
													icon={
														<span className="academy-icon academy-icon--simple-add" />
													}
													iconPosition="left"
													suffix="description"
													preset="transparent"
													onClick={() =>
														isShowDescription(true)
													}
													label={__(
														'Add Description',
														'academy'
													)}
													className="academy-btn__description academy-sub-title"
												/>
											) : (
												<div className="academy-form-group-field">
													<div className="academy-description-close flex justify-between items-baseline">
														<div className="academy-ai-generate--item-wrap academy-mb-2">
															<label
																htmlFor="questionDesc"
																className="academy-title"
															>
																{__(
																	'Description (Optional)',
																	'academy'
																)}
															</label>
															<AiTextGenerator
																title={__(
																	'Generate Question Description',
																	'academy'
																)}
																placeholder={__(
																	'Exp: Create a description about…',
																	'academy'
																)}
																name="question_content"
																saveHandler={
																	setFieldValue
																}
																label={__(
																	'Append to Question title',
																	'academy'
																)}
															/>
														</div>

														<Button
															onClick={() =>
																isShowDescription(
																	false
																)
															}
															icon={
																<span className="academy-icon academy-icon--close" />
															}
															preset="transparent"
															size="sm"
														/>
													</div>

													<div className="academy-mb-4">
														<Editor
															name="question_content"
															defaultValue={
																values.question_content
															}
															saveValueHandler={
																setFieldValue
															}
															suffix="question-description"
														/>
													</div>
												</div>
											)}
											{!showExplanation ? (
												<Button
													icon={
														<span className="academy-icon academy-icon--simple-add" />
													}
													iconPosition="left"
													suffix="explanation"
													preset="transparent"
													onClick={() =>
														setShowExplanation(true)
													}
													label={__(
														'Add Explanations',
														'academy'
													)}
													className="academy-btn__description academy-sub-title"
												/>
											) : (
												<div className="academy-form-group-field">
													<div className="academy-description-close flex justify-between items-baseline">
														<div className="academy-ai-generate--item-wrap academy-mb-2">
															<label
																htmlFor="questionDesc"
																className="academy-title"
															>
																{__(
																	'Explanation (Optional)',
																	'academy'
																)}
															</label>
														</div>

														<Button
															onClick={() =>
																setShowExplanation(
																	false
																)
															}
															icon={
																<span className="academy-icon academy-icon--close" />
															}
															preset="transparent"
															size="sm"
														/>
													</div>

													<div className="academy-mb-4">
														<Editor
															name="question_explanation"
															defaultValue={
																values.question_explanation
															}
															saveValueHandler={
																setFieldValue
															}
															suffix="question-explanation"
														/>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
								<div className="academy-form-group-d-flex">
									<div className="academy-form-group academy-form-group--select">
										<label htmlFor="questionType">
											{__('Question Type', 'academy')}
										</label>
										<Select
											className="academy-select"
											value={
												values?.question_type ||
												questionTypeOption[0]?.value
											}
											options={questionTypeOption}
											onChangeHandler={(val) => {
												if (
													val !== values.question_type
												) {
													setFieldValue(
														'answers',
														[]
													);
												}
												setFieldValue(
													'question_type',
													val
												);
											}}
										/>
									</div>
									<div className="academy-form-group">
										<label htmlFor="questionType">
											{__('Point(s)', 'academy')}
										</label>
										<Field
											type="number"
											id="question_score"
											name="question_score"
											className="academy-form-control"
											min="0"
											placeholder={__(
												'Ex. 10',
												'academy'
											)}
										/>
									</div>
									<div className="academy-form-group academy-form-group--select">
										<label htmlFor="questionLevel">
											{__('Question Level', 'academy')}
										</label>
										<Select
											className="academy-select"
											isClearable={true}
											placeholder={__(
												'Select level',
												'academy'
											)}
											value={
												questionLevelOption.find(
													(opt) =>
														opt.value ===
														values?.question_level
												) ?? ''
											}
											options={questionLevelOption}
											onChangeHandler={(val) =>
												setFieldValue(
													'question_level',
													val ?? ''
												)
											}
										/>
									</div>
								</div>
								<AnswerFields
									question_type={values?.question_type}
									isLoading={isLoading}
									setLoading={setLoading}
								/>
							</div>
							<div className="entry-right">
								<div className="academy-question-form__image-field flex flex-col mb-6">
									<label className="academy-title academy-mb-2">
										{__('Image', 'academy')}
									</label>
									<QuizUploadImage
										className="academy-mb-2"
										name={'question_image_id'}
										saveValueHandler={setFieldValue}
										value={parseInt(
											values.question_image_id
										)}
									/>
								</div>

								{parseInt(values.question_image_id) > 0 && (
									<div className="academy-quiz-image-settings academy-mb-6">
										<h3 className="academy-question-setting__heading academy-title">
											{__('Image settings', 'academy')}
										</h3>
										<div className="academy-form-group">
											<label htmlFor="questionImageSize">
												{__('Size', 'academy')}
											</label>
											<Select
												className="academy-select"
												value={
													values?.question_settings
														?.image?.size || 'full'
												}
												options={
													questionImageSizeOptions
												}
												onChangeHandler={(val) =>
													setFieldValue(
														'question_settings.image.size',
														val
													)
												}
											/>
										</div>
										<div className="academy-form-group">
											<label htmlFor="questionImageAlignment">
												{__('Alignment', 'academy')}
											</label>
											<Select
												className="academy-select"
												value={
													values?.question_settings
														?.image
														?.alignment || 'none'
												}
												options={
													questionImageAlignmentOptions
												}
												onChangeHandler={(val) =>
													setFieldValue(
														'question_settings.image.alignment',
														val
													)
												}
											/>
										</div>
										<div className="academy-form-group">
											<label htmlFor="questionImageAlt">
												{__('Alt text', 'academy')}
											</label>
											<Field
												type="text"
												id="questionImageAlt"
												name="question_settings.image.alt"
												className="academy-input"
												placeholder={__(
													'Describe this image for accessibility',
													'academy'
												)}
											/>
										</div>
										<div className="academy-form-group">
											<label htmlFor="questionImageCaption">
												{__('Caption', 'academy')}
											</label>
											<Field
												type="text"
												id="questionImageCaption"
												name="question_settings.image.caption"
												className="academy-input"
												placeholder={__(
													'Optional caption shown under the image',
													'academy'
												)}
											/>
										</div>
									</div>
								)}

								<h3 className="academy-question-setting__heading academy-title">
									{__('Question settings', 'academy')}
								</h3>

								<div className="academy-form-group academy-form-group--switch-control">
									{/* eslint-disable-next-line */}
									<label>
										{__('Answer required', 'academy')}
									</label>
									<Field
										name="question_settings.answer_required"
										component={SwitchControl}
									/>
								</div>

								<div className="academy-form-group academy-form-group--switch-control">
									{/* eslint-disable-next-line */}
									<label>
										{__('Randomize Answer', 'academy')}
									</label>
									<Field
										name="question_settings.randomize"
										component={SwitchControl}
									/>
								</div>

								<div className="academy-form-group academy-form-group--switch-control">
									{/* eslint-disable-next-line */}
									<label>
										{__('Display points', 'academy')}
									</label>
									<Field
										name="question_settings.display_points"
										component={SwitchControl}
									/>
								</div>
								<div className="academy-form-group academy-form-group--negative-mark">
									{/* eslint-disable-next-line */}
									<label htmlFor="question_negative_score">
										<span className="academy-quiz-title">
											{__('Negative Marking', 'academy')}
										</span>
										<span className="academy-quiz-sub-title">
											{__(
												'Enter a value to deduct points for wrong quiz answers. Use 0 to avoid marking.',
												'academy'
											)}
										</span>
									</label>
									<Field
										name="question_negative_score"
										id="question_negative_score"
										type="number"
										className="academy-form-control"
										min="0"
										step="0.01"
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="academy-question-form-wrap--footer">
						{renderActions('footer')}
					</div>
				</>
			)}
		</div>
	);
};

export default function QuestionForm({
	quizId,
	initialValues,
	addQuestionHandler,
	setQuestionResponse,
	questionResponse,
	setQuestionFormInitialValues,
	onClose,
}) {
	const dispatch = useDispatch();
	const [answerResponse, setAnswerResponse] = useState([]);
	const [contentLoading, setContentLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (questionResponse) {
			setContentLoading(true);
			setIsLoading(true);
			getAnswers(
				questionResponse?.question_id,
				questionResponse.question_type
			).then((res) => {
				setAnswerResponse(res?.data);
				setContentLoading(false);
				setIsLoading(false);
			});
		}
	}, [questionResponse]);

	return (
		<React.Fragment>
			<Formik
				enableReinitialize={true}
				initialValues={{
					...questionSchema,
					quiz_id: quizId,
					...initialValues,
					...questionResponse,
					answers: answerResponse,
				}}
				onSubmit={(values, actions) => {
					actions.setSubmitting(true);
					const { answers } = values;
					// eslint-disable-next-line
					const haveTrueAnswer = answers?.reduce((acc, item) => {
						if (item.is_correct) {
							acc = true;
						}
						return acc;
					}, false);

					// question title error Message
					if (!values.question_title) {
						dispatch(
							showNotification({
								message: __(
									'Question Title Missing!!',
									'academy'
								),
								isShow: true,
								type: 'error',
							})
						);
						actions.setSubmitting(false);
						return;
					}
					// check have correct answer
					if (
						!haveTrueAnswer &&
						(values.question_type === 'singleChoice' ||
							values.question_type === 'multipleChoice' ||
							values.question_type === 'dropDown' ||
							values.question_type === 'trueFalse')
					) {
						dispatch(
							showNotification({
								message: __('No correct answer!!', 'academy'),
								isShow: true,
								type: 'error',
							})
						);
						actions.setSubmitting(false);
						return;
					}

					// every image-answer option needs both a title and an image —
					// FieldImageAnswer's per-item form only enforces this when its
					// own "Save and Update Answer" button is used, so re-check here
					// in case the outer submit button is clicked while an option was
					// left incomplete.
					if (
						values.question_type === 'imageAnswer' &&
						(answers || []).some(
							(item) => !item.answer_title || !item.image_id
						)
					) {
						dispatch(
							showNotification({
								message: __(
									'Answer title and Image is required!!',
									'academy'
								),
								isShow: true,
								type: 'error',
							})
						);
						actions.setSubmitting(false);
						return;
					}

					// remove answers for avoid rest api error
					delete values.answers;

					// update Question
					if (values?.question_id) {
						dispatch(updateQuestion(values))
							.then(({ payload }) => {
								if (!parseInt(payload?.question_id)) {
									dispatch(
										showNotification({
											message:
												payload?.message ||
												__(
													'Failed to update question',
													'academy'
												),
											isShow: true,
											type: 'error',
										})
									);
									actions.setSubmitting(false);
									return;
								}
								dispatch(
									showNotification({
										message: __(
											'Question Updated',
											'academy'
										),
										isShow: true,
										type: 'success',
									})
								);
								createQuestionAnswers(answers, {
									quiz_id: parseInt(quizId),
									question_id: parseInt(payload?.question_id),
									question_type: payload?.question_type,
								});
								addQuestionHandler(payload);
								actions.setSubmitting(false);
							})
							.catch((e) => {
								console.error(e); // eslint-disable-line
							});
					} else {
						// create questions
						dispatch(createQuestion(values))
							.then(({ payload }) => {
								if (!parseInt(payload?.question_id)) {
									dispatch(
										showNotification({
											message:
												payload?.message ||
												__(
													'Failed to add question',
													'academy'
												),
											isShow: true,
											type: 'error',
										})
									);
									actions.setSubmitting(false);
									return;
								}
								dispatch(
									showNotification({
										message: __(
											'Question Added',
											'academy'
										),
										isShow: true,
										type: 'success',
									})
								);
								createQuestionAnswers(answers, {
									quiz_id: parseInt(quizId),
									question_id: parseInt(payload?.question_id),
									question_type: payload?.question_type,
								});
								addQuestionHandler(payload);
								setQuestionFormInitialValues(false);
								setAnswerResponse([]);
								actions.resetForm({
									values: {
										...questionSchema,
										quiz_id: quizId,
										answers: resetAnswers,
									},
								});
								actions.setSubmitting(false);
							})
							.catch((e) => {
								console.error(e); // eslint-disable-line
							});
					}
				}}
			>
				{contentLoading ? (
					<Preloader />
				) : (
					<QuestionFormInner
						questionResponse={questionResponse}
						setQuestionResponse={setQuestionResponse}
						isLoading={isLoading}
						setLoading={setIsLoading}
						quizId={quizId}
						setAnswerResponse={setAnswerResponse}
						setQuestionFormInitialValues={
							setQuestionFormInitialValues
						}
						onClose={onClose}
					/>
				)}
			</Formik>
		</React.Fragment>
	);
}

QuestionForm.propTypes = propTypes;
