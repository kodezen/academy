import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AddNewMeeting from './AddNewMeeting';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import Preloader from '@Components/Loader/Preloader';
import Search from '@Components/Search';
import TopicContext from './../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { fetchAllMeeting } from '@Redux/Slices/meetingSlice/meetingSlice';
import Pagination from '@Components/Pagination';
import { sliceString } from '@Utils/helper';

const MeetingItem = (props) => {
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
						type: 'meeting',
					},
				],
				type: 'sub-curriculum',
			});
		} else {
			existingTopicInsertHandler({
				id: item?.id,
				name: item?.title?.rendered,
				type: 'meeting',
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
			<AddNewMeeting
				item={item}
				viewFromCourseBuilder={true}
				closeModal={props.closeModal}
			/>
		</div>
	);
};

const Meeting = (props) => {
	const meetingItems = useSelector((state) => state.meetings);
	const { curriculum } = useContext(CourseBuilderContext);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [showPagination, setShowPagination] = useState(true);
	const isShowPagination = showPagination && meetingItems.data;
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
	const alreadySavedMeeting = allTopics.filter(
		(item) => item.type === 'meeting'
	);

	useEffect(() => {
		dispatch(fetchAllMeeting({ status: '', page: 1, per_page: 10 }));
	}, []);

	const searchHandler = (value = '') => {
		if (value !== '') {
			setShowPagination(false);
		} else {
			setShowPagination(true);
		}

		setLoading(true);
		dispatch(
			fetchAllMeeting({
				status: '',
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
		dispatch(fetchAllMeeting({ status: '', page: 1, per_page: 10 })).then(
			() => {
				setLoading(false);
			}
		);
	};

	return (
		<>
			<div className="academy-topics-search">
				<Search
					placeholder={__('Search Meeting', 'academy')}
					onSearchHandler={searchHandler}
				/>
				<AddNewMeeting
					viewFromCourseBuilder={false}
					closeModal={props.closeModal}
				/>
			</div>
			{loading || !meetingItems.data ? (
				<div className="academy-info">
					<Preloader size="md" />
				</div>
			) : (
				<div className="academy-items">
					{meetingItems.data.length > 0 ? (
						<>
							{meetingItems.data.map((item, index) => (
								<MeetingItem
									key={index}
									itemIndex={index}
									item={item}
									isChecked={alreadySavedMeeting.some(
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
								title={__('No meeting Found!', 'academy')}
							/>
						</div>
					)}
				</div>
			)}
			{isShowPagination && (
				<Pagination
					fetchHandler={paginationFetchHandler}
					totalItems={meetingItems.totalItems}
				/>
			)}
		</>
	);
};

export default Meeting;
