import {
	API,
	current_user_id,
	getAddonActiveStatus,
	namespace,
	makeRequest2,
} from '@Utils/helper';

import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export const createQuestionAnswers = (answers, quizQuestionArgs) => {
	try {
		const responses = [];
		answers.forEach(async (answer) => {
			const path = namespace + 'quiz_answers';
			return await apiFetch({
				path,
				method: 'POST',
				data: { ...answer, ...quizQuestionArgs },
			}).then((res) => {
				responses.push(res);
			});
		});
		return responses;
	} catch (e) {
		console.error(e); // eslint-disable-line
	}
};

export const getQuestion = async (id) => {
	try {
		const path = namespace + 'quiz_questions/' + id;
		return await apiFetch({
			path,
			method: 'GET',
		}).then((res) => {
			return res;
		});
	} catch (e) {
		console.error(e); // eslint-disable-line
	}
};

export const getAnswers = async (questionId, questionType) => {
	try {
		return await API.get(
			`${namespace}quiz_answers/${parseInt(questionId)}`,
			{
				params: {
					question_type: questionType,
				},
			}
		).then((res) => {
			return res;
		});
	} catch (e) {
		console.error(e); // eslint-disable-line
	}
};

export const quizFormInitialValues = (data, allAddons) => {
	const isActiveDripContent = getAddonActiveStatus(
		allAddons,
		'content-drip',
		true
	);

	const dripContentMeta = isActiveDripContent
		? {
				academy_quiz_drip_content: {
					schedule_by_prerequisite: '',
					schedule_by_enroll_date: 0,
					schedule_by_topic_complete_date: 0,
					schedule_by_date: '',
				},
			}
		: {};

	// Baseline every field the wizard's controls read. Both the create-new flow
	// and an edit start from this — an edit then layers its saved values on top.
	const schema = {
		title: '',
		content: '',
		author: current_user_id,
		meta: {
			academy_quiz_questions: [],
			academy_quiz_time: 0,
			academy_quiz_time_unit: 'minutes',
			academy_quiz_hide_quiz_time: false,
			academy_quiz_feedback_mode: 'default',
			academy_quiz_passing_grade: 80,
			academy_quiz_max_questions_for_answer: 0,
			academy_quiz_max_attempts_allowed: 10,
			academy_quiz_auto_start: false,
			academy_quiz_questions_order: 'rand',
			academy_quiz_hide_question_number: false,
			academy_quiz_skip_question_showing: false,
			academy_quiz_show_full_answer_content: false,
			academy_quiz_short_answer_characters_limit: 200,
			academy_quiz_questions_layout: 'single',
			...dripContentMeta,
		},
	};

	// Only an actual saved quiz (has an id) takes the "existing quiz" branch.
	// The create-new flow passes `{}` (frontend Quizzes page) or `false`
	// (course builder) here — both must fall through to `schema`. Without the
	// id check, `{}` was treated as an existing quiz, `meta` came back empty,
	// and Step 2 (Questions) crashed on `data.length`, tearing the modal down.
	if (data && data.id) {
		return {
			...schema,
			...data,
			title: data?.title?.raw ?? data?.title ?? '',
			content: data?.content?.raw ?? data?.content ?? '',
			// Merge over the schema so any meta key the payload omits (a list
			// row often carries only partial meta) keeps a sane default —
			// otherwise the Settings step renders every select/radio blank.
			meta: {
				...schema.meta,
				...data.meta,
				// Step 2 (Questions) maps over this — keep it an array even if
				// the payload sends null / a scalar.
				academy_quiz_questions: Array.isArray(
					data.meta?.academy_quiz_questions
				)
					? data.meta.academy_quiz_questions
					: [],
				...(isActiveDripContent
					? {
							academy_quiz_drip_content: {
								...schema.meta.academy_quiz_drip_content,
								...data.meta?.academy_quiz_drip_content,
							},
						}
					: {}),
			},
		};
	}

	return schema;
};

export const questionSchema = {
	quiz_id: '',
	question_title: '',
	question_title_type: 'plain',
	question_image_id: 0,
	question_audio_id: 0,
	question_content: '',
	question_explanation: '',
	question_level: 'medium',
	question_type: 'trueFalse',
	question_score: 1.0,
	question_settings: {
		display_points: true,
		answer_required: false,
		randomize: false,
		image: {
			size: 'full',
			alignment: 'none',
			alt: '',
			caption: '',
		},
	},
	question_negative_score: 0.0,
	correct_answer: '',
};

export const questionTypeOption = [
	{
		value: 'trueFalse',
		label: __('True/False', 'academy'),
	},
	{
		value: 'singleChoice',
		label: __('Single Choice', 'academy'),
	},
	{
		value: 'multipleChoice',
		label: __('Multiple Choice', 'academy'),
	},
	{
		value: 'dropDown',
		label: __('Dropdown', 'academy'),
	},
	{
		value: 'shortAnswer',
		label: __('Short Answer', 'academy'),
	},
	{
		value: 'imageAnswer',
		label: __('Image Answer', 'academy'),
	},
	{
		value: 'fillInTheBlanks',
		label: __('Fill In The Blanks', 'academy'),
	},
];

export const questionLevelOption = [
	{
		value: 'high',
		label: __('High', 'academy'),
	},
	{
		value: 'medium',
		label: __('Medium', 'academy'),
	},
	{
		value: 'low',
		label: __('Low', 'academy'),
	},
];

export const questionImageSizeOptions = [
	{
		value: 'small',
		label: __('Small (25%)', 'academy'),
	},
	{
		value: 'medium',
		label: __('Medium (50%)', 'academy'),
	},
	{
		value: 'large',
		label: __('Large (75%)', 'academy'),
	},
	{
		value: 'full',
		label: __('Full Width (100%)', 'academy'),
	},
];

export const questionImageAlignmentOptions = [
	{
		value: 'none',
		label: __('None', 'academy'),
	},
	{
		value: 'left',
		label: __('Left', 'academy'),
	},
	{
		value: 'center',
		label: __('Center', 'academy'),
	},
	{
		value: 'right',
		label: __('Right', 'academy'),
	},
];

export const aiGenerateQuiz = async (prompt) => {
	return await makeRequest2({
		action: 'academy/ai_integration/chatgpt',
		prompt_handler: 'quiz_generation',
		prompt,
	}).then((res) => {
		return res;
	});
};
