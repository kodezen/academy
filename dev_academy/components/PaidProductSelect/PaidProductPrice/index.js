/* eslint-disable no-shadow */
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Formik, useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { makeRequest } from '@Utils/helper';
import { useDispatch } from 'react-redux';
import { PendingPriceContext } from './pendingPriceContext';
import './styles.scss';

const propTypes = {
	description: PropTypes.string,
	title: PropTypes.string,
	action: PropTypes.string.isRequired,
	updateAction: PropTypes.string.isRequired,
	regularPrice: PropTypes.number,
	isForceProductCreation: PropTypes.bool,
	isRegularFieldDisabled: PropTypes.bool,
	productId: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	setFieldValue: PropTypes.func.isRequired,
	priceLabel: PropTypes.string,
	onPriceCommitted: PropTypes.func,
	onProductMissing: PropTypes.func,
};

const PaidProductPrice = ({
	productId,
	name,
	setFieldValue,
	description = __('Set your products discount price', 'academy'),
	title = '',
	isForceProductCreation = false,
	isRegularFieldDisabled = false,
	regularPrice = false,
	action,
	updateAction,
	priceLabel = __('Regular Price', 'academy'),
	onPriceCommitted = () => {},
	onProductMissing = () => {},
}) => {
	const { values } = useFormikContext();
	const { post_ID, slug, id } = values;
	const ID = post_ID ? post_ID : id;

	const [product, setProduct] = useState({
		regular_price: regularPrice ? regularPrice : 0,
		sale_price: 0,
	});
	const [isError, setError] = useState(false);
	const [isDisabled, setDisabled] = useState(false);
	const [debounceTitle, setDebounceTitle] = useState(title || '');
	const dispatch = useDispatch();
	const pendingPrice = useContext(PendingPriceContext);

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			setDebounceTitle(title || '');
		}, 1000);

		return () => clearTimeout(debounceTimer);
	}, [title]);

	const getProductByProductId = () => {
		makeRequest({
			action,
			productId,
		}).then((response) => {
			// The linked product has been deleted in WooCommerce/EDD since —
			// the lookup's only error (a failed request rejects instead).
			// Treat it as no product, so a price typed next creates a new one
			// rather than "updating" one that's gone; the caller unlinks it.
			if (!response?.data?.success) {
				setProduct({ regular_price: 0, sale_price: 0 });
				onPriceCommitted(0);
				onProductMissing();
				return;
			}
			setProduct(response?.data?.data);
			onPriceCommitted(Number(response?.data?.data?.regular_price) || 0);
		});
	};

	useEffect(() => {
		setProduct({
			regular_price: regularPrice ? regularPrice : 0,
			sale_price: 0,
		});
	}, [regularPrice]);

	useEffect(() => {
		if (productId) {
			getProductByProductId();
		} else if (!(Number(regularPrice) > 0)) {
			// No product linked and no price to carry over into one, so
			// nothing is purchasable: the course's price is 0. Report it the
			// way a linked product's loaded price is reported — `CourseType`
			// takes the first reported price as the saved baseline, so the
			// price typed next (the one that creates the product) is what
			// flips the course to Paid instead of being taken as that baseline.
			onPriceCommitted(0);
		}
	}, [productId]);

	// Only carries an existing price over into a new product (e.g. a plain
	// `academy_course_price` set before WooCommerce/EDD became the engine).
	// A title alone must never create one — every free course would get a $0
	// product the moment it's named, opened, or has its product cleared. A
	// price typed into the field below creates it instead (on blur).
	useEffect(() => {
		if (
			isForceProductCreation &&
			ID &&
			productId === 0 &&
			Number(regularPrice) > 0 &&
			debounceTitle !== ''
		) {
			makeRequest({
				action: updateAction,
				id: ID,
				title: debounceTitle,
				slug,
				payment_id: productId,
				regular_price: regularPrice ? regularPrice : 0,
			}).then((response) => {
				if (response.data.success) {
					const product_id = response?.data?.data?.product_id
						? response?.data?.data?.product_id
						: response?.data?.data?.download_id;
					setFieldValue(name, product_id);
					setProduct(response?.data?.data);
					if (response?.data?.data?.download_id) {
						setProduct({
							regular_price: regularPrice ? regularPrice : 0,
							sale_price: 0,
						});
					}
					onPriceCommitted(Number(regularPrice) || 0);
				} else {
					dispatch(
						showNotification({
							message: response.data.data,
							isShow: true,
							type: 'error',
						})
					);
				}
			});
		}
	}, [isForceProductCreation, regularPrice, debounceTitle, ID]);

	// Creates the course's product with these prices — or updates the linked
	// one — and syncs the result back into the course form.
	const saveProduct = (productValues) =>
		makeRequest({
			action: updateAction,
			...productValues,
			id: ID,
			title,
			slug,
			product_id: productValues?.product_id,
			download_id: productValues?.product_id,
		}).then((response) => {
			// An error's `data` is a message, not a product — never let it
			// overwrite the linked product id or the prices.
			if (!response.data.success) {
				dispatch(
					showNotification({
						message: __(`Something went wrong!`, 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return;
			}

			// Update Product Id
			setFieldValue(
				name,
				response?.data?.data?.product_id
					? response?.data?.data?.product_id
					: response?.data?.data?.download_id
			);

			if (response?.data?.data?.download_id) {
				setProduct({
					regular_price: response?.data?.data.regular_price,
					product_id: response?.data?.data?.download_id,
				});
			} else {
				setProduct(response?.data?.data);
			}

			onPriceCommitted(Number(productValues?.regular_price) || 0);

			dispatch(
				showNotification({
					message: __(`Price Updated`, 'academy'),
					isShow: true,
					type: 'success',
				})
			);
		});

	// A price typed in before the course was first saved couldn't create its
	// product then — there was no course to attach it to. That save has since
	// given the course an ID and remounted this panel, so create it now.
	useEffect(() => {
		const price = pendingPrice?.take(ID);
		if (price > 0 && !parseInt(productId)) {
			setProduct({ regular_price: price, sale_price: 0 });
			saveProduct({ regular_price: price, sale_price: 0 });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Formik
				enableReinitialize={true}
				initialValues={{
					id: ID,
					title: debounceTitle,
					slug,
					product_id: productId,
					regular_price: 0,
					sale_price: 0,
					...product,
				}}
				onSubmit={(values, { setSubmitting }) => {
					const price = Number(values?.regular_price) || 0;
					const hasProduct = Boolean(parseInt(productId));
					// No course to attach a product to yet — a new one is only
					// saved once it has a title.
					if (!ID) {
						if (!hasProduct && pendingPrice) {
							// Keep the price for right after that save instead
							// (see `PendingPriceContext`); emptying the field
							// drops one kept earlier.
							pendingPrice.set(price > 0 ? price : null);
							if (price > 0 && !title?.trim()) {
								dispatch(
									showNotification({
										message: __(
											'Add a course title to save the course. Its product will then be created with this price.',
											'academy'
										),
										isShow: true,
										type: 'info',
									})
								);
							}
						} else if (hasProduct || price > 0) {
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
						}
						setSubmitting(false);
						return;
					}
					// With no product linked yet, only an actual price creates
					// one — tabbing out of the empty field mustn't leave a $0
					// product behind. The title isn't required: the server
					// names the product after the saved course.
					if (!hasProduct && !(price > 0)) {
						setSubmitting(false);
						return;
					}
					setSubmitting(true);
					saveProduct(values).then(() => setSubmitting(false));
				}}
			>
				{({ values, submitForm }) => {
					if (parseInt(values?.regular_price)) {
						setError(
							values?.sale_price < parseInt(values?.regular_price)
								? false
								: true
						);
					}

					if (
						parseInt(values?.regular_price) !== 0 &&
						isRegularFieldDisabled &&
						(action === 'academy_pro_woo/get_product' ||
							action === 'academy_pro_woo/get_bundle_product')
					) {
						setTimeout(() => {
							setDisabled(true);
						}, 1000);
					}

					const showRegularPrice =
						action === 'academy_pro_woo/get_product' ||
						action === 'academy_pro_woo/get_bundle_product';

					return (
						<>
							<div className="academy-price-field">
								<div className="meta-field meta-field--woocommerce">
									<label htmlFor="regularPrice">
										<span className="academy-title">
											{priceLabel}
										</span>
									</label>
									<div className="academy-input">
										<Field
											id="regularPrice"
											className="academy-form-control"
											type="number"
											name="regular_price"
											placeholder={priceLabel}
											min="0"
											disabled={isDisabled}
											step="any"
											onBlur={submitForm}
										/>
										{/* <span className="academy-price-label">
											{__('USD', 'academy')}
										</span> */}
									</div>
								</div>
								{showRegularPrice && (
									<div
										className={`meta-field ${
											parseInt(productId) === 0 &&
											'meta-field--disabled'
										} meta-field--woocommerce`}
									>
										<label htmlFor="salePrice">
											<span className="academy-title">
												{__('Sale Price', 'academy')}
											</span>
										</label>
										<div className="academy-input">
											<Field
												id="salePrice"
												className="academy-form-control"
												type="number"
												name="sale_price"
												placeholder="Sale Price"
												min="0"
												step="any"
												disabled={
													parseInt(productId) === 0
												}
												onBlur={submitForm}
											/>
											{/* <span className="academy-price-label">
												{__('USD', 'academy')}
											</span> */}
										</div>
										<div>
											<p className="academy-sub-title">
												{description}
											</p>
											{isError && (
												<p className="academy-warning">
													{__(
														'Please enter a value less then the Regular Price',
														'academy'
													)}
												</p>
											)}
										</div>
									</div>
								)}
							</div>
						</>
					);
				}}
			</Formik>
		</>
	);
};

PaidProductPrice.propTypes = propTypes;
export default PaidProductPrice;
