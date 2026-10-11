import React, { useEffect, useState } from 'react';

import AnswerDetailsTable from './answers-table';
import AttemptTable from './attempt-table';
import InstructorFeedback from './instructor-feedback';
import PropTypes from 'prop-types';
import ReactModal from '@Components/Modal/ReactModal';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';

import './styles.scss';
import './quiz-attempt.scss';
import './quiz-attempt-modal.scss';
import Preloader from '@Components/Loader/Preloader';
import { getQuizAttemptAnswers } from '@Redux/Slices/quizAttemptsSlice/quizAttemptsSlice';

const propTypes = {
	attempt: PropTypes.object,
};

export default function AttemptModal({
	attempt = {},
	attemptModal,
	closeModal,
}) {
	const [dataFetchingStatus, setDataFetchingStatus] = useState(false);
	const [attemptAnswers, setAttemptAnswers] = useState([{}]);
	const [attemptData, setAttemptData] = useState(attempt);
	const attempt_info =
		attempt.attempt_info !== '' && typeof attempt?.attempt_info !== 'object'
			? JSON.parse(attempt?.attempt_info)
			: attempt?.attempt_info;
	const dispatch = useDispatch();

	useEffect(() => {
		setDataFetchingStatus(true);
		dispatch(
			getQuizAttemptAnswers({
				ID: attempt.attempt_id,
				courseId: attempt.course_id,
				userId: attempt.user_id,
			})
		).then((response) => {
			setAttemptAnswers(response.payload);
			setDataFetchingStatus(false);
		});
	}, [attempt]);

	// A review changes one answer row and the attempt totals, so patch just
	// those in place instead of refetching (which reloads the whole modal).
	const updateAnswer = (answerId, changes) =>
		setAttemptAnswers((answers) =>
			Array.isArray(answers)
				? answers.map((item) =>
					item.attempt_answer_id === answerId
						? { ...item, ...changes }
						: item
				)
				: answers
		);

	return (
		<>
			<ReactModal
				isOpen={attemptModal !== false}
				onRequestClose={closeModal}
				isSmallAvailable={false}
				title={__('Attempt Results', 'academy')}
				suffix="quiz-attempt-details"
				size="medium"
			>
				{dataFetchingStatus ? (
					<Preloader />
				) : (
					<>
						<div className="academy-quiz-attempt-details">
							<h3 className="academy-quiz-attempt-entry-title text-base leading-[19px] text-academy-text-black mb-5">
								{__('Attempt Details', 'academy')}
							</h3>
							<AttemptTable
								data={[{ ...attemptData }]}
								dataFetchingStatus={dataFetchingStatus}
							/>
						</div>
						<div className="academy-quiz-attempt-details">
							<h3 className="academy-quiz-attempt-entry-title text-base leading-[19px] text-academy-text-black mb-5">
								{__('Attempt Answers Details', 'academy')}
							</h3>
							<AnswerDetailsTable
								setAttemptData={setAttemptData}
								updateAnswer={updateAnswer}
								data={attemptAnswers}
								progressPending={dataFetchingStatus}
								dataFetchingStatus={dataFetchingStatus}
							/>
						</div>
						<div className="academy-quiz-attempt-feedback">
							<h3 className="academy-quiz-attempt-entry-title text-base leading-[19px] text-academy-text-black mb-5">
								{__('Instructor Feedback', 'academy')}
							</h3>
							<InstructorFeedback
								attemptId={attemptData.attempt_id}
								name={'instructor_feedback'}
								value={attempt_info?.instructor_feedback}
							/>
						</div>
					</>
				)}
			</ReactModal>
		</>
	);
}

AttemptModal.propTypes = propTypes;
