import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CourseBuilderContext from '../../context/CourseBuilderContext';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import Preloader from '@Components/Loader/Preloader';
import Search from '@Components/Search';
import TopicContext from '../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { fetchAllBookings } from '@Redux/Slices/bookingSlice/bookingSlice';
import AddNewBooking from './AddNewBooking';
import Pagination from '@Components/Pagination';
import { sliceString } from '@Utils/helper';

const BookingItem = (props) => {
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
						type: 'booking',
					},
				],
				type: 'sub-curriculum',
			});
		} else {
			existingTopicInsertHandler({
				id: item?.id,
				name: item?.title?.rendered,
				type: 'booking',
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
			<AddNewBooking
				item={item}
				viewFromCourseBuilder={true}
				isModalLoading={false}
				closeModal={props.closeModal}
			/>
		</div>
	);
};

const Booking = ({
	isSubCurriculum,
	subCurriculumIndex,
	subItemRemoveHandler,
	closeModal,
}) => {
	const bookingItems = useSelector((state) => state.bookings);
	const dispatch = useDispatch();
	const { curriculum } = useContext(CourseBuilderContext);
	const [loading, setLoading] = useState(false);
	const [showPagination, setShowPagination] = useState(true);
	const isShowPagination = showPagination && bookingItems.data;
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
	const alreadySavedBooking = allTopics.filter(
		(item) => item.type === 'booking'
	);

	useEffect(() => {
		dispatch(
			fetchAllBookings({
				status: 'publish',
				page: 1,
				per_page: 10,
				search: '',
			})
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
			fetchAllBookings({
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
			fetchAllBookings({
				status: 'publish',
				page,
				per_page: 10,
				search: value,
			})
		).then(() => {
			setLoading(false);
		});
	};

	return (
		<>
			<div className="academy-topics-search">
				<Search
					placeholder={__('Search Booking', 'academy')}
					onSearchHandler={searchHandler}
				/>
				<AddNewBooking
					viewFromCourseBuilder={false}
					closeModal={closeModal}
				/>
			</div>

			{loading || !bookingItems.data ? (
				<div className="academy-info">
					<Preloader />
				</div>
			) : (
				<div className="academy-items">
					{bookingItems.data?.length > 0 ? (
						<>
							{bookingItems.data?.map((item, index) => (
								<BookingItem
									key={index}
									item={item}
									isChecked={alreadySavedBooking.some(
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
								title={__('No Bookings found', 'academy')}
							/>
						</div>
					)}
				</div>
			)}
			{isShowPagination && (
				<Pagination
					fetchHandler={paginationFetchHandler}
					totalItems={bookingItems.totalItems}
				/>
			)}
		</>
	);
};

export default Booking;
