import React, { useContext, useState } from 'react';
import CourseBuilderContext from '../context/CourseBuilderContext';
import Button from '@Components/Button';
import { __ } from '@wordpress/i18n';
import './styles.scss';

const SubCurriculumForm = ({ isEdit, item, editLesson, setEditLesson }) => {
	const { setShowTopicButton, openIndex, setCurriculum, curriculum } =
		useContext(CourseBuilderContext);

	const [topicName, setTopicName] = useState(isEdit ? item.name : '');
	const [showTopicSummary, isShowTopicSummary] = useState(false);
	const [topicSummary, setTopicSummary] = useState(
		isEdit ? item?.content : ''
	);

	const handleAddSubCurriculum = () => {
		if (isEdit) {
			const copiedCurriculum = curriculum.map((section) => ({
				...section,
				topics: section.topics?.map((topic) => ({ ...topic })) || [],
			}));

			copiedCurriculum[openIndex].topics = copiedCurriculum[
				openIndex
			].topics.map((topic) =>
				topic?.id === item?.id && topic.type === 'sub-curriculum'
					? { ...topic, name: topicName }
					: topic
			);

			setCurriculum(copiedCurriculum);
		} else {
			const newTopic = {
				name: topicName,
				type: 'sub-curriculum',
				id: curriculum[openIndex]?.topics?.length || 0,
				topics: [],
			};

			const updatedCurriculum = curriculum.map((section, i) =>
				i === openIndex
					? {
							...section,
							topics: [...(section.topics || []), newTopic],
						}
					: section
			);

			setCurriculum(updatedCurriculum);
		}
	};

	return (
		<div className="academy-course-builder-sub-curriculum__head">
			<div className="academy-topic-form">
				<div className="academy-topic-form--heading">
					{isEdit
						? __('Update Sub-curriculum', 'academy')
						: __('', 'academy')}
				</div>
				<div className="form-group">
					<input
						id="topicname"
						value={topicName}
						onChange={(e) => setTopicName(e.target.value)}
						placeholder={__('Add title here', 'academy')}
					/>
				</div>
				<div className="form-group">
					{showTopicSummary ? (
						<div className="academy-summary-close">
							<div className="academy-flex">
								<label
									htmlFor="topicsummary"
									className="academy-title"
								>
									{__('Summary', 'academy')}
								</label>
								<Button
									preset="transparent"
									suffix="close"
									icon={
										<span className="academy-icon academy-icon--close" />
									}
									onClick={() => isShowTopicSummary(false)}
								/>
							</div>
							<textarea
								id="topicsummary"
								onChange={(e) =>
									setTopicSummary(e.target.value)
								}
								defaultValue={topicSummary}
								placeholder={__('Add summary here', 'academy')}
							></textarea>
						</div>
					) : (
						<Button
							label={__('Add Summary', 'academy')}
							preset="transparent"
							suffix="description"
							icon={
								<span className="academy-icon academy-icon--simple-add" />
							}
							onClick={() => isShowTopicSummary(true)}
							size="medium"
						/>
					)}
				</div>
				<div className="academy-sub-curriculum">
					<Button
						type="button"
						onClick={() => {
							if (isEdit) {
								setEditLesson(!editLesson);
							} else {
								setShowTopicButton(false);
							}
						}}
						size="xs"
						preset="transparent"
						label={__('Close', 'academy')}
						border="gray"
					/>
					<Button
						type="button"
						onClick={() => {
							if (topicName !== '') {
								if (isEdit) {
									setEditLesson(!editLesson);
									handleAddSubCurriculum();
								} else {
									setShowTopicButton(false);
									handleAddSubCurriculum();
								}
							}
						}}
						label={
							isEdit
								? __('Update', 'academy')
								: __('Add', 'academy')
						}
						size="sm"
					/>
				</div>
			</div>
		</div>
	);
};

export default SubCurriculumForm;
