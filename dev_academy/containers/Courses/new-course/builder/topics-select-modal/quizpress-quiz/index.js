import React, { useContext, useEffect, useState } from 'react';
import Pagination from '@Components/Pagination';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import Preloader from '@Components/Loader/Preloader';
import Search from '@Components/Search';
import TopicContext from './../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { API, sliceString } from '@Utils/helper';

// QuizPress owns quiz content end to end — there's no "create new" flow here,
// only browsing and selecting an existing QuizPress quiz, fetched straight
// from QuizPress's own REST route (quizpress/v1/quizpress_quiz) rather than
// through any Academy quiz endpoint.
const QuizPressQuizItem = (props) => {
	const { item, isChecked } = props;
	const {
		deleteLessonHandler,
		existingTopicInsertHandler,
		existingSubTopicInsertHandler,
	} = useContext(TopicContext);
	const { curriculum, openIndex } = useContext(CourseBuilderContext);
	const existInParent = curriculum[openIndex].topics.find(
		(topic) =>
			parseInt(topic?.id) === parseInt(item?.id) &&
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
						type: 'quizpress_quiz',
					},
				],
				type: 'sub-curriculum',
			});
		} else {
			existingTopicInsertHandler({
				id: item?.id,
				name: item?.title?.rendered,
				type: 'quizpress_quiz',
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
		</div>
	);
};

const QuizPressQuiz = (props) => {
	const [items, setItems] = useState([]);
	const [totalItems, setTotalItems] = useState(0);
	const { curriculum } = useContext(CourseBuilderContext);
	const [loading, setLoading] = useState(false);
	const [showPagination, setShowPagination] = useState(true);
	const isShowPagination = showPagination && items;
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
	const alreadySavedQuiz = allTopics.filter(
		(item) => item.type === 'quizpress_quiz'
	);

	const fetchQuizPressQuizzes = ({ page = 1, per_page = 10, search = '' }) => {
		setLoading(true);
		return API.get('quizpress/v1/quizpress_quiz', {
			params: { status: 'publish', page, per_page, search },
		})
			.then((res) => {
				setItems(res.data || []);
				setTotalItems(
					parseInt(res.headers?.['x-wp-total'] ?? '0', 10)
				);
			})
			.catch(() => {
				setItems([]);
				setTotalItems(0);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchQuizPressQuizzes({ page: 1, per_page: 10 });
	}, []);

	const searchHandler = (value) => {
		setShowPagination(value === '');
		fetchQuizPressQuizzes({ page: 1, per_page: 10, search: value });
	};

	const paginationFetchHandler = (page) => {
		fetchQuizPressQuizzes({ page, per_page: 10 });
	};

	return (
		<>
			<div className="academy-topics-search">
				<Search
					placeholder={__('Search QuizPress Quiz', 'academy')}
					onSearchHandler={searchHandler}
				/>
			</div>
			{loading ? (
				<div className="academy-info">
					<Preloader size="md" />
				</div>
			) : (
				<div className="academy-items">
					{items.length > 0 ? (
						<>
							{items.map((item, index) => (
								<QuizPressQuizItem
									key={index}
									item={item}
									isChecked={alreadySavedQuiz.some(
										(savedItem) =>
											parseInt(savedItem.id) ===
											parseInt(item.id)
									)}
									isSubCurriculum={props.isSubCurriculum}
									subCurriculumIndex={
										props.subCurriculumIndex
									}
									subItemRemoveHandler={
										props.subItemRemoveHandler
									}
								/>
							))}
						</>
					) : (
						<div className="academy-info">
							<CustomTableMessage
								title={__(
									'No QuizPress Quiz Found!',
									'academy'
								)}
							/>
						</div>
					)}
				</div>
			)}
			{isShowPagination && (
				<Pagination
					fetchHandler={paginationFetchHandler}
					totalItems={totalItems}
				/>
			)}
		</>
	);
};

export default QuizPressQuiz;
