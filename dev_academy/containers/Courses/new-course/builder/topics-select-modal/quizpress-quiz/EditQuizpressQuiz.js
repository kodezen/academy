import React from 'react';
import Button from '@Components/Button';
import { admin_url } from '@Utils/helper';
import { __ } from '@wordpress/i18n';

// QuizPress owns editing — there's nothing to edit inside Academy, so this
// just links out to QuizPress's own admin editor for the linked quiz.
const EditQuizpressQuiz = ({ item = {} }) => {
	if (!item?.id) {
		return null;
	}

	return (
		<Button
			type="link"
			link={`${admin_url}admin.php?page=quizpress-quizzes&action=edit&id=${item.id}&path=name`}
			target="_blank"
			preset="transparent"
			size="xs"
			suffix="edit"
			ariaLabel={__('Edit in QuizPress', 'academy')}
			icon={<span className="academy-icon academy-icon--edit-two"></span>}
			iconPosition="center"
		/>
	);
};

export default EditQuizpressQuiz;
