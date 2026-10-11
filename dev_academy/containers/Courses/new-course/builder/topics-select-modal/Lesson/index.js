import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AddNewLesson from './AddNewLesson';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import Preloader from '@Components/Loader/Preloader';
import Search from '@Components/Search';
import TopicContext from '../../context/TopicContext';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import { __ } from '@wordpress/i18n';
import { fetchAllLessons } from '@Redux/Slices/lessonSlice/lessonSlice';
import Pagination from '@Components/Pagination';
import { sliceString } from '@Utils/helper';

const LessonItem = (props) => {
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
						id: item.ID,
						name: item.lesson_title,
						type: 'lesson',
					},
				],
				type: 'sub-curriculum',
			});
		} else {
			existingTopicInsertHandler({
				id: item.ID,
				name: item.lesson_title,
				type: 'lesson',
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
				<span>{sliceString(item.lesson_title, 80, '...')}</span>
			</label>
			<AddNewLesson
				item={item}
				viewFromCourseBuilder={true}
				isModalLoading={false}
				closeModal={props.closeModal}
			/>
		</div>
	);
};

const Lesson = ({
	isSubCurriculum,
	subCurriculumIndex,
	subItemRemoveHandler,
	closeModal,
}) => {
	const lessonItems = useSelector((state) => state.lessons);
	const dispatch = useDispatch();
	const { curriculum } = useContext(CourseBuilderContext);
	const [loading, setLoading] = useState(false);
	const [showPagination, setShowPagination] = useState(true);
	const isShowPagination = showPagination && lessonItems.data;
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
	const alreadySavedLesson = allTopics.filter(
		(item) => item.type === 'lesson'
	);

	useEffect(() => {
		dispatch(fetchAllLessons({ status: 'publish', page: 1, per_page: 10 }));
	}, []);

	const searchHandler = (value) => {
		if (value !== '') {
			setShowPagination(false);
		} else {
			setShowPagination(true);
		}

		setLoading(true);
		dispatch(
			fetchAllLessons({
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
		dispatch(
			fetchAllLessons({ status: 'publish', page, per_page: 10 })
		).then(() => {
			setLoading(false);
		});
	};

	return (
		<>
			<div className="academy-topics-search">
				<Search
					placeholder={__('Search Lesson', 'academy')}
					onSearchHandler={searchHandler}
				/>
				<AddNewLesson
					viewFromCourseBuilder={false}
					closeModal={closeModal}
				/>
			</div>

			{loading || !lessonItems.data ? (
				<div className="academy-info">
					<Preloader />
				</div>
			) : (
				<div className="academy-items">
					{lessonItems.data?.length > 0 ? (
						<>
							{lessonItems.data?.map((item, index) => (
								<LessonItem
									key={index}
									item={item}
									isChecked={alreadySavedLesson.some(
										(savedItem) =>
											parseInt(savedItem.id) ===
											parseInt(item.ID)
									)}
									isSubCurriculum={isSubCurriculum}
									subCurriculumIndex={subCurriculumIndex}
									subItemRemoveHandler={subItemRemoveHandler}
									closeModal={closeModal}
								/>
							))}
						</>
					) : (
						<div className="academy-info">
							<CustomTableMessage
								title={__('No Lessons found', 'academy')}
							/>
						</div>
					)}
				</div>
			)}
			{isShowPagination && (
				<Pagination
					fetchHandler={paginationFetchHandler}
					totalItems={lessonItems.totalItems}
				/>
			)}
		</>
	);
};

export default Lesson;
