import AddNewBooking from './topics-select-modal/Booking/AddNewBooking';
import AddNewAssignment from './topics-select-modal/assignments/AddNewAssignment';
import AddNewLesson from './topics-select-modal/Lesson/AddNewLesson';
import AddNewQuiz from './topics-select-modal/quiz/AddNewQuiz';
import AddNewMeeting from './topics-select-modal/Meeting/AddNewMeeting';
import EditQuizpressQuiz from './topics-select-modal/quizpress-quiz/EditQuizpressQuiz';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
	item: PropTypes.object,
	itemIndex: PropTypes.number,
};

export default function EditTopic({
	item = {},
	itemIndex,
	subCurriculumIndex,
	isSubCurriculum,
}) {
	const handleItemType = (type) => {
		switch (type) {
			case 'booking':
				return (
					<AddNewBooking
						item={item}
						itemIndex={itemIndex}
						subCurriculumIndex={subCurriculumIndex}
						isSubCurriculum={isSubCurriculum}
					/>
				);
			case 'assignment':
				return (
					<AddNewAssignment
						item={item}
						itemIndex={itemIndex}
						subCurriculumIndex={subCurriculumIndex}
						isSubCurriculum={isSubCurriculum}
					/>
				);
			case 'meeting':
				return (
					<AddNewMeeting
						item={item}
						itemIndex={itemIndex}
						subCurriculumIndex={subCurriculumIndex}
						isSubCurriculum={isSubCurriculum}
					/>
				);
			case 'quiz':
				return (
					<AddNewQuiz
						item={item}
						itemIndex={itemIndex}
						subCurriculumIndex={subCurriculumIndex}
						isSubCurriculum={isSubCurriculum}
					/>
				);
			case 'lesson':
				return (
					<AddNewLesson
						item={item}
						itemIndex={itemIndex}
						subCurriculumIndex={subCurriculumIndex}
						isSubCurriculum={isSubCurriculum}
					/>
				);
			case 'quizpress_quiz':
				return <EditQuizpressQuiz item={item} />;
		}
	};
	return <React.Fragment>{handleItemType(item.type)}</React.Fragment>;
}

EditTopic.propTypes = propTypes;
