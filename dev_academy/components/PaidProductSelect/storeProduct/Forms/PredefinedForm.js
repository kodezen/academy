import React from 'react';
import Select2 from '@Components/AcademySelect';
import { __ } from '@wordpress/i18n';
import { Field, Formik, useFormikContext } from 'formik';

const PredefinedForm = ({ productsPrices, selectedProductPriceList }) => {
	const { values, setFieldValue, setValues, resetForm } = useFormikContext();

	return (
		<>
			<Select2
				className="academy-select academy-select-store"
				placeholder={__('Price', 'academy')}
				value={values?.price_id}
				onChangeHandler={(val) => {
					if (val) {
						if (selectedProductPriceList.length > 0) {
							const { id, ...restFilteredPrice } =
								selectedProductPriceList.find(
									(item) =>
										parseInt(item.id) === parseInt(val)
								);
							setValues({
								...values,
								price_id: id,
								...restFilteredPrice,
							});
						}
					} else {
						setFieldValue('price_type', '');
						setFieldValue('price_id', '');
						setFieldValue('price_name', '');
						setFieldValue('compare_price', '');
					}
				}}
				options={productsPrices}
				isClearable={true}
				isMulti={false}
			/>
		</>
	);
};

export default PredefinedForm;
