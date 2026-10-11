import React from 'react';
import PostSelect from '@Components/PostSelect';
import { __ } from '@wordpress/i18n';

const CourseAuthor = () => {
	return (
		<div className="academy-postbox__body">
			<PostSelect
				name="author"
				action="academy/get_approved_instructors_for_select"
				placeholder={__('Search and select Author', 'academy')}
				isMulti={false}
				// A course must always have exactly one instructor — no clear
				// button, so the field can never be emptied to "no author".
				isClearable={false}
			/>
		</div>
	);
};

export default CourseAuthor;
