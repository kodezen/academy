import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import PostSelect from '@Components/PostSelect';
import { useFormikContext } from 'formik';
import AcademySelect from '@Components/AcademySelect';

const propTypes = {
	name: PropTypes.string,
};

export default function CoursePrerequisite() {
	const { values, setFieldValue } = useFormikContext();
	const prerequisiteType = values?.meta?.academy_prerequisite_type;
	const prerequisiteOptions = [
		{
			label: __('Course', 'academy'),
			value: 'course',
		},
		{
			label: __('Category', 'academy'),
			value: 'category',
		},
	];

	return (
		<React.Fragment>
			<div className="meta-field meta-field--prerequisite-type">
				<div className="meta-field__label">
					<h3 className="academy-title">
						{__('Prerequisite Type', 'academy')}
					</h3>
					<span className="academy-sub-title">
						{__(
							'Choose whether a course or a category must be completed first.',
							'academy'
						)}
					</span>
				</div>
				<div className="meta-field__body">
					<AcademySelect
						id="coursePreRequsiteSelect"
						suffix="prerequisite-type"
						name="coursePreRequsiteClass"
						options={prerequisiteOptions}
						value={prerequisiteOptions.find(
							(item) => item.value === prerequisiteType
						)}
						onChangeHandler={(option) => {
							setFieldValue(
								'meta.academy_prerequisite_type',
								option
							);
						}}
					/>
				</div>
			</div>

			{prerequisiteType === 'category' ? (
				<PostSelect
					name="meta.academy_prerequisite_categories"
					title={__('Course Categories', 'academy')}
					subtitle={__(
						'Students must complete these categories first.',
						'academy'
					)}
					placeholder={__('Search and select categories', 'academy')}
					action="academy/fetch_course_category"
					isMulti={true}
				/>
			) : (
				<PostSelect
					name="meta.academy_prerequisite_courses"
					title={__('Course Prerequisite', 'academy')}
					subtitle={__(
						'Students must complete these courses first.',
						'academy'
					)}
					placeholder={__('Search and select courses', 'academy')}
					postType="academy_courses"
					isMulti={true}
					suffix="course-post-select"
				/>
			)}
		</React.Fragment>
	);
}

CoursePrerequisite.propTypes = propTypes;
