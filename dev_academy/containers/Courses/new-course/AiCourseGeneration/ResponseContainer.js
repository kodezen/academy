import React from 'react';
import { __ } from '@wordpress/i18n';
import AcademySeparator from '@Components/AcademySeparator';
import CourseContent from './CourseContent';

const ResponseContainer = ({ data = {}, setCourse = false }) => {
	return (
		<div className="academy-course-generate--container academy-column-items academy-separator-wrap">
			<div className="academy-course-generate-container__title academy-column-items academy-mb-6">
				<h3>{__('Course Title', 'academy')}</h3>
				<AcademySeparator />
				<span>{data?.courseTitle}</span>
			</div>
			<div className="academy-course-generate-container__info academy-column-items academy-mb-6 academy-separator-wrap">
				<h3>{__('Course Info', 'academy')}</h3>
				<AcademySeparator />
				<span>{data?.courseDescription}</span>
			</div>
			<div className="academy-course-generate-container__audiance academy-column-items academy-mb-6 academy-separator-wrap">
				<h3>{__('Target Audience', 'academy')}</h3>
				<AcademySeparator />
				<span>{data?.targeted_audience}</span>
			</div>
			<CourseContent data={data} setCourse={setCourse} />
		</div>
	);
};

export default ResponseContainer;
