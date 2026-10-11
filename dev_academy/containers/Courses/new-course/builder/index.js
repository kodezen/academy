import React, { useContext, useState } from 'react';
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';
import Button from '@Components/Button';
import CourseBuilderContext from './context/CourseBuilderContext';
import Topic from './Topic';
import TopicForm from './TopicForm';
import { __ } from '@wordpress/i18n';
import { arrayMoveImmutable } from 'array-move';
import {
	active_plugins,
	getAddonActiveStatus,
	sliceString,
} from '@Utils/helper';
import { useFormikContext } from 'formik';
import { useSearchParams } from 'react-router-dom';
import ScormUpload from '../ScormUpload';
import { useSelector } from 'react-redux';
import OptionMenu from '@Components/OptionMenu';
import '../builder/styles/styles.scss';

// Grabbing this handle is the only way to start a drag — everywhere else on
// the row (title, edit/delete menu, expand toggle) stays a normal click.
const DragHandle = sortableHandle(() => (
	<span className="academy-icon academy-icon--drag"></span>
));

// topic lesson
const SortableTopicLesson = sortableElement(({ item, itemIndex }) => {
	const { openIndex, setOpenIndex, deleteCurriculum } =
		useContext(CourseBuilderContext);
	const [isEditOpen, setEditOpen] = useState(false);
	const allAddons = useSelector((state) => state.addons);
	const toggleHandler = () => {
		setEditOpen(false);
		setOpenIndex(openIndex === itemIndex ? -1 : itemIndex);
	};
	const handleUpdateTopicFormToggler = () => {
		setEditOpen(!isEditOpen);
	};

	const activeAddonLists = ['lesson', 'sub-curriculum'];
	if (getAddonActiveStatus(allAddons, 'quizzes')) {
		activeAddonLists.push('quiz');
	}
	if (getAddonActiveStatus(allAddons, 'assignments', true)) {
		activeAddonLists.push('assignment');
	}
	if (getAddonActiveStatus(allAddons, 'meeting', true)) {
		activeAddonLists.push('meeting');
	}
	if (getAddonActiveStatus(allAddons, 'tutor-booking', true)) {
		activeAddonLists.push('booking');
	}
	if (active_plugins?.quizpress_is_active) {
		activeAddonLists.push('quizpress_quiz');
	}
	const topics = item.topics.filter((topic) =>
		activeAddonLists.includes(topic?.type)
	);

	return (
		<>
			<li
				className={`academy-course-builder__item ${
					openIndex === itemIndex &&
					'academy-course-builder__item--is-open'
				}`}
				key={`item-${itemIndex}`}
			>
				<div className="panel-head">
					<div className="text">
						<DragHandle />
						<button type="button" onClick={() => toggleHandler()}>
							{sliceString(item.title, 125, '...')}
						</button>
					</div>
					<div className="control">
						<OptionMenu
							iconClass={
								<span className="academy-icon academy-icon--three-dots-menu" />
							}
							options={[
								{
									type: 'button',
									label: __('Edit', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--edit-two"></span>
									),
									onClick: () =>
										handleUpdateTopicFormToggler(),
									hasBorder: true,
								},
								{
									type: 'button',
									label: __('Delete', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									suffix: 'trash',
									onClick: () => deleteCurriculum(itemIndex),
								},
							]}
						/>
						<Button
							preset="transparent"
							type="button"
							size="xs"
							suffix="angle"
							onClick={() => toggleHandler()}
							icon={
								openIndex === itemIndex ? (
									<span className="academy-icon academy-icon--angle-up" />
								) : (
									<span className="academy-icon academy-icon--angle-down" />
								)
							}
							iconPosition="center"
						/>
					</div>
				</div>
				<div className="panel-body">
					{openIndex === itemIndex && (
						<Topic
							topics={topics}
							itemIndex={itemIndex}
							showSubCurriculum={true}
						/>
					)}
				</div>
			</li>
			{isEditOpen && (
				<TopicForm
					title={item.title}
					content={item.content}
					submitLabel={__('Update Curriculum', 'academy')}
					itemIndex={itemIndex}
					formToggler={handleUpdateTopicFormToggler}
					setEditOpen={setEditOpen}
				/>
			)}
		</>
	);
});

const SortableTopicLessonContainer = sortableContainer(({ children }) => {
	return <ul className="academy-course-builder">{children}</ul>;
});
const CourseBuilder = () => {
	const { values, setFieldValue } = useFormikContext();
	const { meta } = values;
	const curriculum = meta.academy_course_curriculum;
	const dripContentType = meta.academy_course_drip_content_type;
	const isDripContentEnable = meta.academy_course_drip_content_enabled;

	// The expanded module lives in the URL (`open_module`) so it survives the
	// round-trip into the route-based lesson/quiz editor (which unmounts the
	// builder) and a page reload — plain useState would reset to collapsed.
	const [searchParams, setSearchParams] = useSearchParams();
	const openIndex = parseInt(searchParams.get('open_module') ?? '-1', 10);
	const setOpenIndex = (idx) => {
		const sp = new URLSearchParams(searchParams);
		if (idx === -1 || idx === null || idx === undefined) {
			sp.delete('open_module');
		} else {
			sp.set('open_module', String(idx));
		}
		setSearchParams(sp, { replace: true });
	};
	const [isOpenNewTopicForm, setIsOpenNewTopicForm] = useState(false);
	const [uploadFiles, setUploadFiles] = useState(false);
	const [isShowTopicButton, setShowTopicButton] = useState(false);

	const addons = useSelector((state) => state.addons);
	const setCurriculum = (param) => {
		setFieldValue('meta.academy_course_curriculum', param);
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		setCurriculum(arrayMoveImmutable(curriculum, oldIndex, newIndex));
	};

	const deleteItemHandler = (index) => {
		setCurriculum(curriculum.filter((item, key) => key != index)); // eslint-disable-line
	};

	const handleNewTopicFormToggler = () => {
		setIsOpenNewTopicForm(!isOpenNewTopicForm);
	};

	return (
		<CourseBuilderContext.Provider
			value={{
				curriculum,
				setCurriculum,
				openIndex,
				setOpenIndex,
				deleteCurriculum: deleteItemHandler,
				toggleForm: setIsOpenNewTopicForm,
				dripContentType,
				isDripContentEnable,
				setShowTopicButton,
				isShowTopicButton,
			}}
		>
			<div className="academy-postbox academy-postbox--course">
				<div className="academy-postbox__header">
					<h2>{__('Course Builder', 'academy')}</h2>
				</div>
				<div className="academy-postbox__body">
					{getAddonActiveStatus(addons, 'scorm', true) && (
						<ScormUpload
							uploadFiles={uploadFiles}
							setUploadFiles={setUploadFiles}
						/>
					)}
					{!uploadFiles &&
						!values?.meta?._academy_course_builder_scorm_file && (
							<div className="academy-course-builder-wrap">
								<SortableTopicLessonContainer
									onSortEnd={onSortEnd}
									useDragHandle
								>
									{curriculum &&
										curriculum.map((item, index) => (
											<SortableTopicLesson
												key={`item-${index}`}
												index={index}
												itemIndex={index}
												item={item}
											/>
										))}
								</SortableTopicLessonContainer>
								{!isOpenNewTopicForm ? (
									<Button
										preset="purple"
										type="button"
										suffix="new-curriculum"
										icon={
											<span className="academy-icon academy-icon--simple-add" />
										}
										onClick={() =>
											handleNewTopicFormToggler()
										}
										label={__(
											'Add New Curriculum',
											'academy'
										)}
									/>
								) : (
									<TopicForm
										heading={__(
											'Add Curriculum',
											'academy'
										)}
										submitLabel={__(
											'Add Curriculum',
											'academy'
										)}
										formToggler={handleNewTopicFormToggler}
									/>
								)}
							</div>
						)}
				</div>
			</div>
		</CourseBuilderContext.Provider>
	);
};

export default CourseBuilder;
