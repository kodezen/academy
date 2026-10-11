import React, { useContext, useEffect } from 'react';

import ContentDrip from '@Components/ContentDrip';
import AcademySelect from '@Components/AcademySelect';
import AcademySeparator from '@Components/AcademySeparator';
import DropdownSelectControl from '@Components/Formik/DropdownSelectControl';
import FeedbackRadioControl from '@Components/Formik/FeedbackRadioControl';
import { Field } from 'formik';
import { Link } from 'react-router-dom';
import QuizFormContext from '../../context/QuizFormContext';
import SwitchControl from '@Components/Formik/SwitchControl';
import WarningNotice from '@Components/WarningNotice/WarningNotice';
import { __ } from '@wordpress/i18n';
import { getAddonActiveStatus, route_path } from '@Utils/helper';
import { useSelector } from 'react-redux';

// A cleared or invalid number falls back to 0; values are whole numbers within [0, max].
const clampQuizInt = (value, max = Infinity) => {
	const n = Math.trunc(Number(value));
	return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};

const propTypes = {};

export default function ThirdStep({ setFieldValue, values }) {
	const allAddons = useSelector((state) => state.addons);
	const { dripContentType, topics, currentItemId, isDripContentEnable } =
		useContext(QuizFormContext);

	const contentDrip = getAddonActiveStatus(
		allAddons,
		'content-drip',
		true
	) && (
			<ContentDrip
				name="academy_quiz_drip_content"
				type={dripContentType}
				topics={topics}
				currentItemId={currentItemId}
				isDripContentEnable={isDripContentEnable}
			/>
		);
	const quizTimeUnit = [
		{ value: 'seconds', label: __('Seconds', 'academy') },
		{ value: 'minutes', label: __('Minutes', 'academy') },
		{ value: 'hours', label: __('Hours', 'academy') },
		{ value: 'days', label: __('Days', 'academy') },
		{ value: 'weeks', label: __('Weeks', 'academy') },
	];

	const isResumeMode = values?.meta?.academy_quiz_feedback_mode === 'resume';

	// Resume Mode: a student can come back much later, and Random order
	// re-shuffles on every fetch — there's no way to keep a resumed attempt
	// on the same question sequence it started with. Rather than take on
	// persisting/freezing a per-attempt order, just don't offer Random here.
	const questionOrderOptions = [
		{
			label: __('Random', 'academy'),
			value: 'rand',
		},
		{
			label: __('Ascending', 'academy'),
			value: 'ASC',
		},
		{
			label: __('Descending', 'academy'),
			value: 'DESC',
		},
	].filter((option) => !isResumeMode || option.value !== 'rand');

	useEffect(() => {
		if (
			isResumeMode &&
			values?.meta?.academy_quiz_questions_order === 'rand'
		) {
			setFieldValue('meta.academy_quiz_questions_order', 'ASC');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isResumeMode]);

	const questionLayoutOptions = [
		{
			label: __('Single', 'academy'),
			value: 'single',
		},
		{
			label: __('All', 'academy'),
			value: 'all',
		},
	];

	return (
		<React.Fragment>
			<div className="academy-quiz-form__step">
				<div className="academy-quiz-settings">
					<WarningNotice
						variant="pro"
						title={__('Quiz Proctoring', 'academy')}
						description={
							<>
								{__(
									'Browser Lock is a global setting that applies to every quiz — there’s no per-quiz override here. Manage it from ',
									'academy'
								)}
								<Link
									to={`${route_path}admin.php?page=academy-settings&path=pages&tab=learn-page&highlight=quiz_proctoring`}
								>
									{__(
										'Learn Page settings → Quiz Proctoring',
										'academy'
									)}
								</Link>
								.
							</>
						}
					/>

					<div className="academy-quiz-settings__switch-field-wrapper flex justify-between mb-6">
						<label htmlFor="hideQuestionNumber">
							<span className="academy-quiz-title">
								{__('Hide question number', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__(
									'Show/hide question number during attempt.',
									'academy'
								)}
							</span>
						</label>

						<Field
							id="hideQuestionNumber"
							name="meta.academy_quiz_hide_question_number"
							component={SwitchControl}
						/>
					</div>

					<div className="academy-quiz-settings__switch-field-wrapper flex justify-between mb-6">
						<label htmlFor="hideQuizTime">
							<span className="academy-quiz-title">
								{__('Hide quiz time', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__('Show/hide quiz time', 'academy')}
							</span>
						</label>
						<Field
							id="hideQuizTime"
							name="meta.academy_quiz_hide_quiz_time"
							component={SwitchControl}
						/>
					</div>

					<div className="academy-quiz-settings__switch-field-wrapper flex justify-between mb-6">
						<label htmlFor="ShowQuestionExplanation">
							<span className="academy-quiz-title">
								{__('Show Question Explanations', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__('Enable this option to display question explanations when students review their quiz attempt details after submission.', 'academy')}
							</span>
						</label>
						<Field
							id="ShowQuestionExplanation"
							name="meta.academy_quiz_explanation_enabled"
							component={SwitchControl}
						/>
					</div>

					<div className="academy-quiz-settings__switch-field-wrapper flex justify-between mb-6">
						<label htmlFor="SkipQuestions">
							<span className="academy-quiz-title">
								{__('Skipped Questions', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__(
									'Enable this option to display skipped questions in the results',
									'academy'
								)}
							</span>
						</label>
						<Field
							id="hideQuizTime"
							name="meta.academy_quiz_skip_question_showing"
							component={SwitchControl}
						/>
					</div>

					<div className="academy-quiz-settings__switch-field-wrapper flex justify-between mb-6">
						<label htmlFor="ShowFullQuiz">
							<span className="academy-quiz-title">
								{__('Show Full Quiz Answer Details', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__(
									'Enable this option to show the full quiz answer content in the quiz attempt details.',
									'academy'
								)}
							</span>
						</label>
						<Field
							id="hideQuizTime"
							name="meta.academy_quiz_show_full_answer_content"
							component={SwitchControl}
						/>
					</div>

					<div className="academy-quiz-settings__questions_layout flex items-center justify-between pb-6">
						<label htmlFor="academy_quiz_questions_layout">
							<span className="academy-quiz-title">
								{__('Quiz Questions Layout', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__(
									'Select Single to present one question at a time or All to display every question together on one page.',
									'academy'
								)}
							</span>
						</label>
						<AcademySelect
							id="meta.academy_quiz_questions_layout"
							name="meta.academy_quiz_questions_layout"
							suffix="question-layout"
							component={DropdownSelectControl}
							options={questionLayoutOptions}
							value={questionLayoutOptions.find(
								(item) =>
									item.value ===
									values?.meta?.academy_quiz_questions_layout
							)}
							onChangeHandler={(option) =>
								setFieldValue(
									'meta.academy_quiz_questions_layout',
									option
								)
							}
						/>
					</div>

					<AcademySeparator />

					<div className="academy-quiz-settings__quiz-time-fields-group flex justify-between items-center">
						<div>
							<label
								htmlFor="timelimit"
								className="academy-quiz-settings__quiz-time-fields-group__label"
							>
								<span>{__('Time Limit', 'academy')}</span>
								<span className="academy-quiz-settings__quiz-time-fields-group__desc">
									{__(
										'Time limit for this quiz. 0 means no time limit.',
										'academy'
									)}
								</span>
							</label>
						</div>

						<div
							id="timelimit"
							className="academy-quiz-settings__quiz-time-fields-group__items"
						>
							<div className="academy-form-group time-limit academy-form-group-fields">
								<Field
									type="number"
									id="academy_quiz_time"
									name="meta.academy_quiz_time"
									onBlur={(e) =>
										setFieldValue('meta.academy_quiz_time', clampQuizInt(e.target.value, Infinity))
									}
									className="academy-form-control"
									min="0"
								/>
							</div>
							<div className="academy-form-group academy-form-group-fields">
								<AcademySelect
									id="academy_quiz_time_unit"
									name="meta.academy_quiz_time_unit"
									suffix="time-limit"
									component={DropdownSelectControl}
									value={quizTimeUnit.find(
										(item) =>
											item.value ===
											values?.meta?.academy_quiz_time_unit
									)}
									options={quizTimeUnit}
									onChangeHandler={(option) => {
										setFieldValue(
											'meta.academy_quiz_time_unit',
											option
										);
									}}
								/>
							</div>
						</div>
					</div>

					<div className="academy-quiz-settings__questions_order flex items-center justify-between pb-6 mt-6">
						<label htmlFor="academy_quiz_questions_order">
							<span className="academy-quiz-title">
								{__('Questions Order', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__('Question order type', 'academy')}
							</span>
						</label>
						<AcademySelect
							id="meta.academy_quiz_questions_order"
							name="meta.academy_quiz_questions_order"
							suffix="question-order"
							component={DropdownSelectControl}
							options={questionOrderOptions}
							value={questionOrderOptions.find(
								(item) =>
									item.value ===
									values?.meta?.academy_quiz_questions_order
							)}
							onChangeHandler={(option) =>
								setFieldValue(
									'meta.academy_quiz_questions_order',
									option
								)
							}
						/>
					</div>

					<AcademySeparator />

					<div className="academy-quiz-settings__passing-grade flex items-center justify-between pb-6">
						<label htmlFor="academy_quiz_passing_grade">
							<span className="academy-quiz-title">
								{__('Passing Grade (%)', 'academy')}
							</span>
							<span className="academy-quiz-sub-title">
								{__(
									'Set the passing percentage for this quiz.',
									'academy'
								)}
							</span>
						</label>
						<div className="academy-input p-0 w-fit">
							<Field
								id="academy_quiz_passing_grade"
								type="number"
								name="meta.academy_quiz_passing_grade"
								onBlur={(e) =>
									setFieldValue('meta.academy_quiz_passing_grade', clampQuizInt(e.target.value, 100))
								}
								className="academy-form-control"
								min="0"
							/>
							<span className="academy-subtext-span">
								{__('%', 'academy')}
							</span>
						</div>
					</div>

					<>
						<div className="academy-quiz-settings__quiz-feedback-fields-group">
							<div className="info">
								<label htmlFor="academy_quiz_feedback_mode">
									<span className="academy-quiz-title">
										{__('Quiz Feedback Mode', 'academy')}
									</span>
									<span className="academy-quiz-sub-title">
										{__(
											'(Pick the quiz system"s behaviour on choice based questions.)',
											'academy'
										)}
									</span>
								</label>
							</div>
							<div
								className="academy-switch-fields-wrapper academy-form-group-fields"
								id="academy_quiz_feedback_mode"
							>
								<Field
									name="meta.academy_quiz_feedback_mode"
									component={FeedbackRadioControl}
									value="default"
									label={__('Default', 'academy')}
									desc={__(
										'Answers are shown after the quiz is finished',
										'academy'
									)}
								/>
								<Field
									name="meta.academy_quiz_feedback_mode"
									component={FeedbackRadioControl}
									value="retry"
									label={__('Retry Mode', 'academy')}
									desc={__(
										'Unlimited attempts on each question.',
										'academy'
									)}
								/>
								<Field
									name="meta.academy_quiz_feedback_mode"
									component={FeedbackRadioControl}
									value="resume"
									label={__('Resume Mode', 'academy')}
									desc={__(
										'If a student leaves mid-attempt, they can resume exactly where they left off, or start over (the previous attempt then counts).',
										'academy'
									)}
								/>
							</div>
						</div>

						{['retry', 'resume'].includes(
							values?.meta?.academy_quiz_feedback_mode
						) && (
								<div className="academy-quiz-settings__attempts_allowed flex justify-between items-center mt-2.5 pb-2">
									<label htmlFor="academy_quiz_max_attempts_allowed">
										<span className="academy-quiz-title">
											{__('Attempts Allowed', 'academy')}
										</span>
										<span className="academy-quiz-sub-title">
											{__(
												'Restriction on the number of attempts a student is allowed to take for this quiz. 0 for no limit.',
												'academy'
											)}
										</span>
									</label>
									<Field
										id="academy_quiz_max_attempts_allowed"
										type="number"
										name="meta.academy_quiz_max_attempts_allowed"
										onBlur={(e) =>
											setFieldValue('meta.academy_quiz_max_attempts_allowed', clampQuizInt(e.target.value, Infinity))
										}
										className="academy-input"
										min="0"
									/>
								</div>
							)}
						{contentDrip}

						<div className="academy-quiz-settings__passing-allowed flex items-center justify-between">
							<label htmlFor="academy_quiz_max_questions_for_answer">
								<span className="academy-quiz-title">
									{__('Max Questions allowed', 'academy')}
								</span>
								<span className="academy-quiz-sub-title">
									{__(
										'Specify the number of questions you would like to display on the learning page. 0 for no limit.',
										'academy'
									)}
								</span>
							</label>
							<div>
								<Field
									id="academy_quiz_max_questions_for_answer"
									type="number"
									name="meta.academy_quiz_max_questions_for_answer"
									onBlur={(e) =>
										setFieldValue('meta.academy_quiz_max_questions_for_answer', clampQuizInt(e.target.value, Infinity))
									}
									className="academy-input"
									min="0"
								/>
							</div>
						</div>
					</>
				</div>
			</div>
		</React.Fragment>
	);
}

ThirdStep.propTypes = propTypes;
