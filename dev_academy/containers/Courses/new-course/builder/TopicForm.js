import React, { useContext, useState } from 'react';
import Button from '@Components/Button';
import CourseBuilderContext from './context/CourseBuilderContext';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import '../builder/styles/_topicForm.scss';

const propTypes = {
	submitLabel: PropTypes.string,
	title: PropTypes.string,
	content: PropTypes.string,
	value: PropTypes.array,
	setValue: PropTypes.func,
	itemIndex: PropTypes.number,
	toggleForm: PropTypes.func,
};

export default function TopicForm({
	submitLabel = 'submit',
	title = '',
	content = '',
	itemIndex,
	formToggler,
	setEditOpen,
}) {
	const [topics, setTopic] = useState(title);
	const [topicSummary, setTopicSummary] = useState(content);
	const [showTopicSummary, isShowTopicSummary] = useState(
		content ? true : false
	);

	const { curriculum, setCurriculum, toggleForm, setOpenIndex } =
		useContext(CourseBuilderContext);

	const addTopic = (param) => {
		let oldCurriculum = curriculum ? [...curriculum] : [];
		if (oldCurriculum[itemIndex]) {
			const currentItem = { ...oldCurriculum[itemIndex] };
			currentItem.title = param.topics;
			currentItem.content = param.topicSummary;
			oldCurriculum[itemIndex] = currentItem;
			setCurriculum(oldCurriculum);
			setOpenIndex(itemIndex);
			setEditOpen(false);
		} else {
			oldCurriculum = [
				...oldCurriculum,
				{
					title: param.topics,
					content: param.topicSummary,
					topics: [],
				},
			];
			setCurriculum(oldCurriculum);
			setOpenIndex(oldCurriculum.length - 1);
		}
		toggleForm(false);
	};

	return (
		<React.Fragment>
			<div>
				<div className="academy-topic-form">
					<div className="form-group">
						<input
							id="topicname"
							value={topics}
							onChange={(e) => setTopic(e.target.value)}
							placeholder={__('Add title here', 'academy')}
						/>
					</div>
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
						/>
					)}
					<div className="flex justify-start items-center gap-3 mt-6">
						<Button
							type="button"
							onClick={() =>
								topics.trim() !== '' &&
								addTopic({ topics, topicSummary })
							}
							label={submitLabel}
						/>
						<Button
							type="button"
							preset="transparent"
							border="gray"
							label={__('Close', 'academy')}
							onClick={() => formToggler()}
						/>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

TopicForm.propTypes = propTypes;
