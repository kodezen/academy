import { Field, useFormikContext } from 'formik';
import React from 'react';
import { __ } from '@wordpress/i18n';
import Editor from '@Components/Editor';
import PostSelect from '@Components/PostSelect';
import AiTextGenerator from '@Components/AiTextGenerator';
import CustomFieldsBox from '@Components/CustomFieldsBox';

import './styles.scss';

const propTypes = {};

export default function AnnouncementForm() {
	const { values, setFieldValue } = useFormikContext();

	return (
		<React.Fragment>
			<div className="academy-course-announcement-form flex flex-col gap-6 relative min-w-[450px] max-[480px]:min-w-full">
				<div className="academy-course-announcement-form__item relative mb-0">
					<div className="academy-ai-generate--item-wrap academy-mb-2">
						<label htmlFor="title">
							<span className="academy-title">
								{__('Title', 'academy')}
								<span className="ml-0.5 text-academy-danger">*</span>
							</span>
						</label>
						<AiTextGenerator
							title={__('Generate Announcement Title', 'academy')}
							name="title"
							saveHandler={setFieldValue}
							label={__(
								'Append to Announcement Title',
								'academy'
							)}
						/>
					</div>
					<Field
						id="title"
						name="title"
						// A course isn't required to start typing — only to
						// actually create/update (onSubmitHandler warns then).
						placeholder={__('Add title here', 'academy')}
						className="academy-input"
					/>
				</div>
				<div className="academy-course-announcement-form__item relative mb-0">
					<label htmlFor="select-course" className="academy-mb-2 block">
						<span className="academy-title">
							{__('Select Course', 'academy')}
							<span className="ml-0.5 text-academy-danger">*</span>
						</span>
					</label>

					<PostSelect
						name="meta.academy_announcements_course_ids"
						placeholder={__(
							'Select your preferred course',
							'academy'
						)}
						postType="academy_courses"
						isMulti={true}
					/>
				</div>
				<div className="academy-course-announcement-form__item relative mb-0">
					<div className="academy-ai-generate--item-wrap academy-mb-2">
						<label htmlFor="content">
							<span className="academy-title">
								{__('Description', 'academy')}
								<span className="ml-0.5 text-academy-danger">*</span>
							</span>
						</label>
						<AiTextGenerator
							title={__(
								'Generate Announcement Description',
								'academy'
							)}
							placeholder={__(
								'Exp: Create a description about…',
								'academy'
							)}
							name="content"
							saveHandler={setFieldValue}
							label={__(
								'Append to Announcement Description',
								'academy'
							)}
						/>
					</div>

					<Editor
						name="content"
						defaultValue={values.content}
						saveValueHandler={setFieldValue}
						suffix="announcement"
					/>
				</div>
				{/* ECM field groups for announcements (no custom taxonomy here). */}
				<CustomFieldsBox
					postType="academy_announcement"
					label={__('announcements', 'academy')}
					values={values}
					setFieldValue={setFieldValue}
				/>
			</div>
		</React.Fragment>
	);
}

AnnouncementForm.propTypes = propTypes;
