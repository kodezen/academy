import React, { useContext, useState } from 'react';
import { applyFilters } from '@wordpress/hooks';
import Button from '@Components/Button';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import PropTypes from 'prop-types';
import TopicContext from '../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import { API, namespace, is_admin } from '@Utils/helper';
import { useNavigate, useSearchParams } from 'react-router-dom';

const propTypes = {
	viewFromCourseBuilder: PropTypes.bool,
	hasIcon: PropTypes.bool,
	item: PropTypes.object,
	itemIndex: PropTypes.number,
};

const AddNewAssignment = ({
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
	const [formData, setFormData] = useState(false);
	const [isOpenAssignmentModal, setOpenAssignmentModal] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const { topicUpdateHandler, topics, subTopicUpdateHandler, moduleIndex } =
		useContext(TopicContext);
	const { dripContentType, isDripContentEnable } =
		useContext(CourseBuilderContext);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const subCurriculumTopics = isSubCurriculum && topics[itemIndex].topics;

	// Admin assignments open as a full-page route (no modal) — including nested
	// sub-curriculum assignments, which carry an extra `subtopic` index.
	const useAssignmentRoute =
		is_admin && moduleIndex !== undefined && moduleIndex !== null;

	function goToAssignmentRoute() {
		const sp = new URLSearchParams(searchParams);
		sp.set('curriculum', 'assignment');
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
	}

	const onRequestClose = (param = null) => {
		if (isSubCurriculum && param) {
			subTopicUpdateHandler(
				{
					id: param.id,
					name: param.title.rendered,
					type: 'assignment',
				},
				itemIndex,
				subCurriculumIndex
			);
		} else if (topicUpdateHandler && param) {
			topicUpdateHandler(
				{
					id: param.id,
					name: param.title.rendered,
					type: 'assignment',
				},
				itemIndex
			);
		}

		setFormData(false);
		setOpenAssignmentModal(false);
	};
	const openAssignmentModal = (param = null) => {
		if (useAssignmentRoute) {
			goToAssignmentRoute();
			return;
		}
		// Close the "Add New Content" dropdown immediately — see AddNewLesson's
		// openLessonFormModal() for why this is now safe (Dropdown keepMounted).
		closeModal?.();
		setOpenAssignmentModal(true);
		if (viewFromCourseBuilder) {
			setLoading(true);
			API.get(`${namespace}academy_assignments/${parseInt(item.id)}`, {
				params: {
					context: 'edit',
				},
			}).then((res) => {
				setFormData(res.data);
				// 200 ms delay so that Dom can update as per content
				setTimeout(() => {
					setLoading(false);
				}, 200);
			});
		} else {
			setFormData(param);
		}
	};
	return (
		<div>
			{item?.id || viewFromCourseBuilder ? (
				<Button
					onClick={() => openAssignmentModal(item)}
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
						<Button
							onClick={() => openAssignmentModal()}
							icon={
								<span className="academy-icon academy-icon--assignment-two"></span>
							}
							label={__('New Assignment', 'academy')}
						/>
					) : (
						<Button
							onClick={() => openAssignmentModal()}
							label={__('Create New Assignment', 'academy')}
						/>
					)}
				</>
			)}

			{isOpenAssignmentModal &&
				applyFilters('academy.assignment-modal.modal', null, {
					isOpenModal: isOpenAssignmentModal,
					onRequestClose,
					formData,
					isLoading,
					updateTopic,
					topicUpdateHandler,
					itemIndex,
					dripContentType,
					isDripContentEnable,
					topics: isSubCurriculum ? subCurriculumTopics : topics,
					currentItemId: item.id,
					isSubCurriculum,
					subCurriculumIndex,
					subTopicUpdateHandler,
					closeModal,
					isAddNewItem,
				})}
		</div>
	);
};
AddNewAssignment.propTypes = propTypes;
export default AddNewAssignment;
