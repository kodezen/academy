import React, { useEffect, useState } from 'react';
import Button from '@Components/Button';
import PreLoader from '@Components/Loader/Preloader';
import { __ } from '@wordpress/i18n';
import AddProduct from './AddProduct';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { makeRequest, storeengine_is_active } from '@Utils/helper';
import { useDispatch } from 'react-redux';
import { useFormikContext } from 'formik';
import './styles.scss';

const StorePaidProduct = ({
	title = '',
	action = 'academy_storeengine/get_product',
	updateAction = 'academy_storeengine/save_product',
	reFetchData,
	// Reports the actual, currently-saved StoreEngine price back to the
	// caller (`CourseType/index.js`), the same role `onPriceCommitted` plays
	// for the WooCommerce/EDD path's `PaidProductPrice` — this is what lets
	// the course's Free/Paid derivation reflect the *real* purchasable
	// product's price instead of a second, disconnected number. Never
	// called before the initial fetch resolves (see `hasFetchedInitial`
	// below), for the same reason `lastPrice` starts `null`: firing early
	// with 0 would flash an existing paid course to "free" for a render.
	onPriceCommitted = () => {},
}) => {
	const { values } = useFormikContext();
	const { post_ID, id } = values;
	const ID = post_ID ? post_ID : id;
	const [productPrices, setProductPrices] = useState([]);
	const [priceData, setPriceData] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [loading, setLoading] = useState(priceData?.length && title);
	const [showForm, isShowForm] = useState(!priceData?.length);
	const [newProduct, isNewProduct] = useState(true);
	const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
	const dispatch = useDispatch();

	const getProductByCourseId = async () => {
		await makeRequest({
			action,
			course_id: ID,
		}).then(({ data: { data, success } }) => {
			if (success) {
				if (data?.prices) {
					setProductPrices(data.prices);
					isShowForm(!data.prices.length);
				}
			}
		});
	};

	useEffect(() => {
		(async () => {
			if (ID && storeengine_is_active) {
				setLoading(true);
				await getProductByCourseId();
				setLoading(false);
				setHasFetchedInitial(true);
			} else {
				setLoading(false);
			}
		})();
	}, [ID, storeengine_is_active]);

	useEffect(() => {
		let dataArray = [];

		if (productPrices && productPrices.length > 0) {
			dataArray = [...dataArray, ...productPrices];
		}

		setPriceData(dataArray);

		// Only one price entry is expected per course in practice (the
		// summary list is built for that), so the first entry is the price
		// that matters for the free/paid derivation.
		if (hasFetchedInitial) {
			onPriceCommitted(Number(dataArray?.[0]?.price) || 0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productPrices, hasFetchedInitial]);

	const handleDeletePrice = (priceToDelete) => {
		let filteredPrices = [];
		let removeAction = '';
		let params = {
			course_id: ID,
		};

		removeAction = updateAction;
		filteredPrices = productPrices.filter(
			(price) => price !== priceToDelete
		);
		params = {
			...params,
			course_title: title,
			prices: filteredPrices,
		};
		setProductPrices(filteredPrices);

		makeRequest({
			action: removeAction,
			...params,
		}).then(({ data: { data, success } }) => {
			if (success) {
				isShowForm(!filteredPrices.length);
				setPriceData([...filteredPrices]);
			} else {
				dispatch(
					showNotification({
						message: data.message,
						isShow: true,
						type: 'error',
					})
				);
			}
		});
	};

	return (
		<div className="academy-store-paid-products-wrapper">
			{loading ? (
				<PreLoader />
			) : (
				<ul className="academy-store-paid-products">
					{priceData?.length > 0 &&
						priceData.map((product, index) => {
							return (
								<React.Fragment key={index}>
									<li className="academy-store-paid-products__item">
										<span className="academy-store-paid-product__item-title">
											{`${product?.price_name ?? ''} . ${
												product?.price ?? ''
											}`}
										</span>
										<div className="academy-store-paid-products__item-actions">
											<Button
												icon={
													<span className="academy-icon academy-icon--edit"></span>
												}
												suffix="product-edit"
												border="gray"
												preset="white"
												onClick={() => {
													if (selectedItem) {
														setSelectedItem(null);
													} else {
														setSelectedItem(
															product
														);
													}
													isShowForm(!showForm);
												}}
											/>

											<Button
												icon={
													<span className="academy-icon academy-icon--trash"></span>
												}
												suffix="product-delete"
												border="gray"
												preset="white"
												onClick={() =>
													handleDeletePrice(product)
												}
											/>
										</div>
									</li>
								</React.Fragment>
							);
						})}

					<AddProduct
						productPrices={[...productPrices]}
						setProductPrices={setProductPrices}
						title={title}
						selectedItem={selectedItem}
						newProduct={newProduct}
						isNewProduct={isNewProduct}
						updateAction={updateAction}
						showForm={showForm}
						isShowForm={isShowForm}
						ID={ID}
						setSelectedItem={setSelectedItem}
						priceData={priceData}
						reFetchData={reFetchData} //ask tanjir bhai the usecase
					/>
				</ul>
			)}
		</div>
	);
};

export default StorePaidProduct;
