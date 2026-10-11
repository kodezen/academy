import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import TopBar from '@Components/TopBar';
import Preloader from '@Components/Loader/Preloader';
import { Breadcrumb } from '@Components/ui';
import QuestionForm from '../QuestionForm';
import { getQuestion } from '../helper';

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

/*
 * Full-page (route-based) question editor for the standalone Questions bank —
 * replaces the modal. Renders the shared QuestionForm with quiz_id 0 (unowned)
 * inside the Academy container width, under a breadcrumb topbar.
 */
export default function QuestionEditor({ questionId, onBack, onSaved }) {
	const [loading, setLoading] = useState(!!questionId);
	const [questionResponse, setQuestionResponse] = useState(false);
	const [formInitialValues, setFormInitialValues] = useState(false);

	useEffect(() => {
		if (!questionId) {
			return;
		}
		setLoading(true);
		getQuestion(questionId)
			.then((res) => {
				setQuestionResponse({
					...res,
					question_settings: parseSettings(res?.question_settings),
				});
				setFormInitialValues({
					question_title: res?.question_title,
					question_id: questionId,
				});
			})
			.finally(() => setLoading(false));
	}, [questionId]);

	const crumbs = [
		{ label: __('Questions', 'academy'), onClick: onBack },
		{
			label: questionId
				? __('Edit Question', 'academy')
				: __('New Question', 'academy'),
		},
	];

	return (
		<>
			<TopBar
				render={() => (
					<h3 className="academy-topbar-heading">
						<span className="academy-icon academy-icon--angle-right" />
						<Breadcrumb items={crumbs} />
					</h3>
				)}
			/>
			<div className="academy-question-editor">
				{loading ? (
					<div className="academy-question-editor__loader h-[200px]">
						<Preloader />
					</div>
				) : (
					<div className="academy-question-editor__form">
						<QuestionForm
							quizId={0}
							initialValues={formInitialValues}
							questionResponse={questionResponse}
							setQuestionResponse={setQuestionResponse}
							setQuestionFormInitialValues={setFormInitialValues}
							addQuestionHandler={onSaved}
							onClose={onBack}
						/>
					</div>
				)}
			</div>
		</>
	);
}
