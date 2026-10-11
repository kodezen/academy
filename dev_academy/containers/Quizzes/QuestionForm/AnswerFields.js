import React, { useEffect } from 'react';
import FieldMultiChoose from './Answer/FieldMultiChoose';
import FieldSingleChoose from './Answer/FieldSingleChoose';
import FieldTrueFalse from './Answer/FieldTrueFalse';
import Preloader from '@Components/Loader/Preloader';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import FieldShortAnswer from './Answer/FieldShortAnswer';
import FieldImageAnswer from './Answer/FieldImageAnswer';
import FieldFillInTheBlanks from './Answer/FieldFillInTheBlanks';
import { getAnswers } from '../helper';

const propTypes = {};

const renderSwitch = (type) => {
	switch (type) {
		case 'fillInTheBlanks':
			return <FieldFillInTheBlanks fieldType={type} />;
		case 'imageAnswer':
			return <FieldImageAnswer fieldType={type} />;
		case 'shortAnswer':
			return <FieldShortAnswer fieldType={type} />;
		case 'singleChoice':
			return <FieldSingleChoose fieldType={type} />;
		case 'dropDown':
			return <FieldSingleChoose fieldType={type} />;
		case 'multipleChoice':
			return <FieldMultiChoose fieldType={type} />;
		default:
			return <FieldTrueFalse fieldType={type} />;
	}
};

const renderMessage = (type) => {
	switch (type) {
		case 'fillInTheBlanks':
			return __(
				'Input options for this question with {dash} variable.',
				'academy'
			);
		case 'imageAnswer':
			return __(
				'Input option for this question with image and text.',
				'academy'
			);
		case 'shortAnswer':
			return 'No input option is required for this answer type.';
		case 'singleChoice':
			return __(
				'Select or add an option for this question, then select the correct answer.',
				'academy'
			);
		case 'dropDown':
			return __(
				'Select or add an option for this dropdown question, then select the correct answer.',
				'academy'
			);
		case 'multipleChoice':
			return __(
				'Select or add an option for this question, then select the correct answer.',
				'academy'
			);
		default:
			return __(
				'Select or add an option for this question, then select the correct answer.',
				'academy'
			);
	}
};

export default function AnswerFields({ question_type, isLoading, setLoading }) {
	const { values, setFieldValue } = useFormikContext();
	useEffect(() => {
		if (parseInt(values?.question_id)) {
			setLoading(true);
			getAnswers(values?.question_id, question_type).then((res) => {
				if (res?.data?.length > 0) {
					setFieldValue('answers', res?.data);
				}
				setLoading(false);
			});
		}
	}, [question_type, values?.question_id]);

	return (
		<React.Fragment>
			{isLoading ? (
				<div className="academy-form-group__loading-message">
					<Preloader />
				</div>
			) : (
				<div className="academy-form-group--answer">
					<h3 className="academy-quiz-answer-label">
						{renderMessage(question_type)}
					</h3>
					<div className="academy-quiz-answer-items rounded">
						{renderSwitch(question_type)}
					</div>
				</div>
			)}
		</React.Fragment>
	);
}

AnswerFields.propTypes = propTypes;
