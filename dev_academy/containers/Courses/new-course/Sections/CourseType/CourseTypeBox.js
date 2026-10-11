import React from 'react';
import { useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import Select2 from '@Components/AcademySelect';
import {
	admin_url,
	plugin_root_url,
	getAddonActiveStatus,
	woocommerce_is_active,
	edd_is_active,
	pmpro_is_active,
	storeengine_is_active,
	is_pro,
} from '@Utils/helper';
import { updateSettings } from '@Redux/Slices/settingsSlice/settingsSlice';
import TypeOption from './TypeOption';
import PriceSection from './PriceSection';
import GameEngineSection from './GameEngineSection';

/**
 * The "Course Type" box's flat list of mutually-exclusive options: the
 * Free/Paid price picker (a plain input, or a linked WooCommerce/EDD/
 * StoreEngine product panel), the Public/RCP/MemberPress/GameEngine Unlock
 * tiles, and each tile's own sub-picker/panel — only the currently active
 * type's panel renders, not a greyed-out preview of every other one.
 *
 * Free vs Paid is derived from price rather than picked directly, and the
 * special-type mutual exclusivity is owned by the `CourseType` orchestrator
 * (`toggleSpecialType`) — this component only renders what that state says.
 *
 * @param {Object}   props
 * @param {boolean}  props.showPaidType
 * @param {boolean}  props.inPriceMode
 * @param {number}   props.effectivePrice
 * @param {Function} props.selectPriceMode
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
 * @param {Array}    props.typesData
 * @param {Function} props.toggleSpecialType
 * @param {string}   props.message              eCommerce-engine-not-active warning text, if any.
 * @param {boolean}  props.showWarningText       No engine configured while a price is set.
 * @param {boolean}  props.isMembershipActive
 * @param {boolean}  props.isMemberpressActive
 * @param {Array}    props.membershipData
 * @param {Array}    props.memberpressData
 * @param {Function} props.fetchHandler
 * @param {boolean}  props.loading
 * @param {boolean}  props.isGameEngineActive        Whether `academy_course_type` is currently `gameengine_membership`.
 * @param {boolean}  props.isGameEnginePluginActive  Whether the free GameEngine plugin is active.
 * @param {boolean}  props.isGameEngineProActive     Whether GameEngine Pro is active (gates the nudge sub-control).
 * @param {boolean}  props.showGameEngineOption      Whether the GameEngine unlock toggle should render at all.
 */
const CourseTypeBox = ({
	showPaidType,
	inPriceMode,
	effectivePrice,
	selectPriceMode,
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
	typesData,
	toggleSpecialType,
	message,
	showWarningText,
	isMembershipActive,
	isMemberpressActive,
	membershipData,
	memberpressData,
	fetchHandler,
	loading,
	isGameEngineActive,
	isGameEnginePluginActive,
	isGameEngineProActive,
	showGameEngineOption,
}) => {
	const { values, setFieldValue } = useFormikContext();
	const currentType = values?.meta?.academy_course_type;
	const allowPurchase = !!values?.meta?.academy_courses_gameengine_allow_purchase;
	const dispatch = useDispatch();
	const allAddons = useSelector((state) => state.addons);

	// The same plugin/addon-active checks Settings > Payments > Engine uses
	// to decide which engines are actually pickable — only those show up
	// here, so this inline picker can't offer an engine with nothing behind
	// it (same guard that page's own toggle has).
	const pickableEngines = [
		{
			value: 'storeengine',
			label: __('StoreEngine', 'academy'),
			isActive: storeengine_is_active,
		},
		{
			value: 'woocommerce',
			label: __('WooCommerce', 'academy'),
			isActive:
				woocommerce_is_active &&
				getAddonActiveStatus(allAddons, 'woocommerce'),
		},
		{
			value: 'edd',
			label: __('Easy Digital Downloads', 'academy'),
			isActive:
				edd_is_active &&
				getAddonActiveStatus(allAddons, 'easy-digital-downloads'),
		},
		{
			value: 'paid-memberships-pro',
			label: __('Paid Memberships Pro', 'academy'),
			isActive:
				is_pro &&
				pmpro_is_active &&
				getAddonActiveStatus(allAddons, 'paid-memberships-pro'),
		},
	].filter((engine) => engine.isActive);

	const selectEngine = (value) => {
		if (!value) {
			return;
		}
		dispatch(updateSettings({ values: { monetization_engine: value } }));
	};

	return (
		<div className="meta-field meta-field--course-type">
			<div className="meta-field__body">
						{showPaidType && (
							<div
								role="button"
								tabIndex={0}
								onClick={selectPriceMode}
								onKeyDown={(e) => {
									if ('Enter' === e.key || ' ' === e.key) {
										e.preventDefault();
										selectPriceMode();
									}
								}}
								className={`academy-radio-custom academy-course-types-label academy-course-types-label__price ${
									inPriceMode
										? 'academy-label-is-active'
										: ''
								}`}
							>
								<span className="academy-label-text">
									{__('Price', 'academy')}
								</span>
								<span className="academy-course-types-label__indicator">
									{inPriceMode &&
										(isGameEngineActive ? (
											// `academy_course_type` is
											// `gameengine_membership` the
											// entire time this is on — never
											// actually `paid`/`free`
											// underneath, so this is a
											// manual Unlockable/Paid-or-
											// Unlockable toggle here, same
											// slot Paid/Free uses below,
											// rather than a plain label —
											// a price can be attached and
											// deliberately declined, same
											// as Free ignores an attached
											// price. Only a real toggle
											// once there's a price to
											// decline or offer; otherwise
											// (no price at all) there's
											// nothing to choose between, so
											// it stays a plain label like
											// Free's own no-price case.
											effectivePrice > 0 ? (
												<span
													className="academy-price-status-toggle"
													onClick={(e) =>
														e.stopPropagation()
													}
												>
													<button
														type="button"
														className={`academy-price-status-badge is-unlockable${
															!allowPurchase
																? ' is-active'
																: ' is-inactive'
														}`}
														onClick={() =>
															setFieldValue(
																'meta.academy_courses_gameengine_allow_purchase',
																false
															)
														}
													>
														{__(
															'Unlock',
															'academy'
														)}
													</button>
													<button
														type="button"
														className={`academy-price-status-badge is-hybrid${
															allowPurchase
																? ' is-active'
																: ' is-inactive'
														}`}
														onClick={() =>
															setFieldValue(
																'meta.academy_courses_gameengine_allow_purchase',
																true
															)
														}
													>
														{__(
															'Paid or Unlock',
															'academy'
														)}
													</button>
												</span>
											) : (
												<span className="academy-price-status-badge is-unlockable is-active">
													{__(
														'Unlockable',
														'academy'
													)}
												</span>
											)
										) : effectivePrice > 0 ? (
											// A real price/product is already
											// configured — Paid/Free becomes a
											// manual toggle instead of a plain
											// label: picking Free doesn't touch
											// the underlying price data, so
											// picking Paid again just goes back
											// to charging the same amount.
											<span
												className="academy-price-status-toggle"
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<button
													type="button"
													className={`academy-price-status-badge is-paid${
														currentType === 'paid'
															? ' is-active'
															: ' is-inactive'
													}`}
													onClick={() =>
														setFieldValue(
															'meta.academy_course_type',
															'paid'
														)
													}
												>
													{__('Paid', 'academy')}
												</button>
												<button
													type="button"
													className={`academy-price-status-badge is-free${
														currentType === 'free'
															? ' is-active'
															: ' is-inactive'
													}`}
													onClick={() =>
														setFieldValue(
															'meta.academy_course_type',
															'free'
														)
													}
												>
													{__('Free', 'academy')}
												</button>
											</span>
										) : (
											<span className="academy-price-status-badge is-free is-active">
												{__('Free', 'academy')}
											</span>
										))}
									<input
										type="radio"
										checked={inPriceMode}
										disabled
										readOnly
									/>
									<span className="academy-radio-custom--mod"></span>
								</span>
							</div>
						)}

						{/* Callers that can't offer Paid (e.g. the YouTube
						playlist import: no product is created) still need
						Free to be pickable, otherwise Public is the only
						visible option and the default Free is invisible. */}
						{!showPaidType && (
							<div
								role="button"
								tabIndex={0}
								onClick={selectPriceMode}
								onKeyDown={(e) => {
									if ('Enter' === e.key || ' ' === e.key) {
										e.preventDefault();
										selectPriceMode();
									}
								}}
								className={`academy-radio-custom academy-course-types-label academy-course-types-label__price ${
									inPriceMode ? 'academy-label-is-active' : ''
								}`}
							>
								<span className="academy-label-text">
									{__('Free', 'academy')}
								</span>
								<span className="academy-course-types-label__indicator">
									<input
										type="radio"
										checked={inPriceMode}
										disabled
										readOnly
									/>
									<span className="academy-radio-custom--mod"></span>
								</span>
							</div>
						)}

						{showPaidType && inPriceMode && (
							// Greyed out (not deleted, not hidden) once
							// GameEngine is on and the admin has picked
							// "Unlockable", or once the admin has manually
							// picked "Free" while a price/product is still
							// attached — same `.meta-field--price-disabled`
							// treatment Public/RCP/MemberPress already get
							// when they make the Price section inactive, so
							// a price left over from before reads as clearly
							// inert instead of looking like it's still the
							// active way in. Never needs deleting to get a
							// genuinely points-only course — same reason
							// Free doesn't delete the price either. Gated on
							// `effectivePrice` too: a brand-new course defaults
							// to Free with no price at all, and typing a price
							// into this same section is how it becomes Paid —
							// disabling the section outright on Free would lock
							// that path shut.
							<div
								className={
									(isGameEngineActive && !allowPurchase) ||
									(currentType === 'free' && effectivePrice > 0)
										? 'meta-field--price-disabled'
										: ''
								}
							>
								<PriceSection
									monetizationEngine={monetizationEngine}
									hasEngineName={hasEngineName}
									isEnableStore={isEnableStore}
									isDisablePaidCourseType={
										isDisablePaidCourseType
									}
									isShowPriceFields={isShowPriceFields}
									isForceProductCreation={
										isForceProductCreation
									}
									plainPrice={plainPrice}
									onPriceCommitted={onPriceCommitted}
									onStorePriceCommitted={
										onStorePriceCommitted
									}
									reFetchData={reFetchData}
								/>
							</div>
						)}

						{showWarningText && (
							<div className="academy-engine-warning">
								<div className="academy-engine-warning__notice">
									<span className="academy-icon academy-icon--information academy-engine-warning__icon"></span>
									<p className="academy-engine-warning__text">
										{__('Please Select ', 'academy')}
										<a
											className="academy-engine-warning__link"
											target="__blank"
											href={`${admin_url}admin.php?page=academy-settings&path=payments&tab=engine`}
										>
											{__('eCommerce Engine', 'academy')}
										</a>
										{__(' from settings', 'academy')}
									</p>
								</div>

								{pickableEngines.length > 0 && (
									<div className="academy-engine-warning__field">
										<label className="academy-engine-warning__field-label">
											{__(
												'Select eCommerce Engine',
												'academy'
											)}
											<span className="academy-required-field">
												*
											</span>
										</label>
										<div className="academy-engine-warning__select-wrap">
											<img
												className="academy-engine-warning__select-icon"
												src={
													plugin_root_url +
													'assets/images/shop.svg'
												}
												alt=""
											/>
											<Select2
												className="academy-select academy-select-engine-inline"
												placeholder={__(
													'Choose an engine',
													'academy'
												)}
												value=""
												onChangeHandler={selectEngine}
												options={pickableEngines}
												isSearchable={false}
												isClearable={false}
												isMulti={false}
											/>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Shown regardless of Free/Paid — GameEngine Unlock
						is a second, independent way to gate the course
						(points instead of, or alongside, a price), not
						strictly an add-on to paying. A Free course can
						still turn this on to stop being open-to-everyone
						and become points-gated instead, with no purchase
						fallback at all (server-side, `has_price()` is
						false so the purchase branch in
						`Course_Unlock::modify_course_type()` never fires —
						it's genuinely GameEngine-only in that case). */}
						{showPaidType && inPriceMode && showGameEngineOption && (
							<>
								{/* Rendered as a sibling here, not inside
								GameEngineSection's own
								`.meta-field--course-type__rcp` wrapper
								(shared with the RCP/MemberPress select
								boxes below, and boxed with its own
								background/border) — the OR needs to read
								as sitting between the Price section and
								that box, not as the first thing inside
								it. */}
								<div className="academy-gameengine-or-divider">
									<span>{__('OR', 'academy')}</span>
								</div>
								<div className="meta-field--course-type__rcp">
									<GameEngineSection
										isPluginActive={
											isGameEnginePluginActive
										}
										isProActive={isGameEngineProActive}
										isGameEngineActive={isGameEngineActive}
										hasPrice={effectivePrice > 0}
										onToggle={() =>
											toggleSpecialType(
												'gameengine_membership'
											)
										}
									/>
								</div>
							</>
						)}

						<div className="meta-field__body__types">
							{typesData.map((type, index) => (
								<TypeOption
									key={index}
									type={type}
									isActive={
										values?.meta?.academy_course_type ===
										type.value
									}
									onSelect={toggleSpecialType}
								/>
							))}
						</div>

						{message && (
							<div className="academy-warning-message">
								<div className="academy-warning-message__top">
									<span className="academy-icon academy-icon--notify-error"></span>
									<span className="academy-warning-message__top-title">
										{__('Warning', 'academy')}
									</span>
								</div>
								<div className="academy-warning-message__body">
									{message}
								</div>
							</div>
						)}

						{isMembershipActive && (
							<div className="meta-field--course-type__rcp">
								<Select2
									className="academy-select academy-select-membership"
									placeholder={__(
										'Select Membership',
										'academy'
									)}
									value={
										values?.meta
											?.academy_rcp_membership_levels
											? membershipData.filter((item) =>
													values?.meta?.academy_rcp_membership_levels.includes(
														item.value
													)
												)
											: []
									}
									onChangeHandler={(selected) => {
										const filteredValues = selected.map(
											(item) => item.value
										);
										setFieldValue(
											'meta.academy_rcp_membership_levels',
											filteredValues
										);
									}}
									onInputChange={fetchHandler}
									options={membershipData}
									isSearchable={true}
									isLoading={loading}
									isClearable={true}
									isMulti={true}
								/>
							</div>
						)}

						{isMemberpressActive && (
							<div className="meta-field--course-type__rcp">
								<Select2
									className="academy-select academy-select-membership"
									placeholder={__(
										'Select Membership',
										'academy'
									)}
									value={
										values?.meta
											?.academy_courses_mempr_membership_id
									}
									onChangeHandler={(val) =>
										setFieldValue(
											'meta.academy_courses_mempr_membership_id',
											val || ''
										)
									}
									options={memberpressData}
									isSearchable={true}
									isLoading={loading}
									isClearable={true}
									isMulti={false}
								/>
							</div>
						)}

			</div>
		</div>
	);
};

export default CourseTypeBox;
