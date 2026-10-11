import React from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { makeRequest } from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { useState, useEffect } from 'react';
import ReactModalFormik from '@Components/Modal/ReactModalFormik';
import FormInner from './FormInner';
import './styles.scss';

const BulkPurchase = () => {
	const dispatch = useDispatch();
	const [content, setContent] = useState('existing_groups');
	const [isOpenModal, setOpenModal] = useState(false);
	const [product_id, setProductId] = useState(0);
	const [groups, setGroups] = useState([]);

	const getGroups = () => {
		makeRequest({
			action: 'academy_pro_group_plus/frontend/ecommerce/get_groups',
		}).then((res) => {
			console.log(res?.data?.data);

			if (res?.data?.data?.data?.length > 0) {
				setGroups(res?.data?.data?.data);
				setOpenModal(true);
			}
		});
	};

	const handleChange = (value) => {
		setContent(value);
	};

	useEffect(() => {
		const purchaseBtn = document.querySelectorAll('.bulk-purchase-btn');
		purchaseBtn.forEach((button) => {
			button.style.marginTop = '20px';
			button.addEventListener('click', () => {
				getGroups();
			});

			return () => {
				button.removeEventListener('click');
			};
		});
	}, []);

	useEffect(() => {
		const academy_product_id = document.querySelectorAll(
			'#academy_product_id'
		);
		academy_product_id.forEach((input) => {
			setProductId(input.value);
		});
	}, [isOpenModal]);

	const groupOptions =
		groups.length > 0 &&
		groups?.map((group) => ({
			value: group.id,
			label: group.name,
		}));

	return (
		<ReactModalFormik
			isOpen={isOpenModal}
			title={__('Bulk Purchase', 'academy')}
			submitButtonLabel={__('Purchase', 'academy')}
			suffix="bulk-purchase"
			size="small"
			onRequestClose={() => setOpenModal(false)}
			formik={{
				enableReinitialize: true,
				initialValues: {
					quantity: 1,
					group_name: '',
					group_id: 0,
					product_id,
					type: 'group_existing',
				},
				onSubmit: (values, actions) => {
					const { group_id, ...rest } = values;
					const params = rest;

					if (content === 'group_existing') {
						params.group_id = group_id;
					}

					makeRequest({
						action: 'academy_pro_group_plus/frontend/ecommerce/add_to_cart',
						...params,
					}).then(
						({
							data: {
								data: { message, cart_url },
							},
						}) => {
							dispatch(
								showNotification({
									message,
									isShow: true,
									type: 'success',
								})
							);
							window.location.href = cart_url;
						}
					);
				},
			}}
		>
			<FormInner
				content={content}
				handleChange={handleChange}
				groupOptions={groupOptions}
			/>
		</ReactModalFormik>
	);
};

export default BulkPurchase;
