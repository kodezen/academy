import React, { useRef } from 'react';
import { useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import PostSelect from '@Components/PostSelect';
import PaidProductPrice from '@Components/PaidProductSelect/PaidProductPrice';
import StorePaidProduct from '@Components/PaidProductSelect/storeProduct';
import { is_pro } from '@Utils/helper';
import { setLoadedFieldValue } from '../../helper';

/**
 * The price/product picker — a plain number input, or a linked
 * WooCommerce/EDD/StoreEngine product panel. Extracted out of
 * `CourseTypeBox` (Standard Course's Price row) so `GameEngineSection` can
 * reuse the exact same picker for a course that allows buying it outright
 * *in addition to* unlocking it with GameEngine points — same fields, same
 * meta keys, whichever caller set them. Each caller only mounts this while
 * its own option is actually selected/checked, so there's no "disabled"
 * state to render here — just shown or not.
 *
 * @param {Object}   props
 * @param {string}   props.monetizationEngine  `settings.data.monetization_engine`.
 * @param {boolean}  props.hasEngineName       WooCommerce or EDD is the configured engine.
 * @param {boolean}  props.isEnableStore       StoreEngine is the configured engine and active.
 * @param {boolean}  props.isDisablePaidCourseType No monetization engine configured at all.
 * @param {boolean}  props.isShowPriceFields
 * @param {boolean}  props.isForceProductCreation
 * @param {number}   props.plainPrice
 * @param {Function} props.onPriceCommitted      WooCommerce/EDD product price confirmed with the server.
 * @param {Function} props.onStorePriceCommitted  StoreEngine product price confirmed with the server.
 * @param {Function} props.reFetchData
 */
const PriceSection = ({
	monetizationEngine,
	hasEngineName,
	isEnableStore,
	isDisablePaidCourseType,
	isShowPriceFields,
	isForceProductCreation,
	plainPrice,
	onPriceCommitted,
	onStorePriceCommitted,
	reFetchData,
}) => {
	const formik = useFormikContext();
	const { values, setFieldValue } = formik;
	const formikRef = useRef(formik);
	formikRef.current = formik;

	return (
		<div className="meta-field--price-section">
			<p className="academy-sub-title">
				{hasEngineName || isEnableStore
					? __(
							'Set a price below to make this course paid — leave it empty to keep it free.',
							'academy'
						)
					: __(
							'Leave the price at 0 to keep this course free. Enter any amount to make it paid.',
							'academy'
						)}
			</p>

			{!hasEngineName && !isEnableStore && (
				<input
					className="academy-input"
					type="number"
					min="0"
					step="any"
					placeholder="0.00"
					value={values?.meta?.academy_course_price ?? 0}
					onChange={(e) => {
						// Always a real number, never '' — this meta is
						// registered with a REST schema `type: number`, and
						// saving an empty string against that schema is
						// rejected with a 400.
						const safe = Math.max(
							0,
							Number(e.target.value) || 0
						);
						setFieldValue('meta.academy_course_price', safe);
					}}
				/>
			)}

			{!isDisablePaidCourseType && hasEngineName && (
				<div className="academy-post-form-group-wrapper">
					<PostSelect
						name={
							monetizationEngine === 'woocommerce'
								? `meta.academy_course_product_id`
								: 'meta.academy_course_download_id'
						}
						action={
							monetizationEngine === 'woocommerce'
								? 'academy_woo/fetch_products'
								: 'academy_edd/fetch_downloads'
						}
						placeholder={__(
							'Search and select a product',
							'academy'
						)}
						title={__('Select product', 'academy')}
						subtitle={__('(When selling the course)', 'academy')}
						postType={
							monetizationEngine === 'woocomerce'
								? 'product'
								: 'download'
						}
						desc={
							<>
								{hasEngineName ? (
									<>
										{monetizationEngine ===
											'woocommerce' &&
										is_pro
											? __(
													'You have the option to choose an existing WooCommerce product, or a new one will be generated for you.',
													'academy'
												)
											: monetizationEngine ===
													'woocommerce' &&
												__(
													'Select a product manually that you created on WooCommerce. Otherwise, upgrade to Pro to auto-generate a product.',
													'academy'
												)}
										{monetizationEngine === 'edd' &&
										is_pro
											? __(
													'You have the option to choose an existing Easy Digital Downloads product, or a new one will be generated for you.',
													'academy'
												)
											: monetizationEngine === 'edd' &&
												__(
													'Select a product manually that you created on Easy Digital Downloads. Otherwise, upgrade to Pro to auto-generate a product.',
													'academy'
												)}
									</>
								) : (
									<>
										{__(
											'Sell your product, process by WooCommerce',
											'academy'
										)}
									</>
								)}
							</>
						}
					/>

					{isShowPriceFields && (
						<PaidProductPrice
							action={
								monetizationEngine === 'woocommerce'
									? 'academy_pro_woo/get_product'
									: 'academy_edd/get_download'
							}
							updateAction={
								monetizationEngine === 'woocommerce'
									? 'academy_pro_woo/create_or_update_product'
									: 'academy_pro_edd/create_or_update_download'
							}
							productId={
								monetizationEngine === 'woocommerce'
									? values?.meta?.academy_course_product_id
									: values?.meta?.academy_course_download_id
							}
							name={
								monetizationEngine === 'woocommerce'
									? 'meta.academy_course_product_id'
									: 'meta.academy_course_download_id'
							}
							setFieldValue={setFieldValue}
							isForceProductCreation={isForceProductCreation}
							isRegularFieldDisabled={
								monetizationEngine === 'woocommerce' ||
								monetizationEngine === 'edd'
									? false
									: true
							}
							title={values?.title ? values?.title : ''}
							regularPrice={plainPrice}
							priceLabel={__('Price', 'academy')}
							onPriceCommitted={onPriceCommitted}
							// Deleted in WooCommerce/EDD since it was linked.
							// Unlink it as a loaded value, not an edit — just
							// opening the course shouldn't flag unsaved changes.
							onProductMissing={() =>
								setLoadedFieldValue(
									formikRef.current,
									monetizationEngine === 'woocommerce'
										? 'meta.academy_course_product_id'
										: 'meta.academy_course_download_id',
									0
								)
							}
						/>
					)}
				</div>
			)}

			{!isDisablePaidCourseType && isEnableStore && (
				<StorePaidProduct
					reFetchData={reFetchData}
					title={values?.title ? values?.title : ''}
					onPriceCommitted={onStorePriceCommitted}
				/>
			)}
		</div>
	);
};

export default PriceSection;
