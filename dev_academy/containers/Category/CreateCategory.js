import React, { useCallback, useEffect, useState } from 'react';
import { Field, useFormikContext } from 'formik';
import Tooltip from '@Components/Tooltip';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { generateSlug, prepare_term_data } from '@Utils/helper';
import AiTextGenerator from '@Components/AiTextGenerator';
import Select from '@Components/AcademySelect';
import UploadImage from '@Components/UploadImage';
import {
	fetchAllBookingCategories,
	fetchBookingInCludedCategory,
} from '@Redux/Slices/bookingSlice/bookingSlice';
import {
	fetchInCludedCategory,
	fetchAllCategories,
} from '@Redux/Slices/categorySlice/categorySlice';
import debounce from 'just-debounce-it';

import './styles.scss';

export function formatTermOptions(data, depth = 0) {
	return data.reduce((acc, item) => {
		const indent = '—'.repeat(depth);
		acc.push({
			value: item.id,
			label: item.name,
			indentLabel: `${indent} ${item.name}`.trim(),
		});

		if (Array.isArray(item.children) && item.children.length > 0) {
			acc.push(...formatTermOptions(item.children, depth + 1));
		}

		return acc;
	}, []);
}

export default function CreateCategory({ viewFrom }) {
	const { values, setFieldValue } = useFormikContext();
	const dispatch = useDispatch();
	const courseCategory = useSelector((state) => state.categories);
	const bookingCategory = useSelector((state) => state.bookings.categories);
	const data = prepare_term_data(
		viewFrom === 'course' ? courseCategory?.data : bookingCategory
	);
	const fetchedOptions = formatTermOptions(data);
	const [options, setOptions] = useState(fetchedOptions);
	const [loading, setLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [showSlugInput, setShowSlugInput] = useState(false);

	useEffect(() => {
		setOptions(formatTermOptions(data));
	}, [data.length]);

	const onSearchHandler = (searchKey = '') => {
		setLoading(true);
		if (viewFrom === 'course') {
			dispatch(fetchAllCategories(searchKey)).then(
				({ payload: { data: categoryData } }) => {
					const preparedData = prepare_term_data(categoryData);
					setOptions(
						formatTermOptions(
							!searchKey ? preparedData : categoryData
						)
					);
					setLoading(false);
				}
			);
		} else {
			dispatch(fetchAllBookingCategories(searchKey)).then(
				({ payload: { data: categoryData } }) => {
					const preparedData = prepare_term_data(categoryData);
					setOptions(
						formatTermOptions(
							!searchKey ? preparedData : categoryData
						)
					);
					setLoading(false);
				}
			);
		}
	};
	const debouncedAPICall = useCallback(
		debounce((keyword) => {
			onSearchHandler(keyword);
		}, 1000),
		[onSearchHandler]
	);

	useEffect(() => {
		const option = options.find((opt) => opt.value === values.parent);
		setLoading(true);

		if (option) {
			setSelectedOption({ value: option.value, label: option.label });
			setLoading(false);
		} else if (values.parent) {
			if (viewFrom === 'course') {
				dispatch(fetchInCludedCategory([values.parent])).then(
					({ payload }) => {
						if (payload?.length) {
							const fetched = payload[0];
							setSelectedOption({
								value: fetched.id,
								label: fetched.name,
							});
							setLoading(false);
						}
					}
				);
			} else {
				dispatch(fetchBookingInCludedCategory([values.parent])).then(
					({ payload }) => {
						if (payload?.length) {
							const fetched = payload[0];
							setSelectedOption({
								value: fetched.id,
								label: fetched.name,
							});
							setLoading(false);
						}
					}
				);
			}
		} else {
			setSelectedOption(null);
			setLoading(false);
		}
	}, [values.parent, options]);

	return (
		<React.Fragment>
			<div className="academy-category-form">
				<div className="flex flex-col gap-6">
					<div className="academy-column-items">
						<div className="academy-category-form__name-row">
							<label htmlFor="name">
								<span className="academy-title">
									{__('Name', 'academy')}
								</span>
							</label>
							<button
								type="button"
								className="academy-change-slug-btn"
								onClick={() =>
									setShowSlugInput((prev) => !prev)
								}
							>
								{__('Change slug', 'academy')}
							</button>
						</div>

						<Field
							id="name"
							name="name"
							placeholder={__('Add category name', 'academy')}
							onBlur={(e) => {
								if (parseInt(values.id) === 0) {
									setFieldValue(
										'slug',
										generateSlug(e.target.value)
									);
								}
							}}
							className="academy-input"
						/>

						{showSlugInput && (
							<Field
								id="slug"
								name="slug"
								placeholder={__('Add slug here', 'academy')}
								onBlur={(e) => {
									if (parseInt(values.id) === 0) {
										setFieldValue(
											'slug',
											generateSlug(e.target.value)
										);
									}
								}}
								className="academy-input"
							/>
						)}
					</div>
				</div>

				<div className="academy-category-form__field my-6 w-full">
					<label
						htmlFor="parent"
						className="academy-mb-2 block text-sm font-medium leading-5"
					>
						{__('Parent Category', 'academy')}
						<Tooltip>
							{__(
								'Assign a parent term to create a hierarchy. The term Jazz, for example, would be the parent of Bebop and Big Band',
								'academy'
							)}
						</Tooltip>
					</label>

					<Select
						id="parent"
						name="parent"
						className="academy-select"
						placeholder={__('— Parent Category —', 'academy')}
						options={options.map((o) => ({
							...o,
							label: o.indentLabel || o.label,
						}))}
						onInputChange={debouncedAPICall}
						isLoading={loading}
						value={selectedOption?.value}
						onChangeHandler={(val) =>
							setFieldValue('parent', val || 0)
						}
						isClearable
					/>
				</div>

				{viewFrom === 'course' && (
					<div className="academy-category-form__field my-6 w-full">
						<label className="block text-sm font-medium leading-5">
							{__('Category Image', 'academy')}
						</label>
						<p className="academy-upload-dropzone-hint">
							{__('Recommended size: 700 × 430 px.', 'academy')}
						</p>

						<UploadImage
							name="meta.academy_category_image"
							value={values?.meta?.academy_category_image || 0}
							saveValueHandler={(name, id) =>
								setFieldValue(name, id)
							}
							label=""
							variant="dropzone"
							compact
							supportedFile="JPG, JPEG, GIF, PNG"
							imageSize=""
						/>
					</div>
				)}

				<label
					htmlFor="description"
					className="academy-ai-generate--item-wrap mb-2"
				>
					<span className="academy-title">
						{__('Description', 'academy')}
					</span>
					<AiTextGenerator
						title={__('Generate Category Description', 'academy')}
						placeholder={__(
							'Exp: Create a description about…',
							'academy'
						)}
						name="description"
						saveHandler={setFieldValue}
						label={__('Append to Category Description', 'academy')}
					/>
				</label>

				<Field
					id="description"
					placeholder={__('Add description here', 'academy')}
					name="description"
					as="textarea"
					className="academy-input w-full min-h-[150px] p-3"
				/>
			</div>
		</React.Fragment>
	);
}
