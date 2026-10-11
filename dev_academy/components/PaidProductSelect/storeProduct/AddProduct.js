import { __, sprintf } from '@wordpress/i18n';
import { Field, Formik } from 'formik';
import Select2 from '@Components/AcademySelect';
import Tooltip from '@Components/Tooltip';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import Number from '@Components/Formik/Number';
import { makeRequest, storeengine_addons } from '@Utils/helper';
import Button from '@Components/Button';
import { useDispatch } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import debounce from 'just-debounce-it';
import PredefinedForm from './Forms/PredefinedForm';
import CustomForm from './Forms/CustomForm';

export const subscriptionDateType = [
	{
		label: __('Days', 'academy'),
		value: 'day',
	},
	{
		label: __('Weeks', 'academy'),
		value: 'week',
	},
	{
		label: __('Months', 'academy'),
		value: 'month',
	},
	{
		label: __('Years', 'academy'),
		value: 'year',
	},
];

export const prefferedProductTypes = [
	{
		label: __('Predefined', 'academy'),
		value: 'predefined',
	},
	{
		label: __('Custom', 'academy'),
		value: 'custom',
	},
];

const AddProduct = ({
	ID,
	title,
	selectedItem,
	productPrices,
	setProductPrices,
	updateAction,
	showForm,
	isShowForm,
	setSelectedItem,
	priceData,
	isNewProduct,
	newProduct,
}) => {
	const dispatch = useDispatch();
	const isFormVisible = showForm || (selectedItem && !priceData?.length);
	const [products, setProducts] = useState([]);
	const [productsPrices, setProductsPrices] = useState([]);
	const [selectedProductPriceList, setSelectedProductPriceList] = useState(
		[]
	);
	const [fetcingData, setFetcingData] = useState(false);

	useEffect(() => {
		if (priceData.length > 0) {
			const list = priceData.map((p) => ({
				value: p.product_id,
				label: p.product_name,
			}));
			setProducts(list);
		}
	}, [priceData]);

	const onSearchHandler = async (search = '') => {
		// A brand-new, not-yet-saved course has no `ID` — the server can't
		// look up products for a course that doesn't exist yet, and errors
		// with `{message: "integration_id is required"}` (an object, not a
		// list). Passing that straight through to `setProducts` used to hand
		// `AcademySelect` a non-array `options` prop, which crashed the
		// whole page (`options?.find is not a function` inside
		// `renderLabel`, uncaught, no error boundary above it). Skip the
		// request entirely rather than let that round-trip happen.
		if (!ID) {
			return;
		}
		try {
			setFetcingData(true);
			const res = await makeRequest({
				action: 'academy_storeengine/get_product_list',
				integration_id: ID,
				search,
			});
			// Defense in depth: even with the `ID` guard above, any other
			// server-side error shape (`{message: ...}`, not an array)
			// must never reach `setProducts` — same crash otherwise.
			setProducts(res?.data?.success ? res.data.data : []);
			setFetcingData(false);
		} catch (error) {
			setFetcingData(false);
			dispatch(
				showNotification({
					message: error,
					isShow: true,
					type: 'error',
				})
			);
		}
	};
	const debouncedAPICall = useCallback(
		debounce((keyword) => {
			onSearchHandler(keyword);
		}, 1000),
		[onSearchHandler]
	);

	return (
		<>
			{isFormVisible ? (
				<Formik
					enableReinitialize={true}
					initialValues={{
						price_type: 'onetime',
						order: 0,
						...(newProduct ? { type: 'custom' } : {}),
						...(selectedItem || {}),
					}}
					onSubmit={(values, { setSubmitting, resetForm }) => {
						setSubmitting(true);
						let params = {
							course_id: ID,
						};

						let newPrices = [];
						if (!ID) {
							dispatch(
								showNotification({
									message: __(
										'Please create course first!',
										'academy'
									),
									isShow: true,
									type: 'error',
								})
							);
							setSubmitting(false);
							return;
						}
						if (!values.price) {
							dispatch(
								showNotification({
									message: __('Price is Missing', 'academy'),
									isShow: true,
									type: 'error',
								})
							);
							setSubmitting(false);
							return;
						}

						if (title) {
							if (selectedItem?.price_id) {
								newPrices = [
									...productPrices.map((priceItem) => {
										if (
											parseInt(selectedItem?.price_id) ===
											parseInt(priceItem?.price_id)
										) {
											return { ...priceItem, ...values };
										}
										return priceItem;
									}),
								];
							} else {
								newPrices = productPrices?.length
									? [
											...productPrices,
											{
												...values,
												price_name: values.price_type,
											},
										]
									: [
											{
												...values,
												price_name: values.price_type,
											},
										];
							}

							params = {
								...params,
								course_title: title,
								prices: newPrices
									.filter(
										(price) =>
											price.price_type !== 'membership'
									)
									.filter((price) => price),
							};
							setSubmitting(true);
							makeRequest({
								action: updateAction,
								...params,
							}).then((response) => {
								if (response.data.success) {
									dispatch(
										showNotification({
											message: __(
												`Price Updated`,
												'academy'
											),
											isShow: true,
											type: 'success',
										})
									);
									setSubmitting(false);
									setProductPrices(response.data.data.prices);
									isShowForm(false);
									resetForm();
								} else {
									dispatch(
										showNotification({
											message:
												response?.data.data.message ??
												response?.data?.data?.data
													?.message,
											isShow: true,
											type: 'error',
										})
									);
									setSubmitting(false);
								}
							});
						}
					}}
				>
					{({
						values,
						submitForm,
						setFieldValue,
						resetForm,
						isSubmitting,
						setValues,
					}) => {
						const btnLabel = __('Price', 'academy');
						const productType = [
							{
								label: __('One Time', 'academy'),
								value: 'onetime',
								isDisabled: false,
							},
							{
								label: __('Subscription', 'academy'),
								value: 'subscription',
								isDisabled: !storeengine_addons.subscription,
							},
						];
						return (
							<div className="academy-add-store-product">
								<div className="academy-add-store-product__label-row">
									<label className="academy-add-store-product__label">
										{__('Product', 'academy')}
									</label>
									<Tooltip suffix="store-product-select">
										{__(
											'Select a product or a new one will be created automatically.',
											'academy'
										)}
									</Tooltip>
								</div>
								<Select2
									className="academy-select academy-select-store"
									placeholder={__(
										'Create or Select Product',
										'academy'
									)}
									value={values?.product_id || ''}
									isDisabled={
										selectedItem && selectedItem?.product_id
									}
									onChangeHandler={(selectedValue) => {
										if (selectedValue) {
											const option = products.find(
												(item) =>
													item.value === selectedValue
											);
											setFieldValue(
												'product_id',
												option?.value
											);
											setFieldValue('type', 'predefined');
											setSelectedProductPriceList(
												option?.prices
											);
											setProductsPrices(
												option?.prices?.map((item) => ({
													label: item.price,
													value: item.id,
												}))
											);
										} else {
											isNewProduct(true);
											setFieldValue('type', 'custom');
											setFieldValue('price_id', 0);
											setProductsPrices([]);
											resetForm();
										}
									}}
									onInputChange={debouncedAPICall}
									onMenuOpen={debouncedAPICall}
									isLoading={fetcingData}
									options={products}
									isSearchable={true}
									isClearable={true}
									isMulti={false}
								/>
								{!selectedItem &&
									newProduct &&
									values.product_id && (
										<div className="acadmey-preffered-store-product-types">
											{prefferedProductTypes.map(
												(item, index) => {
													return (
														<div
															onClick={() => {
																setValues({
																	price_type:
																		'onetime',
																	product_id:
																		values.product_id,
																	order: 0,
																	...(newProduct
																		? {
																				type: 'custom',
																			}
																		: {}),
																	...(selectedItem ||
																		{}),
																});
																setFieldValue(
																	'type',
																	item.value
																);
															}}
															className={`acadmey-preffered-store-product-type ${
																values.type ===
																	item.value &&
																'is-selected'
															}`}
															key={index}
														>
															{item.label}
														</div>
													);
												}
											)}
										</div>
									)}
								{values.type === 'predefined' ? (
									<PredefinedForm
										productsPrices={productsPrices}
										selectedProductPriceList={
											selectedProductPriceList
										}
										products={products}
									/>
								) : (
									<CustomForm
										productType={productType}
										selectedItem={selectedItem}
										subscriptionDateType={
											subscriptionDateType
										}
									/>
								)}
								<div className="academy-add-store-product__actions">
									<Button
										label={
											selectedItem
												? sprintf(
														// translators: %s: btnLabel
														__(
															'Update %s',
															'academy'
														),
														btnLabel
													)
												: sprintf(
														// translators: %s: btnLabel
														__('Add %s', 'academy'),
														btnLabel
													)
										}
										suffix="product-add"
										size="sm"
										preset="transparent"
										onClick={submitForm}
										isLoading={isSubmitting}
									/>

									{productPrices?.length > 0 && (
										<Button
											label={__('Cancel', 'academy')}
											size="sm"
											suffix="cancel"
											preset="transparent"
											onClick={() => {
												resetForm();
												isShowForm(false);
												setSelectedItem(null);
											}}
										/>
									)}
								</div>
							</div>
						);
					}}
				</Formik>
			) : (
				<Button
					icon={
						<span className="academy-icon academy-icon--plus"></span>
					}
					suffix="add"
					preset="transparent"
					onClick={() => isShowForm(true)}
					label={__('Add Price', 'academy')}
				/>
			)}
		</>
	);
};

export default AddProduct;
