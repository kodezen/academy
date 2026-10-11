import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '@Components/Pagination';

import AddNewQuiz from './AddNewQuiz';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import Preloader from '@Components/Loader/Preloader';
import Search from '@Components/Search';
import TopicContext from './../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { fetchQuizzes } from '@Redux/Slices/quizSlice/quizSlice';
import { sliceString } from '@Utils/helper';

const QuizItem = (props) => {
	const { item, isChecked } = props;
	const {
		deleteLessonHandler,
		existingTopicInsertHandler,
		existingSubTopicInsertHandler,
	} = useContext(TopicContext);
	const { curriculum, openIndex } = useContext(CourseBuilderContext);
	const existInParent = curriculum[openIndex].topics.find(
		(topic) =>
			(parseInt(topic?.id) === parseInt(item?.id) ||
				parseInt(topic?.id) === parseInt(item?.ID)) &&
			topic.type !== 'sub-curriculum'
	);

	const onChangeHandler = (isRemove) => {
		if (isRemove) {
			if (props.isSubCurriculum) {
				props.subItemRemoveHandler(item);
			} else if (existInParent) {
				deleteLessonHandler(item);
			}
		} else if (props.isSubCurriculum) {
			existingSubTopicInsertHandler({
				id: props.subCurriculumIndex,
				topics: [
					{
						id: item?.id,
						name: item?.title?.rendered,
						type: 'quiz',
					},
				],
				type: 'sub-curriculum',
			});
		} else {
			existingTopicInsertHandler({
				id: item?.id,
				name: item?.title?.rendered,
				type: 'quiz',
			});
		}
	};

	return (
		<div className="academy-item">
			<label className="academy-item__checkbox">
				<input
					type="checkbox"
					checked={isChecked}
					onChange={() => onChangeHandler(isChecked)}
					className='!m-0'
				/>
				<span>{sliceString(item?.title?.rendered, 80, '...')}</span>
			</label>
			<AddNewQuiz
				item={item}
				viewFromCourseBuilder={true}
				closeModal={props.closeModal}
			/>
		</div>
	);
};

const Quiz = (props) => {
	const quizItems = useSelector((state) => state.quizzes);
	const dispatch = useDispatch();
	const { curriculum } = useContext(CourseBuilderContext);
	const [loading, setLoading] = useState(false);
	const [showPagination, setShowPagination] = useState(true);
	const isShowPagination = showPagination && quizItems.data;
	const allTopics = curriculum?.reduce((acc, current) => {
		current.topics.forEach((item) => {
			if (item.type === 'sub-curriculum') {
				acc.unshift(...item.topics);
			} else {
				acc.unshift(item);
			}
		});
		return acc;
	}, []);
	const alreadySavedQuiz = allTopics.filter((item) => item.type === 'quiz');

	useEffect(() => {
		dispatch(fetchQuizzes({ status: 'publish', page: 1, per_page: 10 }));
	}, []);

	const searchHandler = (value) => {
		if (value !== '') {
			setShowPagination(false);
		} else {
			setShowPagination(true);
		}

		setLoading(true);
		dispatch(
			fetchQuizzes({
				status: 'publish',
				page: 1,
				per_page: 10,
				search: value,
			})
		).then(() => {
			setLoading(false);
		});
	};
	const paginationFetchHandler = (page) => {
		setLoading(true);
		dispatch(fetchQuizzes({ status: 'publish', page, per_page: 10 })).then(
			() => {
				setLoading(false);
			}
		);
	};

	return (
		<>
			<div className="academy-topics-search">
				<Search
					placeholder={__('Search Quiz', 'academy')}
					onSearchHandler={searchHandler}
				/>
				<AddNewQuiz
					viewFromCourseBuilder={false}
					closeModal={props.closeModal}
				/>
			</div>
			{loading || !quizItems.data ? (
				<div className="academy-info">
					<Preloader size="md" />
				</div>
			) : (
				<div className="academy-items">
					{quizItems.data.length > 0 ? (
						<>
							{quizItems.data.map((item, index) => (
								<QuizItem
									key={index}
									itemIndex={index}
									item={item}
									isChecked={alreadySavedQuiz.some(
										(savedItem) =>
											parseInt(savedItem.id) ===
											parseInt(item.id)
									)}
									toggleLessonHandler={
										props.toggleLessonHandler
									}
									isSubCurriculum={props.isSubCurriculum}
									subCurriculumIndex={
										props.subCurriculumIndex
									}
									subItemRemoveHandler={
										props.subItemRemoveHandler
									}
									closeModal={props.closeModal}
								/>
							))}
						</>
					) : (
						<div className="academy-info">
							<CustomTableMessage
								title={__('No Quiz Found!', 'academy')}
							/>
						</div>
					)}
				</div>
			)}
			{isShowPagination && (
				<Pagination
					fetchHandler={paginationFetchHandler}
					totalItems={quizItems.totalItems}
				/>
			)}
		</>
	);
};

export default Quiz;
