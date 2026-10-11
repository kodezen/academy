import React, { useContext, useState } from 'react';
import Button from '@Components/Button';
import OptionMenu from '@Components/OptionMenu';
import { __ } from '@wordpress/i18n';
import { sliceString } from '@Utils/helper';
import { arrayMoveImmutable } from 'array-move';
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';
import CourseBuilderContext from '../context/CourseBuilderContext';
import TopicContext from '../context/TopicContext';
import SubCurriculumForm from './SubCurriculumForm';
import TopicsSelectModal from '../topics-select-modal';
import EditTopic from '../EditTopic';
import './styles.scss';

// Grabbing this handle is the only way to start a drag — used both for the
// sub-curriculum row itself (bound to the outer topics list it's nested in)
// and for its own nested sub-topic rows below; `sortableHandle` binds to
// whichever `SortableContainer` context is nearest at each render site, so
// the same handle works correctly in both places.
const DragHandle = sortableHandle(() => (
	<span className="academy-icon academy-icon--drag" />
));

// topic lesson
const SortableTopicLesson = sortableElement(
	({ item, subItemRemoveHandler, subCurriculumIndex, topicIndex }) => {
		const itemTypeHandler = (type) => {
			switch (type) {
				case 'booking':
					return 'Booking';
				case 'assignment':
					return 'Assignment';
				case 'meeting':
					return 'Meeting';
				case 'quiz':
					return 'Quiz';
				case 'quizpress_quiz':
					return 'QuizPress';
				case 'lesson':
					return 'Lesson';
			}
		};

		return (
			<li className="academy-course-sub-topic-builder__item">
				<div className="text">
					<DragHandle />
					<span className="title">
						{itemTypeHandler(item?.type)} - {item?.name}
					</span>
				</div>
				<div className="control" style={{ display: 'flex' }}>
					<EditTopic
						item={item}
						itemIndex={topicIndex}
						viewFromCourseBuilder={true}
						subCurriculumIndex={subCurriculumIndex}
						isSubCurriculum={true}
					/>
					<Button
						preset="transparent"
						type="button"
						size="xs"
						onClick={() => subItemRemoveHandler(item)}
						suffix="delete"
						icon={
							<span className="academy-icon academy-icon--delete"></span>
						}
						iconPosition="center"
					/>
				</div>
			</li>
		);
	}
);

const SortableTopicLessonContainer = sortableContainer(({ children }) => {
	return <ul className="academy-course-sub-topic-builder">{children}</ul>;
});

const SubCurriculum = ({ topics, index }) => {
	const { openIndex, curriculum, setCurriculum } =
		useContext(CourseBuilderContext);
	const { deleteLessonHandler } = useContext(TopicContext);
	const [editLesson, setEditLesson] = useState(false);
	const [openTopicIndex, setOpenTopicIndex] = useState(index);
	const topicToggleHandler = (itemIndex) => {
		setOpenTopicIndex(openTopicIndex === itemIndex ? -1 : itemIndex);
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		if (oldIndex === newIndex) return;

		const updatedCurriculum = [...curriculum];

		const sortedSubTopics = arrayMoveImmutable(
			updatedCurriculum[openIndex].topics[index].topics,
			oldIndex,
			newIndex
		);

		updatedCurriculum[openIndex] = {
			...updatedCurriculum[openIndex],
			topics: updatedCurriculum[openIndex].topics.map((topic, i) =>
				i === index ? { ...topic, topics: sortedSubTopics } : topic
			),
		};

		setCurriculum(updatedCurriculum);
	};

	const subItemRemoveHandler = (item) => {
		const id = item.id ? item.id : item.ID;

		setCurriculum(
			curriculum.map((module, modIndex) => {
				if (modIndex !== openIndex) return module; // Keep other modules unchanged

				return {
					...module,
					topics: module.topics.map((topic, topicIndex) => {
						if (topicIndex !== openTopicIndex) return topic; // Keep other topics unchanged

						return {
							...topic,
							topics: topic.topics.filter(
								(subTopic) => parseInt(subTopic?.id) !== id
							),
						};
					}),
				};
			})
		);
	};

	return (
		<>
			{topics && (
				<div
					className={`academy-course-builder-sub-topic ${
						openTopicIndex === index &&
						'academy-course-builder-sub-topic--is-open'
					}`}
				>
					<div className="panel__head">
						<div className="text-title">
							<DragHandle />
							<button
								type="button"
								onClick={() => topicToggleHandler(index)}
							>
								<span className="academy-title">
									{__('Sub-curriculum -', 'academy')}
								</span>{' '}
								{sliceString(topics?.name, 125, '...')}
							</button>
						</div>
						<div className="control">
							<OptionMenu
								iconClass={
									<svg
										xmlns="http://www.w3.org/2000/svg"
										height="1em"
										viewBox="0 0 128 512"
									>
										<path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
									</svg>
								}
								options={[
									{
										type: 'button',
										label: __('Edit', 'academy'),
										icon: (
											<span className="academy-icon academy-icon--edit-two"></span>
										),
										onClick: () =>
											setEditLesson(!editLesson),
									},
									{
										type: 'button',
										suffix: 'trash',
										label: __('Delete', 'academy'),
										icon: (
											<span className="academy-icon academy-icon--trash-delete" />
										),
										onClick: () =>
											deleteLessonHandler(topics),
									},
								]}
							/>
							<Button
								icon={
									<span
										className={`academy-icon academy-icon--angle-${
											openTopicIndex === index
												? 'up'
												: 'down'
										}`}
									></span>
								}
								onClick={() => topicToggleHandler(index)}
								suffix="arrow-up-down"
							/>
						</div>
					</div>

					<div className="panel__body">
						{openTopicIndex === index && (
							<>
								<SortableTopicLessonContainer
									onSortEnd={onSortEnd}
									useDragHandle
								>
									{topics?.topics &&
										topics?.topics.map(
											(lessons, lessonsIndex) => (
												<SortableTopicLesson
													key={`item-${lessonsIndex}`}
													index={lessonsIndex}
													itemIndex={lessonsIndex}
													item={lessons}
													subItemRemoveHandler={
														subItemRemoveHandler
													}
													subCurriculumIndex={
														topics?.topics?.length
													}
													topicIndex={index}
												/>
											)
										)}
								</SortableTopicLessonContainer>
								<div className="panel-control">
									<TopicsSelectModal
										subItemRemoveHandler={
											subItemRemoveHandler
										}
										itemIndex={index}
										isSubCurriculum={true}
										subCurriculumIndex={index}
										subCurriculumItemIndex={
											topics?.topics?.length
										}
										updateTopic={false}
									/>
								</div>
							</>
						)}
					</div>
				</div>
			)}
			{editLesson && (
				<SubCurriculumForm
					isEdit={true}
					item={topics}
					editLesson={editLesson}
					setEditLesson={setEditLesson}
				/>
			)}
		</>
	);
};

export default SubCurriculum;
