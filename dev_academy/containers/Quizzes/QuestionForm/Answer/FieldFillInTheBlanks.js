import React, { useState } from 'react';
import { API, namespace } from '@Utils/helper';
import { Field, FieldArray, useFormikContext } from 'formik';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Button from '@Components/Button';
import { __ } from '@wordpress/i18n';
import { arrayMoveImmutable } from 'array-move';
import OptionMenu from '@Components/OptionMenu';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const propTypes = {};

const Form = ({ index, closeFormHandler }) => {
	return (
		<>
			<div className="academy-sortable__item-title">
				<span className="label">{__('Answer Title', 'academy')}</span>
				<Field name={`answers.${index}.answer_title`} className="academy-input" />
				<p className="academy-desc">
					{__(
						'Please make sure to use the {dash} variable in your question title to show the blanks in your question. You can use multiple {dash} variables in one question.',
						'academy'
					)}
				</p>
			</div>
			<div className="academy-sortable__item-title">
				<span className="label">{__('Answer', 'academy')}</span>
				<Field name={`answers.${index}.answer_content`} className="academy-input" />
				<p className="academy-desc">
					{__(
						'The question defines one answer per {dash} variable, with multiple answers separated by a vertical bar |. For instance, the possible answers to the question would be listed as: Apple | Banana | Orange.',
						'academy'
					)}
				</p>
			</div>
			<Button
				onClick={() => closeFormHandler(false)}
				preset="white"
				border="purple"
				size="sm"
				label={__('Save and Update Answer', 'academy')}
			/>
		</>
	);
};

const SortableItem = SortableElement(
	({ item, itemIndex, editItemHandler, deleteItemHandler }) => {
		return (
			<>
				<div className={`academy-sortable__item `}>
					<div className="academy-sortable__title">
						<span className="bars sortable-bars">
							<span></span>
							<span></span>
							<span></span>
						</span>
						<span className="academy-sortable__answer-title">
							{item.answer_title}
						</span>
					</div>
					<OptionMenu
						options={[
							{
								type: 'button',
								label: __('Edit', 'academy'),
								icon: (
									<span className="academy-icon academy-icon--edit-two"></span>
								),
								onClick: () => editItemHandler(item, itemIndex),
							},
							{
								type: 'button',
								label: __('Delete', 'academy'),
								suffix: 'trash',
								icon: (
									<span className="academy-icon academy-icon--trash-delete" />
								),
								onClick: () =>
									deleteItemHandler(item, itemIndex),
							},
						]}
					/>
				</div>
			</>
		);
	}
);

const SortableList = SortableContainer(
	({ items, correctAnswerHandler, arrayHelpers }) => {
		const dispatch = useDispatch();
		const [isOpenForm, setOpenForm] = useState(false);
		const [formIndex, setFormIndex] = useState(0);
		const { values } = useFormikContext();
		const addOptionHandler = () => {
			arrayHelpers.push({
				answer_title: '',
				is_correct: false,
				image_id: 0,
				view_format: 'text',
			});
			setFormIndex(items.length);
			setOpenForm(true);
		};

		const editItemHandler = (item, itemIndex) => {
			setFormIndex(itemIndex);
			setOpenForm(true);
		};

		const deleteItemHandler = (item, itemIndex) => {
			// eslint-disable-next-line
			if (window.confirm(__('Are you sure?', 'academy'))) {
				arrayHelpers.remove(itemIndex);
				if (item?.answer_id) {
					API.post(
						`${namespace}quiz_answers/${parseInt(item?.answer_id)}`,
						{},
						{
							headers: {
								'X-HTTP-Method-Override': 'DELETE',
							},
						}
					);
					dispatch(
						showNotification({
							message: __(
								'Option deleted successfully!',
								'academy'
							),
							isShow: true,
							type: 'success',
						})
					);
				}
			}
		};

		const closeFormHandler = (itemsValue) => {
			if (itemsValue?.answer_title && itemsValue?.answer_content) {
				setOpenForm(false);
			} else {
				dispatch(
					showNotification({
						message: __(
							'Answer title and Answer is required!!',
							'academy'
						),
						isShow: true,
						type: 'error',
					})
				);
			}
		};

		return (
			<div className="academy-sortable">
				{isOpenForm ? (
					<Form
						closeFormHandler={() =>
							closeFormHandler(items[formIndex])
						}
						value={items[formIndex]}
						index={formIndex}
					/>
				) : (
					<>
						{items &&
							items.map((item, index) => (
								<SortableItem
									key={`item-${index}`}
									correctAnswerHandler={correctAnswerHandler}
									editItemHandler={editItemHandler}
									deleteItemHandler={deleteItemHandler}
									itemIndex={index}
									index={index}
									item={item}
								/>
							))}
						{values.answers.length < 1 && (
							<Button
								onClick={addOptionHandler}
								preset="white"
								border="purple"
								size="sm"
								icon={
									<span className="academy-icon academy-icon--simple-add" />
								}
								iconPosition="left"
								label={__('Add an option', 'academy')}
								style={{ justifyContent: 'center' }}
							/>
						)}
					</>
				)}
			</div>
		);
	}
);

export default function FieldFillInTheBlanks() {
	const { setFieldValue, values } = useFormikContext();
	const { answers } = values;

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
				if (is_correct === false) {
					setFieldValue(name, true);
				}
			} else {
				setFieldValue(`answers.${itemIndex}.is_correct`, false);
			}
		});
	};

	if (!answers) {
		return null;
	}

	return (
		<React.Fragment>
			<FieldArray
				name="answers"
				render={(arrayHelpers) => (
					<SortableList
						arrayHelpers={arrayHelpers}
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

FieldFillInTheBlanks.propTypes = propTypes;
