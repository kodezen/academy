import React, { useEffect, useState } from 'react';
import { API, namespace } from '@Utils/helper';
import { Field, FieldArray, useFormikContext } from 'formik';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import Button from '@Components/Button';
import Format from './Format';
import UploadImage from '@Components/UploadImage';
import { __ } from '@wordpress/i18n';
import { arrayMoveImmutable } from 'array-move';
import OptionMenu from '@Components/OptionMenu';
import { useDispatch } from 'react-redux';
import Preloader from '@Components/Loader/Preloader';
import Editor from '@Components/Editor';
import { Radio } from '@Components/ui';
import MathJaxLateX from '@Components/MathJaxLateX';

const propTypes = {};

const Form = ({ index, value, closeFormHandler, fieldType }) => {
	const { setFieldValue } = useFormikContext();
	const setAttachment = (name, id) => {
		setFieldValue(name, id);
	};
	const isDropDown = fieldType === 'dropDown';
	const titleType = value?.answer_title_type === 'rich' ? 'rich' : 'plain';
	return (
		<>
			<div className="academy-sortable__item-title">
				<div className="academy-ai-generate--item-wrap justify-between">
					<span className="label">{__('Answer Title', 'academy')}</span>
					<div className="academy-question-title__format flex items-center gap-4">
						<Radio
							id={`answerTitleFormatPlain-${index}`}
							name={`answer_title_type-${index}`}
							value="plain"
							checked={titleType !== 'rich'}
							onChange={() =>
								setFieldValue(
									`answers.${index}.answer_title_type`,
									'plain'
								)
							}
							label={__('Plain', 'academy')}
						/>
						<Radio
							id={`answerTitleFormatRich-${index}`}
							name={`answer_title_type-${index}`}
							value="rich"
							checked={titleType === 'rich'}
							onChange={() =>
								setFieldValue(
									`answers.${index}.answer_title_type`,
									'rich'
								)
							}
							label={__('Rich text', 'academy')}
						/>
					</div>
				</div>
				{titleType === 'rich' ? (
					<Editor
						name={`answers.${index}.answer_title`}
						defaultValue={value?.answer_title}
						saveValueHandler={setFieldValue}
						suffix={`answer-title-${index}`}
					/>
				) : (
					<Field name={`answers.${index}.answer_title`} className="academy-input" />
				)}
			</div>
			{!isDropDown && (
				<div className="academy-sortable__item-image">
					{/* <span className="label">{__('Upload Image', 'academy')}</span> */}
					<UploadImage
						name={`answers.${index}.image_id`}
						saveValueHandler={setAttachment}
						value={parseInt(value?.image_id)}
					/>
				</div>
			)}
			{!isDropDown && (
				<div className="academy-sortable__item-format">
					<span>
						{__('Display format for answer options', 'academy')}
					</span>
					<Format name={`answers.${index}.view_format`} />
				</div>
			)}
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
	({
		item,
		itemIndex,
		correctAnswerHandler,
		editItemHandler,
		deleteItemHandler,
	}) => {
		const [imgObj, setImgObj] = useState({});

		useEffect(() => {
			if (parseInt(item.image_id)) {
				API.get(`wp/v2/media/${item?.image_id}`).then((res) => {
					setImgObj(res.data);
				});
			}
		}, []);
		return (
			<>
				<div className={`academy-sortable__item`}>
					<div className="academy-sortable__title">
						<span className="bars sortable-bars">
							<span></span>
							<span></span>
							<span></span>
						</span>
						<span className="academy-sortable__answer-title">
							{item.answer_title_type === 'rich' ? (
								<MathJaxLateX text={item.answer_title} />
							) : (
								item.answer_title
							)}
						</span>
						{parseInt(item?.image_id) !== 0 && (
							<img
								src={imgObj?.source_url}
								alt={__('item image', 'academy')}
							/>
						)}
					</div>
					<div className="academy-sortable__item-field">
						<input
							type="radio"
							onChange={() => {
								correctAnswerHandler(
									`answers.${itemIndex}.is_correct`,
									itemIndex
								);
							}}
							checked={item.is_correct === true}
						/>
						<OptionMenu
							options={[
								{
									type: 'button',
									label: __('Edit', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--edit-two" />
									),
									onClick: () =>
										editItemHandler(item, itemIndex),
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
				</div>
			</>
		);
	}
);

const SortableList = SortableContainer(
	({ items, correctAnswerHandler, arrayHelpers, fieldType }) => {
		const dispatch = useDispatch();
		const [isOpenForm, setOpenForm] = useState(false);
		const [formIndex, setFormIndex] = useState(0);
		const addOptionHandler = () => {
			arrayHelpers.push({
				answer_title: '',
				answer_title_type: 'plain',
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
				}
			}
		};

		const closeFormHandler = (itemsValue) => {
			if (itemsValue?.answer_title) {
				setOpenForm(false);
			} else {
				dispatch(
					showNotification({
						message: __('Answer title is required!!', 'academy'),
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
						fieldType={fieldType}
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
					</>
				)}
			</div>
		);
	}
);

export default function FieldSingleChoose({ fieldType }) {
	const { setFieldValue, values } = useFormikContext();
	const { answers } = values;
	const [sortedDataLoading, setSortedDataLoading] = useState(false);

	const onSortEnd = ({ oldIndex, newIndex }) => {
		setSortedDataLoading(true);
		let sortedAnswer = arrayMoveImmutable(answers, oldIndex, newIndex);
		sortedAnswer = sortedAnswer.map((item, index) => ({
			...item,
			answer_order: index,
		}));
		setFieldValue('answers', sortedAnswer);
		setTimeout(() => {
			setSortedDataLoading(false);
		}, 500);
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
			<>
				{sortedDataLoading ? (
					<Preloader />
				) : (
					<FieldArray
						name="answers"
						render={(arrayHelpers) => (
							<SortableList
								arrayHelpers={arrayHelpers}
								items={answers}
								correctAnswerHandler={correctAnswerHandler}
								fieldType={fieldType}
								onSortEnd={onSortEnd}
								shouldCancelStart={(e) => {
									return !e.target.closest('.sortable-bars');
								}}
								sortedDataLoading={sortedDataLoading}
							/>
						)}
					/>
				)}
			</>
		</React.Fragment>
	);
}

FieldSingleChoose.propTypes = propTypes;
