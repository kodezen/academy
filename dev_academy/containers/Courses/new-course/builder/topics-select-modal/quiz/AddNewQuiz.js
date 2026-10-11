import { API, namespace, is_admin } from '@Utils/helper';
import React, { useContext, useState } from 'react';

import Button from '@Components/Button';
import CourseBuilderContext from '../../context/CourseBuilderContext';
import PropTypes from 'prop-types';
import QuizFormModal from '@Containers/Quizzes/QuizFormModal';
import TopicContext from './../../context/TopicContext';
import { __ } from '@wordpress/i18n';
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

const AddNewQuiz = ({
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
	const { topicUpdateHandler, topics, subTopicUpdateHandler, moduleIndex } =
		useContext(TopicContext);
	const { dripContentType, isDripContentEnable } =
		useContext(CourseBuilderContext);
	const [formData, setFormData] = useState(false);
	const [isOpenQuizForm, setOpenQuizForm] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();

	const subCurriculumTopics = isSubCurriculum && topics[itemIndex].topics;

	// Admin quizzes open as a full-page route (no modal) — including nested
	// sub-curriculum quizzes, which carry an extra `subtopic` index.
	const useQuizRoute =
		is_admin && moduleIndex !== undefined && moduleIndex !== null;

	function goToQuizRoute() {
		const sp = new URLSearchParams(searchParams);
		sp.set('curriculum', 'quiz');
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

	function openQuizFormModal() {
		if (useQuizRoute) {
			goToQuizRoute();
			return;
		}
		// Close the "Add New Content" dropdown immediately — see AddNewLesson's
		// openLessonFormModal() for why this is now safe (Dropdown keepMounted).
		closeModal?.();
		if (item?.id) {
			setLoading(true);
			setOpenQuizForm(true);
			API.get(namespace + 'academy_quiz/' + item.id, {
				params: {
					context: 'edit',
				},
			})
				.then((res) => {
					setFormData(res.data);
					if (!updateTopic) {
						setLoading(false);
					}
				})
				.catch((error) => {
					setLoading(false);
					setOpenQuizForm(false);
					dispatch(
						showNotification({
							message:
								error?.response?.data?.data ||
								__(
									"Couldn't load this quiz. You may not have permission to edit it.",
									'academy'
								),
							isShow: true,
							type: 'error',
						})
					);
				});
		} else {
			setOpenQuizForm(true);
		}
	}
	function closeQuizFormModal(param = null) {
		if (isSubCurriculum && param) {
			subTopicUpdateHandler(
				{
					id: param?.id,
					name: param?.title,
					type: 'quiz',
				},
				itemIndex,
				subCurriculumIndex
			);
		} else if (topicUpdateHandler && param) {
			topicUpdateHandler(
				{
					id: param?.id,
					name: param?.title,
					type: 'quiz',
				},
				itemIndex
			);
		}
		setFormData(false);
		setOpenQuizForm(false);
	}

	return (
		<>
			{item?.id || viewFromCourseBuilder ? (
				<Button
					onClick={openQuizFormModal}
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
							onClick={() => openQuizFormModal()}
							icon={
								<span className="academy-icon academy-icon--quiz-fill"></span>
							}
							label={__('Add Quiz', 'academy')}
						/>
					) : (
						<Button
							onClick={() => openQuizFormModal()}
							label={__('Create New Quiz', 'academy')}
						/>
					)}
				</>
			)}
			{isOpenQuizForm && (
				<QuizFormModal
					isOpenQuizForm={isOpenQuizForm}
					closeQuizFormModal={closeQuizFormModal}
					formData={formData}
					dripContentType={dripContentType}
					isDripContentEnable={isDripContentEnable}
					topics={isSubCurriculum ? subCurriculumTopics : topics}
					currentItemId={item.id}
					isLoading={isLoading}
					updateTopic={updateTopic}
					topicUpdateHandler={topicUpdateHandler}
					isSubCurriculum={isSubCurriculum}
					subCurriculumIndex={subCurriculumIndex}
					subTopicUpdateHandler={subTopicUpdateHandler}
					itemIndex={itemIndex}
					closeModal={closeModal}
					isAddNewItem={isAddNewItem}
				/>
			)}
		</>
	);
};

AddNewQuiz.propTypes = propTypes;
export default AddNewQuiz;
