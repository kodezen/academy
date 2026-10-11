import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import Button from '@Components/Button';
import ListTable from '@Components/ListTable';
import { getQuizTypeLabel, sliceString } from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { updateQuizAttempt } from '@Redux/Slices/quizAttemptsSlice/quizAttemptsSlice';
import MathJaxLateX from '@Components/MathJaxLateX';

const ReadMoreLess = ({
	content = '',
	limit = 30,
	hideSeeMoreButton = false,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const toggleReadMore = () => setIsExpanded(!isExpanded);
	const parsedContent = content ?? '';

	if (hideSeeMoreButton) {
		return <MathJaxLateX text={parsedContent} />;
	}

	if (parsedContent.length <= limit) {
		return <span>{parsedContent}</span>;
	}

	return (
		<div>
			<MathJaxLateX
				text={isExpanded ? parsedContent : sliceString(parsedContent, limit)}
			/>
			<Button
				label={
					isExpanded
						? __('Read Less', 'academy')
						: __('Read More', 'academy')
				}
				preset="transparent"
				suffix="read-more-less"
				onClick={toggleReadMore}
			/>
		</div>
	);
};

const AnswersTable = (props) => {
	const { data, dataFetchingStatus, setAttemptData, updateAnswer } = props;
	const dispatch = useDispatch();
	// Only the clicked row/button shows as busy; the rest of the modal stays put.
	const [reviewing, setReviewing] = useState(null);
	const manualReviewHandler = (params) => {
		if (reviewing) {
			return;
		}
		setReviewing({ id: params.attempt_answer_id, markAs: params.mark_as });
		dispatch(updateQuizAttempt(params))
			.then((res) => {
				if (!res.payload || res.error) {
					throw new Error('review failed');
				}
				updateAnswer(params.attempt_answer_id, {
					is_correct: params.mark_as === 'correct' ? 1 : 0,
				});
				setAttemptData((prev) => ({ ...prev, ...res.payload }));
				dispatch(
					showNotification({
						message: __('Answer Reviewed', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
			})
			.catch(() => {
				dispatch(
					showNotification({
						message: __('Failed to review the answer.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
			})
			.finally(() => setReviewing(null));
	};

	const columns = [
		{
			name: __('Type', 'academy'),
			sortable: true,
			cell: (row) => <span>{getQuizTypeLabel(row.question_type)}</span>,
		},
		{
			name: __('Question', 'academy'),
			sortable: true,
			cell: (row) => (
				<ReadMoreLess
					content={row?.question_title}
					hideSeeMoreButton={
						Boolean(row?.academy_quiz_show_full_answer_content)
					}
				/>
			),
		},
		{
			name: __('Correct Answer', 'academy'),
			sortable: true,
			cell: (row) => (
				<div className="academy-quiz-table-answers-items flex flex-wrap items-center justify-center gap-x-[5px]">
					{Array.isArray(row?.correct_answer) ? (
						<>
							{row?.correct_answer.map(
								(correctAnswerItem, correctAnswerIndex) => (
									<div
										className="academy-quiz-table-answers-item [text-wrap:wrap]"
										key={correctAnswerIndex}
									>
										{correctAnswerItem?.image_url && (
											<img
												width="50"
												src={
													correctAnswerItem?.image_url
												}
												alt={__(
													'correct answer image',
													'academy'
												)}
											/>
										)}
										<ReadMoreLess
											content={
												correctAnswerItem?.answer_title
											}
											hideSeeMoreButton={Boolean(
												row?.academy_quiz_show_full_answer_content
											)}
										/>
									</div>
								)
							)}
						</>
					) : (
						<div className="academy-quiz-table-answers-item [text-wrap:wrap]">
							{row?.correct_answer?.id && (
								<img
									width="50"
									src={row?.correct_answer?.image_url}
									alt={__('correct answer image', 'academy')}
								/>
							)}
							<ReadMoreLess
								content={row?.correct_answer?.answer_title}
								hideSeeMoreButton={Boolean(
									row?.academy_quiz_show_full_answer_content
								)}
							/>
						</div>
					)}
				</div>
			),
		},
		{
			name: __('Given Answer', 'academy'),
			sortable: true,
			cell: (row) => (
				<div className="academy-quiz-table-answers-items flex flex-wrap items-center justify-center gap-x-[5px]">
					{row?.given_answer?.map((item, index) => (
						<div
							className="academy-quiz-table-answers-item [text-wrap:wrap]"
							key={index}
						>
							{item?.image_url && (
								<img
									width="50"
									src={item?.image_url}
									alt={__('correct answer image', 'academy')}
								/>
							)}
							<ReadMoreLess
								content={item?.answer_title}
								hideSeeMoreButton={Boolean(
									row?.academy_quiz_show_full_answer_content
								)}
							/>
						</div>
					))}
				</div>
			),
		},
		{
			name: __('Answer', 'academy'),
			sortable: true,
			cell: (row) => {
				return (
					<span
						className={`academy-${
							row.is_correct ? 'success' : 'failed'
						}`}
					>
						{row.is_correct
							? __('Correct', 'academy')
							: __('Incorrect', 'academy')}
					</span>
				);
			},
		},
		{
			name: __('Review', 'academy'),
			sortable: true,
			cell: (row) => {
				const rowBusy = reviewing?.id === row.attempt_answer_id;
				return (
					<div
						className="academy-quiz-attempt-modal__table-review"
						style={{ display: 'flex', gap: '10px' }}
					>
						<Button
							onClick={() =>
								manualReviewHandler({
									...row,
									mark_as: 'correct',
								})
							}
							icon={
								<span className="academy-icon academy-icon--correct"></span>
							}
							iconPosition="center"
							preset="light-purple"
							size="sm"
							suffix="correct"
							isLoading={rowBusy && reviewing.markAs === 'correct'}
							isDisabled={!!reviewing}
						/>
						<Button
							onClick={() =>
								manualReviewHandler({
									...row,
									mark_as: 'incorrect',
								})
							}
							icon={
								<span className="academy-icon academy-icon--close"></span>
							}
							iconPosition="center"
							suffix="incorrect"
							preset="light-red"
							size="sm"
							isLoading={rowBusy && reviewing.markAs === 'incorrect'}
							isDisabled={!!reviewing}
						/>
					</div>
				);
			},
		},
	];

	return (
		<ListTable
			columns={columns}
			noDataText={__(
				'Nothing to show yet.',
				'academy'
			)}
			data={data ? data : []}
			showSubHeader={false}
			suffix="quizzes-answer"
			dataFetchingStatus={dataFetchingStatus}
		/>
	);
};

export default AnswersTable;
