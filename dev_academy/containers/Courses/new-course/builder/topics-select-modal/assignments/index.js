import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AddNewAssignment from './AddNewAssignment';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import Preloader from '@Components/Loader/Preloader';
import Search from '@Components/Search';
import TopicContext from '../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { fetchAllAssignments } from '@Redux/Slices/assignmentSlice/assignmentSlice';
import Pagination from '@Components/Pagination';
import { sliceString } from '@Utils/helper';

const AssignmentItem = (props) => {
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
						id: item.id,
						name: item?.title?.rendered,
						type: 'assignment',
					},
				],
				type: 'sub-curriculum',
			});
		} else {
			existingTopicInsertHandler({
				id: item.id,
				name: item?.title?.rendered,
				type: 'assignment',
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
			<AddNewAssignment
				item={item}
				viewFromCourseBuilder={true}
				closeModal={props.closeModal}
			/>
		</div>
	);
};

const Assignment = ({
	isSubCurriculum,
	subCurriculumIndex,
	subItemRemoveHandler,
	closeModal,
}) => {
	const assignmentItems = useSelector((state) => state.assignment);
	const { curriculum } = useContext(CourseBuilderContext);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showPagination, setShowPagination] = useState(true);
	const isShowPagination = showPagination && assignmentItems?.data;
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
		(item) => item.type === 'assignment'
	);

	useEffect(() => {
		dispatch(
			fetchAllAssignments({ status: 'publish', page: 1, per_page: 10 })
		);
	}, []);

	const searchHandler = (value) => {
		if (value !== '') {
			setShowPagination(false);
		} else {
			setShowPagination(true);
		}

		setLoading(true);
		dispatch(
			fetchAllAssignments({
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
			fetchAllAssignments({ status: 'publish', page, per_page: 10 })
		).then(() => {
			setLoading(false);
		});
	};
	return (
		<>
			<div className="academy-topics-search">
				<Search
					placeholder={__('Search Assignments', 'academy')}
					onSearchHandler={searchHandler}
				/>
				<AddNewAssignment
					viewFromCourseBuilder={false}
					hasIcon={false}
					closeModal={closeModal}
				/>
			</div>
			{loading || !assignmentItems?.data ? (
				<div className="academy-info">
					<Preloader />
				</div>
			) : (
				<div className="academy-items">
					{assignmentItems?.data?.length > 0 ? (
						<>
							{assignmentItems?.data?.map((item, index) => (
								<AssignmentItem
									key={index}
									item={item}
									isChecked={alreadySavedLesson.some(
										(savedItem) =>
											parseInt(savedItem.id) ===
											parseInt(item.id)
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
								title={__('No Assignments found', 'academy')}
							/>
						</div>
					)}
				</div>
			)}
			{isShowPagination && (
				<Pagination
					fetchHandler={paginationFetchHandler}
					totalItems={assignmentItems.totalItems}
				/>
			)}
		</>
	);
};

export default Assignment;
