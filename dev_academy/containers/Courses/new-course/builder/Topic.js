import React, { useContext } from 'react';
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';
import Button from '@Components/Button';
import CourseBuilderContext from './context/CourseBuilderContext';
import EditTopic from './EditTopic';
import TopicContext from './context/TopicContext';
import TopicsSelectModal from './topics-select-modal';
import { arrayMoveImmutable } from 'array-move';
import { __ } from '@wordpress/i18n';
import { sliceString } from '@Utils/helper';
import { getItemPreviewUrl } from '../helper';
import SubCurriculumForm from './subCurriculum/SubCurriculumForm';
import SubCurriculum from './subCurriculum/SubCurriculum';
import { useFormikContext } from 'formik';

// Grabbing this handle is the only way to start a drag — everywhere else on
// the row (title, preview/edit/delete buttons) stays a normal click.
const DragHandle = sortableHandle(() => (
	<span className="academy-icon academy-icon--drag" />
));

const SortableTopicItem = sortableElement(({ item, itemIndex }) => {
	const { deleteLessonHandler } = useContext(TopicContext);
	const { values } = useFormikContext();
	const previewUrl = getItemPreviewUrl(values?.post_ID, item.type, item.id);
	const onChangeHandler = () => {
		deleteLessonHandler(item);
	};
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
		<li
			className={
				item.type === 'sub-curriculum'
					? 'academy-course-topic-builder__item-sub-curriculum'
					: `academy-course-topic-builder__item`
			}
		>
			{item?.type !== 'sub-curriculum' ? (
				<>
					<div className="text">
						<DragHandle />
						<span className="title">
							{itemTypeHandler(item.type)} -{' '}
							{sliceString(item.name, 125, '...')}
						</span>
					</div>
					<div className="control" style={{ display: 'flex' }}>
						{previewUrl && (
							<Button
								type="link"
								link={previewUrl}
								target="_blank"
								preset="transparent"
								size="xs"
								suffix="preview"
								ariaLabel={__('Preview', 'academy')}
								icon={
									<span className="academy-icon academy-icon--eye"></span>
								}
								iconPosition="center"
							/>
						)}
						<EditTopic
							item={item}
							itemIndex={itemIndex}
							viewFromCourseBuilder={true}
							isSubCurriculum={false}
						/>
						<Button
							preset="transparent"
							type="button"
							size="xs"
							onClick={onChangeHandler}
							suffix="delete"
							icon={
								<span className="academy-icon academy-icon--delete"></span>
							}
							iconPosition="center"
						/>
					</div>
				</>
			) : (
				<SubCurriculum topics={item} index={itemIndex} />
			)}
		</li>
	);
});

const SortableTopicItemContainer = sortableContainer((props) => {
	return <ul className="academy-course-topic-builder">{props.children}</ul>;
});

const Topic = (props) => {
	const { setFieldValue } = useFormikContext();
	const { curriculum, setCurriculum, setShowTopicButton, isShowTopicButton } =
		useContext(CourseBuilderContext);

	const handleFormikForceDirty = () => {
		const date = Date.now();
		setFieldValue('updateTime', date);
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		if (oldIndex === newIndex) return;
		let topics = [...props.topics];
		topics = arrayMoveImmutable(topics, oldIndex, newIndex);
		const updatedCurriculum = [...curriculum];
		updatedCurriculum[props.itemIndex] = {
			...updatedCurriculum[props.itemIndex],
			topics,
		};
		setCurriculum(updatedCurriculum);
		handleFormikForceDirty();
	};

	const deleteLessonHandler = (item) => {
		setCurriculum(
			curriculum.map((module, modIndex) => {
				if (modIndex !== props.itemIndex) return module;

				return {
					...module,
					topics: module.topics.filter(
						(topic) =>
							parseInt(topic?.id) !== parseInt(item?.ID) &&
							parseInt(topic?.id) !== parseInt(item?.id)
					),
				};
			})
		);

		handleFormikForceDirty();
	};

	const existingTopicInsertHandler = (item) => {
		const topics = [...props.topics, { ...item }];

		const value = [...curriculum];

		value[props.itemIndex] = {
			...value[props.itemIndex],
			topics,
		};

		setCurriculum(value);
		handleFormikForceDirty();
	};

	const existingSubTopicInsertHandler = (item) => {
		setCurriculum(
			curriculum.map((module, modIndex) => {
				if (modIndex !== props.itemIndex) return module;

				return {
					...module,
					topics: module.topics.map((topic) => {
						if (parseInt(topic?.id) === parseInt(item?.id)) {
							return {
								...topic,
								topics: [
									...(topic.topics || []),
									...(item.topics || []),
								],
							};
						}
						return topic;
					}),
				};
			})
		);

		handleFormikForceDirty();
	};

	const topicInsertHandler = (data) => {
		const topics = [
			...props?.topics,
			{ id: data?.ID, name: data?.lesson_title, type: 'lesson' },
		];
		const value = [...curriculum];
		value[props.itemIndex].topics = topics;
		setCurriculum(value);
		handleFormikForceDirty();
	};

	const topicUpdateHandler = (item, itemIndex) => {
		setCurriculum(
			curriculum.map((module, modIndex) => {
				if (modIndex !== props.itemIndex) return module;

				if (!Array.isArray(module.topics)) return module;

				const newTopics = [...module.topics];

				if (itemIndex < newTopics.length) {
					newTopics[itemIndex] = item; // Update
				} else {
					newTopics.push(item); // Add
				}

				return {
					...module,
					topics: newTopics,
				};
			})
		);

		handleFormikForceDirty();
	};

	const subTopicUpdateHandler = (item, itemIndex) => {
		setCurriculum(
			curriculum.map((module, modIndex) => {
				if (modIndex !== props.itemIndex) return module;

				return {
					...module,
					topics: module.topics.map((topic, topIndex) => {
						if (topIndex !== itemIndex) return topic;

						const prevItems = topic.topics || [];
						const prevItemIndex = prevItems.findIndex(
							(prev) => prev?.id === item?.id
						);

						let updatedTopics;
						if (prevItemIndex === -1) {
							updatedTopics = [...prevItems, item];
						} else {
							updatedTopics = prevItems.map((prev, idx) =>
								idx === prevItemIndex ? item : prev
							);
						}

						return { ...topic, topics: updatedTopics };
					}),
				};
			})
		);

		handleFormikForceDirty();
	};

	return (
		<>
			<TopicContext.Provider
				value={{
					topicInsertHandler,
					topicUpdateHandler,
					subTopicUpdateHandler,
					topics: props.topics,
					deleteLessonHandler,
					existingTopicInsertHandler,
					existingSubTopicInsertHandler,
					moduleIndex: props.itemIndex,
				}}
			>
				<SortableTopicItemContainer onSortEnd={onSortEnd} useDragHandle>
					{props.topics.map((item, index) => (
						<SortableTopicItem
							key={`item-${index}`}
							index={index}
							itemIndex={index}
							item={item}
						/>
					))}
				</SortableTopicItemContainer>

				{/* show sub curriculum add form */}
				{isShowTopicButton && <SubCurriculumForm isEdit={false} />}
				<div className="panel-control">
					<TopicsSelectModal
						isSubCurriculum={false}
						viewFromCourseBuilder={false}
						itemIndex={props?.topics?.length}
						showSubCurriculum={props.showSubCurriculum}
						setShowTopicButton={setShowTopicButton}
						updateTopic={true}
					/>
				</div>
			</TopicContext.Provider>
		</>
	);
};

export default Topic;
