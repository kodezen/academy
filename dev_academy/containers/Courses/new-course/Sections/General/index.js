import React from 'react';
import PostTitle from '@Components/Form/PostTitle';
import { useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import Editor from '@Components/Editor';
import AiTextGenerator from '@Components/AiTextGenerator';

const General = () => {
	const { values, setFieldValue } = useFormikContext();

	return (
		<div className="academy-content-wrap academy-course-content-section--general">
			<span className="academy-heading">{__('General', 'academy')}</span>
			<div className="academy-mb-6">
				<div className="academy-flex-1 academy-mb-2">
					<span className="academy-title">
						{__('Course Title', 'academy')}
						<span className="academy-required-field">*</span>
					</span>
					<AiTextGenerator
						title={__('Generate Course Title', 'academy')}
						name="title"
						saveHandler={setFieldValue}
					/>
				</div>

				<PostTitle
					name="title"
					label={__('Add course title here', 'academy')}
					postId={values.post_ID}
					defaultValue={values.title}
					permalink={values.link}
					onBlurHandler={(e) => setFieldValue("title", e.target.value)}
				/>
			</div>

			<div className="academy-column-items">
				<div className="academy-flex-1">
					<span className="academy-title">
						{__('Course Description', 'academy')}
					</span>
					<AiTextGenerator
						name="content"
						title={__('Generate Course Description', 'academy')}
						placeholder={__(
							'Exp: Create a description about…',
							'academy'
						)}
						saveHandler={(name, value) => {
							setFieldValue(name, value);
							const quill = document.querySelector(
								`#editor-container--course`
							)?.__quill;
							if (quill && quill.root.innerHTML !== value) {
								quill.clipboard.dangerouslyPasteHTML(value);
							}
						}}
					/>
				</div>

				<Editor
					name="content"
					defaultValue={values?.content}
					saveValueHandler={setFieldValue}
					suffix="course"
				/>
			</div>
		</div>
	);
};

export default General;
