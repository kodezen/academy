import React from 'react';
import Number from '@Components/Formik/Number';
import Select2 from '@Components/AcademySelect';
import { __ } from '@wordpress/i18n';
import { Field, Formik, useFormikContext } from 'formik';

const CustomForm = ({ productType, selectedItem, subscriptionDateType }) => {
	const { values, setFieldValue } = useFormikContext();
	return (
		<>
			{!selectedItem && (
				<>
					<label className="academy-add-store-product__label">
						{__('Type', 'academy')}
					</label>
					<Select2
						className="academy-select academy-select-store"
						placeholder={__('Select Price Type', 'academy')}
						value={values?.price_type}
						onChangeHandler={(val) => {
							setFieldValue('price_type', val || '');
						}}
						options={productType}
						isMulti={false}
					/>
				</>
			)}
			{values.price_type === 'subscription' && (
				<>
					<div className="academy-subsciption-fields academy-mt-4 ">
						<Number
							suffix="payment-durtion academy-width-full"
							name="payment_duration"
							placeholder={__('Eg: 0', 'academy')}
						/>
						<Select2
							className="academy-select academy-width-full"
							placeholder={__('Select Type', 'academy')}
							value={values?.payment_duration_type}
							options={subscriptionDateType}
							onChangeHandler={(val) => {
								setFieldValue('payment_duration_type', val);
							}}
						/>
					</div>
					<span className="storeengine-field-label">
						{__('Set Repeated Payment In Every *', 'academy')}
					</span>
				</>
			)}

			<div className="academy-add-store-product__price-fields">
				<div className="academy-column-items">
					<label className="academy-add-store-product__label">
						{__('Price', 'academy')}
					</label>
					<div className="academy-add-store-product__price academy-input">
						<Field
							type="number"
							name="price"
							placeholder={__('Price', 'academy')}
							min="0"
							step="any"
						/>
					</div>
				</div>

				{values.type !== 'predefined' && (
					<div className="academy-column-items">
						<label className="academy-add-store-product__label">
							{__('Compare Price', 'academy')}
						</label>
						<div className="academy-add-store-product__price academy-input">
							<Field
								type="number"
								name="compare_price"
								placeholder={__('Compare Price', 'academy')}
								min="0"
								step="any"
							/>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default CustomForm;
