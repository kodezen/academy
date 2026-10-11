import React, { useContext, useState } from 'react';

import Button from '@Components/Button';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import PropTypes from 'prop-types';
import TopicContext from '../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { API, namespace, is_admin } from '@Utils/helper';
import { applyFilters } from '@wordpress/hooks';
import { useNavigate, useSearchParams } from 'react-router-dom';

const propTypes = {
	viewFromCourseBuilder: PropTypes.bool,
	hasIcon: PropTypes.bool,
	item: PropTypes.object,
	itemIndex: PropTypes.number,
};

const AddNewBooking = ({
	itemIndex,
	updateTopic,
	isSubCurriculum,
	subCurriculumIndex,
	closeModal,
	isAddNewItem,
	hasIcon = false,
	viewFromCourseBuilder = true,
	item = {},
}) => {
	const [isOpenBookingModal, setOpenBookingModal] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const { topicUpdateHandler, topics, subTopicUpdateHandler, moduleIndex } =
		useContext(TopicContext);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { dripContentType, isDripContentEnable } =
		useContext(CourseBuilderContext);
	const [formData, setFormData] = useState(false);

	const subCurriculumTopics = isSubCurriculum && topics[itemIndex].topics;

	const useBookingRoute =
		is_admin && moduleIndex !== undefined && moduleIndex !== null;

	function openBookingFormModal(param = null) {
		if (useBookingRoute) {
			const sp = new URLSearchParams(searchParams);
			sp.set('curriculum', 'booking');
			sp.set('topic', String(moduleIndex ?? itemIndex));
			if (isSubCurriculum) {
				sp.set('subtopic', String(itemIndex));
			} else {
				sp.delete('subtopic');
			}
			sp.set('step', 'builder');
			if (item?.id) {
				sp.set('item_id', String(item.id));
			} else {
				sp.delete('item_id');
			}
			navigate(`?${sp.toString()}`);
			return;
		}
		// Close the "Add New Content" dropdown immediately — see AddNewLesson's
		// openLessonFormModal() for why this is now safe (Dropdown keepMounted).
		closeModal?.();
		setOpenBookingModal(true);
		if (viewFromCourseBuilder) {
			setLoading(true);
			API.get(`${namespace}academy_booking/${parseInt(item.id)}`, {
				params: {
					context: 'edit',
				},
			}).then((res) => {
				setFormData(res.data);
				setTimeout(() => {
					setLoading(false);
				}, 500);
			});
		} else {
			setFormData(param);
		}
	}
	function onRequestClose(param = null) {
		if (isSubCurriculum && param) {
			subTopicUpdateHandler(
				{
					id: param.id,
					name: param?.title?.rendered,
					type: 'booking',
				},
				itemIndex,
				subCurriculumIndex
			);
		} else if (topicUpdateHandler && param) {
			topicUpdateHandler(
				{
					id: param.id,
					name: param?.title?.rendered,
					type: 'booking',
				},
				itemIndex
			);
		}

		setFormData(false);
		setOpenBookingModal(false);
	}

	return (
		<>
			{item?.id || viewFromCourseBuilder ? (
				<Button
					onClick={() => openBookingFormModal(item)}
					preset="transparent"
					size="xs"
					suffix="edit"
					icon={
						<span className="academy-icon academy-icon--edit-two"></span>
					}
					iconPosition="center"
				/>
			) : (
				<>
					{hasIcon ? (
						<>
							<Button
								onClick={() => openBookingFormModal()}
								icon={
									<span className="academy-icon academy-icon--tutor-booking-fill"></span>
								}
								label={__('Add Tutor Booking', 'academy')}
							/>
						</>
					) : (
						<Button
							onClick={() => openBookingFormModal()}
							label={__('Create New Tutor Booking', 'academy')}
						/>
					)}
				</>
			)}

			{isOpenBookingModal &&
				applyFilters('academy.booking-modal.modal', null, {
					isOpen: isOpenBookingModal,
					onRequestClose,
					formData,
					dripContentType,
					isDripContentEnable,
					topics: isSubCurriculum ? subCurriculumTopics : topics,
					currentItemId: item.id,
					setIsModalLoading: setLoading,
					isModalLoading: isLoading,
					updateTopic,
					topicUpdateHandler,
					itemIndex,
					isSubCurriculum,
					subCurriculumIndex,
					subTopicUpdateHandler,
					closeModal,
					isAddNewItem,
				})}
		</>
	);
};

AddNewBooking.propTypes = propTypes;
export default AddNewBooking;
