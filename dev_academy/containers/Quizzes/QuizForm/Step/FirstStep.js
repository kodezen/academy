import React from 'react';
import { Field, useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import AiTextGenerator from '@Components/AiTextGenerator';
import Editor from '@Components/Editor';

const propTypes = {};

export default function FirstStep() {
	const { values, setFieldValue } = useFormikContext();

	return (
		<React.Fragment>
			<div className="academy-quiz-form__step flex flex-col">
				<div className="academy-ai-generate--item-wrap academy-mb-2">
					<label htmlFor="title" className="academy-title">
						{__('Quiz Title', 'academy')}
					</label>
					<AiTextGenerator
						title={__('Generate Quiz Title', 'academy')}
						name="title"
						saveHandler={setFieldValue}
						label={__('Append to Quiz title', 'academy')}
					/>
				</div>
				<Field
					id="title"
					name="title"
					placeholder={__('Add Quiz title here', 'academy')}
					className="academy-input"
				/>

				<div className="academy-quiz-form__step-description mt-6">
					<div className="academy-ai-generate--item-wrap academy-mb-2">
						<label htmlFor="content" className="academy-title">
							{__('Description (Optional)', 'academy')}
						</label>
						<AiTextGenerator
							title={__('Generate Quiz Description', 'academy')}
							name="content"
							saveHandler={setFieldValue}
							label={__('Append to Quiz Description', 'academy')}
						/>
					</div>
					<div className="academy-editor-tinymce-wrapper">
						<Editor
							name="content"
							defaultValue={values?.content}
							saveValueHandler={setFieldValue}
							suffix="quiz"
						/>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

FirstStep.propTypes = propTypes;
