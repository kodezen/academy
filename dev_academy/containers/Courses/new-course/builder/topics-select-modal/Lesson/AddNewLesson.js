import React, { useContext, useState } from 'react';

import Button from '@Components/Button';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import PropTypes from 'prop-types';
import TopicContext from '../../context/TopicContext';
import { __ } from '@wordpress/i18n';
import LessonModal from '@Containers/Lesson/LessonModal';
import { API, namespace, is_admin } from '@Utils/helper';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const propTypes = {
	viewFromCourseBuilder: PropTypes.bool,
	item: PropTypes.object,
	itemIndex: PropTypes.number,
	updateTopic: PropTypes.bool,
	isSubCurriculum: PropTypes.bool,
	hasIcon: PropTypes.bool,
};

const AddNewLesson = ({
	itemIndex,
	subCurriculumIndex,
	closeModal,
	isAddNewItem,
	viewFromCourseBuilder = true,
	item = {},
	updateTopic = false,
	isSubCurriculum = false,
	hasIcon = false,
}) => {
	const [isOpenLessonModal, setOpenLessonModal] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const { topicUpdateHandler, topics, subTopicUpdateHandler, moduleIndex } =
		useContext(TopicContext);
	const { dripContentType, isDripContentEnable } =
		useContext(CourseBuilderContext);
	const [formData, setFormData] = useState(false);
	const ID = item?.id ? item?.id : item.ID;
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();

	const subCurriculumTopics = isSubCurriculum && topics[itemIndex].topics;

	// Admin lessons open as a full-page route (no modal) — including nested
	// sub-curriculum lessons, which carry an extra `subtopic` index. Requires a
	// known module index.
	const useLessonRoute =
		is_admin && moduleIndex !== undefined && moduleIndex !== null;

	function goToLessonRoute() {
		const sp = new URLSearchParams(searchParams);
		sp.set('curriculum', 'lesson');
		// `moduleIndex` is the curriculum module index (topic). For a
		// sub-curriculum lesson, `itemIndex` is the sub-curriculum topic's index
		// within that module (`subtopic`); otherwise it's just the item's
		// position within the module.
		sp.set('topic', String(moduleIndex ?? itemIndex));
		if (isSubCurriculum) {
			sp.set('subtopic', String(itemIndex));
		} else {
			sp.delete('subtopic');
		}
		sp.set('step', 'builder');
		if (ID) {
			sp.set('item_id', String(ID));
		} else {
			sp.delete('item_id');
		}
		navigate(`?${sp.toString()}`);
	}

	function openLessonFormModal() {
		if (useLessonRoute) {
			goToLessonRoute();
			return;
		}
		// Close the "Add New Content" dropdown immediately — this modal portals
		// to its own node under <body>, so leaving that dropdown open behind it
		// is just confusing. Dropdown's `keepMounted` (set for this dropdown)
		// means closing it no longer unmounts this component or its modal.
		closeModal?.();
		if (ID) {
			setLoading(true);
			setOpenLessonModal(true);
			API.get(`${namespace}lessons/${parseInt(ID)}`, {
				params: {
					context: 'edit',
				},
			})
				.then((res) => {
					setFormData(res.data);
					setTimeout(() => {
						setLoading(false);
					}, 500);
				})
				.catch((error) => {
					setLoading(false);
					setOpenLessonModal(false);
					dispatch(
						showNotification({
							message:
								error?.response?.data?.data ||
								__(
									"Couldn't load this lesson. You may not have permission to edit it.",
									'academy'
								),
							isShow: true,
							type: 'error',
						})
					);
				});
		} else {
			setOpenLessonModal(true);
		}
	}
	function onRequestClose(param = null) {
		if (isSubCurriculum && param) {
			subTopicUpdateHandler(
				{
					id: param?.ID,
					name: param?.lesson_title,
					type: 'lesson',
				},
				itemIndex,
				subCurriculumIndex
			);
		} else if (!isSubCurriculum && param) {
			topicUpdateHandler(
				{
					id: param?.ID,
					name: param?.lesson_title,
					type: 'lesson',
				},
				itemIndex
			);
		}
		setFormData(false);
		setOpenLessonModal(false);
	}

	return (
		<>
			{item?.id || viewFromCourseBuilder ? (
				<Button
					onClick={() => openLessonFormModal()}
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
							onClick={() => openLessonFormModal()}
							icon={
								<span className="academy-icon academy-icon--lessons"></span>
							}
							label={__('Add Lesson', 'academy')}
						/>
					) : (
						<Button
							onClick={() => openLessonFormModal()}
							label={__('Create New Lesson', 'academy')}
						/>
					)}
				</>
			)}

			{isOpenLessonModal && (
				<LessonModal
					isOpenModal={isOpenLessonModal}
					onRequestClose={onRequestClose}
					formData={formData}
					dripContentType={dripContentType}
					isDripContentEnable={isDripContentEnable}
					topics={isSubCurriculum ? subCurriculumTopics : topics}
					currentItemId={item.id}
					setIsModalLoading={setLoading}
					isModalLoading={isLoading}
					updateTopic={updateTopic}
					topicUpdateHandler={topicUpdateHandler}
					itemIndex={itemIndex}
					isSubCurriculum={isSubCurriculum}
					subCurriculumIndex={subCurriculumIndex}
					subTopicUpdateHandler={subTopicUpdateHandler}
					closeModal={closeModal}
					isAddNewItem={isAddNewItem}
				/>
			)}
		</>
	);
};

AddNewLesson.propTypes = propTypes;
export default AddNewLesson;
