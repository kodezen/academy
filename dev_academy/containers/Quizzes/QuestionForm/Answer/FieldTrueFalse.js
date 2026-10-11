import React, { useEffect } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { __ } from '@wordpress/i18n';
import { arrayMoveImmutable } from 'array-move';

const propTypes = {};

const SortableItem = SortableElement(
	({ item, itemIndex, correctAnswerHandler }) => {
		return (
			<div
				role="presentation"
				className="academy-sortable__item cursor-pointer"
				onClick={(e) => {
					if (e.target.closest('.sortable-bars')) {
						return;
					}
					correctAnswerHandler(
						`answers.${itemIndex}.is_correct`,
						itemIndex
					);
				}}
			>
				<div className="academy-sortable__title">
					<span className="academy-icon academy-icon--drag sortable-bars">
						<span></span>
						<span></span>
						<span></span>
					</span>
					<span className="academy-sortable__answer-title">
						{item.answer_title}
					</span>
				</div>
				<div className="academy-sortable__item-field">
					<input
						type="radio"
						readOnly
						tabIndex={-1}
						className="pointer-events-none"
						checked={item.is_correct === true}
					/>
				</div>
			</div>
		);
	}
);

const SortableList = SortableContainer(({ items, correctAnswerHandler }) => {
	return (
		<div className="academy-sortable">
			{items &&
				items.map((item, index) => (
					<SortableItem
						key={`item-${index}`}
						index={index}
						correctAnswerHandler={correctAnswerHandler}
						itemIndex={index}
						item={item}
					/>
				))}
		</div>
	);
});

export default function FieldTrueFalse({ fieldType }) {
	const { setFieldValue, values } = useFormikContext();
	const { answers } = values;
	const defaultValues = [
		{
			answer_title: __('True', 'academy'),
			view_format: 'text',
			question_type: 'trueFalse',
			is_correct: false,
		},
		{
			answer_title: __('False', 'academy'),
			view_format: 'text',
			question_type: 'trueFalse',
			is_correct: false,
		},
	];

	useEffect(() => {
		const existingAnswers = answers
			? answers?.reduce((acc, item) => {
					if (item.question_type === 'trueFalse') {
						acc.push(item);
					}
					return acc;
				}, [])
			: [];
		setFieldValue(
			'answers',
			existingAnswers?.length === 2 ? existingAnswers : defaultValues
		);
	}, [fieldType]);

	const onSortEnd = ({ oldIndex, newIndex }) => {
		let sortedAnswer = arrayMoveImmutable(answers, oldIndex, newIndex);
		sortedAnswer = sortedAnswer.map((item, index) => ({
			...item,
			answer_order: index,
		}));

		setFieldValue('answers', sortedAnswer);
	};

	const correctAnswerHandler = (name, index) => {
		const { is_correct } = answers[index];
		answers.forEach((item, itemIndex) => {
			if (itemIndex === index) {
				setFieldValue(`answers.${itemIndex}.is_correct`, !is_correct);
			} else {
				setFieldValue(`answers.${itemIndex}.is_correct`, false);
			}
		});
	};

	return (
		<React.Fragment>
			<FieldArray
				name="answers"
				render={() => (
					<SortableList
						items={answers}
						correctAnswerHandler={correctAnswerHandler}
						onSortEnd={onSortEnd}
						shouldCancelStart={(e) => {
							return !e.target.closest('.sortable-bars');
						}}
					/>
				)}
			/>
		</React.Fragment>
	);
}

FieldTrueFalse.propTypes = propTypes;
