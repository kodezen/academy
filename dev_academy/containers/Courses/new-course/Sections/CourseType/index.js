import React, { useEffect, useRef, useState } from 'react';
import { useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import Tooltip from '@Components/Tooltip';
import {
	woocommerce_is_active,
	can_manage_addons,
	current_user_can,
	is_pro,
	makeRequest,
	getAddonActiveStatus,
	storeengine_is_active,
	active_plugins,
} from '@Utils/helper';
import { getCourse } from '@Redux/Slices/courseSlice/courseSlice';
import { getCourseInitialValues } from '../../helper';
import { useSelector, useDispatch } from 'react-redux';
import CourseTypeBox from './CourseTypeBox';
import '../../styles/_postbox.scss';
import '../../styles/_meta-field.scss';

// Course types that replace price-driven Free/Paid entirely — picking any one
// of these disables the Price section rather than coexisting with it. Kept as
// one list so a new special type only has to be added here + `typesData`.
// `gameengine_membership` deliberately isn't here any more — it now lives
// *inside* the Price row as a toggle instead of its own exclusive tile, so
// it must stay in price mode rather than disabling it.
const SPECIAL_COURSE_TYPES = ['public', 'rcp_membership', 'mempr_membership'];

/**
 * Orchestrates the single "Course Type" box: a flat list of mutually
 * exclusive options — Public, RCP, MemberPress — plus one "Purchase or
 * Unlock" row that covers Free/Paid pricing AND GameEngine's points-based
 * unlock together, since a course can combine both (the GameEngine toggle
 * inside that row just adds `academy_courses_gameengine_allow_purchase`'s
 * rule evaluation on top of the same price, rather than being a separate
 * type to pick instead of pricing). Owns the shared `academy_course_type`
 * state and hands the actual rendering to `CourseTypeBox`.
 */
const CourseType = ({ showPaidType = true, showRcpType = true }) => {
	const settings = useSelector((state) => state.settings);
	const allAddons = useSelector((state) => state.addons);
	const [loading, isLoading] = useState(false);
	const [membershipData, setMembershipData] = useState([]);
	const [memberpressData, setMemberpressData] = useState([]);
	// The last price PaidProductPrice actually confirmed with the server
	// (initial fetch of the linked product, or a successful save). `null`
	// means "not known yet" — the free/paid derivation effect below must not
	// act until a real value has come back, or an existing paid course would
	// flash to "free" for the instant before its product's price loads.
	const [lastPrice, setLastPrice] = useState(null);
	// Same role as `lastPrice`, but for the StoreEngine product panel
	// (`StorePaidProduct`) instead of the WooCommerce/EDD one — StoreEngine's
	// own linked product is the thing that's actually purchasable, so its
	// real price (not a second, disconnected number) has to drive the
	// free/paid derivation when StoreEngine is the configured engine.
	const [storePrice, setStorePrice] = useState(null);
	const { values, setFieldValue, setValues } = useFormikContext();
	const dispatch = useDispatch();

	const currentType = values?.meta?.academy_course_type;
	const isSpecialType = SPECIAL_COURSE_TYPES.includes(currentType);
	// Free vs Paid is derived from price, not picked — this is true whenever
	// the course isn't one of the special types (covers 'free', 'paid', and
	// defensively any legacy/unexpected value).
	const inPriceMode = !isSpecialType;

	const monetizationEngine = settings?.data?.monetization_engine;
	const isDisablePaidCourseType = !monetizationEngine;
	const isShowPriceFields = current_user_can.manage_options
		? is_pro
		: is_pro && settings?.data?.is_instructor_update_course_price;
	const isForceProductCreation =
		currentType === 'paid' &&
		((monetizationEngine === 'woocommerce' &&
			values?.meta?.academy_course_product_id !== 0) ||
			(monetizationEngine === 'edd' &&
				0 !== values?.meta?.academy_course_download_id))
			? false
			: true;

	const isMembershipActive = currentType === 'rcp_membership';
	const isMemberpressActive = currentType === 'mempr_membership';
	const isGameEngineActive = currentType === 'gameengine_membership';

	const hasEngineName =
		monetizationEngine === 'woocommerce' || monetizationEngine === 'edd';
	const isEnableStore =
		monetizationEngine === 'storeengine' && storeengine_is_active;
	// The canonical price: when WooCommerce/EDD or StoreEngine is wired up,
	// the linked product's own price (reported async via onPriceCommitted)
	// is authoritative — that product is the only thing actually
	// purchasable, so a course can't really be "paid" without it, whatever
	// a separate plain-number field might say. The plain
	// `academy_course_price` field only matters when there's no monetization
	// engine configured at all, since in that case there's no product
	// concept to be authoritative instead.
	const plainPrice = Number(values?.meta?.academy_course_price) || 0;
	const effectivePrice = hasEngineName
		? lastPrice
		: isEnableStore
			? storePrice
			: plainPrice;
	const showWarningText = isDisablePaidCourseType && effectivePrice > 0;
	const isDisableMembership = getAddonActiveStatus(
		allAddons,
		'restrict-content-pro'
	);
	const isMemberPressAddon = getAddonActiveStatus(allAddons, 'member-press');

	// A course that already has a price/product can still be manually kept
	// Free (the Paid/Free toggle in `CourseTypeBox`'s price badge) without
	// losing that price — so this can't just force academy_course_type from
	// price on every render. It's a *new* price (0 → priced) or a price
	// being cleared (priced → 0) — while editing, live in this session —
	// that should still auto-flip the type, matching the existing
	// "type a price, it becomes Paid" convenience. Loading an *existing*
	// course's already-priced product for the first time must not re-run
	// that same logic — the saved `academy_course_type` (possibly a manual
	// Free chosen in an earlier session) is authoritative until this session
	// actually changes the price itself.
	const isExistingCourseRef = useRef(
		Boolean(values?.post_ID || values?.id)
	);
	const hasSeenFirstPriceRef = useRef(false);
	useEffect(() => {
		if (
			isSpecialType ||
			// GameEngine unlock is now a toggle inside price mode rather
			// than its own excluded special type — the price/product panel
			// stays visible and editable while it's on, but a price change
			// must never silently flip `academy_course_type` back to
			// free/paid and undo the admin's toggle.
			isGameEngineActive ||
			(hasEngineName && lastPrice === null) ||
			(isEnableStore && storePrice === null)
		) {
			return;
		}
		if (isExistingCourseRef.current && !hasSeenFirstPriceRef.current) {
			hasSeenFirstPriceRef.current = true;
			return;
		}
		hasSeenFirstPriceRef.current = true;
		const nextType = effectivePrice > 0 ? 'paid' : 'free';
		if (nextType !== currentType) {
			setFieldValue('meta.academy_course_type', nextType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [effectivePrice]);

	const reFetchData = () => {
		dispatch(getCourse(parseInt(values?.post_ID))).then((payload) => {
			const updatedPayload = {
				...payload.payload,
				meta: {
					...payload.payload.meta,
					academy_course_type: 'paid',
				},
			};

			setValues(
				getCourseInitialValues(values?.post_ID, [updatedPayload])
			);
		});
	};

	const rcpTab =
		showRcpType && isDisableMembership && is_pro
			? [
					{
						label: __('RCP', 'academy'),
						value: 'rcp_membership',
						isPro: true,
					},
				]
			: [];

	const memberTabs =
		showRcpType && isMemberPressAddon && is_pro
			? [
					{
						label: __('MMP', 'academy'),
						value: 'mempr_membership',
						isPro: true,
					},
				]
			: [];

	// GameEngine Unlock is no longer its own tile in this list — it's a
	// toggle inside the Price row instead (see
	// `CourseTypeBox`/`GameEngineSection`), since a course can combine
	// GameEngine's rules with a real price and forcing an either/or tile
	// choice misrepresented that.
	//
	// The base integration is FREE now (free Academy + free GameEngine), so
	// there's no `is_pro` gate. The toggle always shows; when the GameEngine
	// plugin itself is inactive, it renders the same locked-preview pattern
	// Course Settings uses for an off addon (`ProLockedContent`,
	// `isProFeature={false}`) — a blurred preview of the section with an
	// overlay linking to Add-ons. One sub-control (the student "close to
	// unlocking" nudge) is the actual GameEngine Pro upsell — disabled with
	// a "Requires GameEngine Pro" warning when gameengine-pro is off.
	const isGameEnginePluginActive = !!active_plugins?.gameengine_is_active;
	const isGameEngineProActive = !!active_plugins?.gameengine_pro_is_active;
	// Only an admin sees the locked preview while the plugin is off; an
	// instructor can't install it, so the toggle is left out for them.
	const showGameEngineOption =
		showRcpType && (isGameEnginePluginActive || can_manage_addons);

	const typesData = [
		// Without Pro the Public tile is an upgrade prompt — admin-only.
		...(is_pro || can_manage_addons
			? [
					{
						label: __('Public', 'academy'),
						value: 'public',
						isPro: true,
					},
				]
			: []),
		...rcpTab,
		...memberTabs,
	];

	useEffect(() => {
		if (currentType === 'rcp_membership') {
			fetchHandler();
		}
		if (currentType === 'mempr_membership') {
			fetchMemberPress();
		}
	}, [currentType]);
	const fetchHandler = (keyword = '') => {
		isLoading(true);
		makeRequest({
			action: 'academy_pro_restrict_content_pro/get_rcp_membership_levels',
			// keyword,
		}).then((res) => {
			setMembershipData(res.data.data);
			isLoading(false);
		});
	};
	const fetchMemberPress = () => {
		isLoading(true);
		makeRequest({
			action: 'academy_pro_memberpress/admin/get_memberships',
		}).then((res) => {
			const formatted = res.data.data.map((item) => ({
				value: item.membership_id,
				label: item.membership_title,
			}));

			setMemberpressData(formatted);
			isLoading(false);
		});
	};

	// Special-type tiles act as toggles rather than plain radios: picking the
	// active one again clears it and returns to price mode (there's no
	// separate "Price" tile to click back to — price mode is simply "none of
	// these are selected"), recomputed from the last known price exactly like
	// the initial derivation above.
	const toggleSpecialType = (typeValue) => {
		if (currentType === typeValue) {
			setFieldValue(
				'meta.academy_course_type',
				effectivePrice > 0 ? 'paid' : 'free'
			);
		} else {
			setFieldValue('meta.academy_course_type', typeValue);
		}
	};

	// Price is the "none of the special types" state, not a value anyone
	// picks from a tile — so switching a special type off (see
	// `toggleSpecialType` above) is the only way back into it. That leaves
	// no way back once the price row itself sits inside the same
	// `.meta-field--price-disabled` wrapper that greys out the price
	// input/payment panels while a special type is active — the row shares
	// its parent's `pointer-events: none`, so a click on it (or a future
	// onClick added to it) can never fire. This handler is wired to a
	// *sibling* copy of that row rendered outside the disabled wrapper,
	// alongside Public/GameEngine/etc., so Price behaves like a real,
	// always-clickable option in that same list.
	const selectPriceMode = () => {
		if (!isSpecialType) {
			return;
		}
		setFieldValue(
			'meta.academy_course_type',
			effectivePrice > 0 ? 'paid' : 'free'
		);
	};

	// "Activate WooCommerce/StoreEngine" is an admin action — instructors
	// don't get the prompt.
	let message = '';
	if (
		can_manage_addons &&
		inPriceMode &&
		monetizationEngine === 'woocommerce' &&
		!woocommerce_is_active
	) {
		message = __('Unlock Pricing By Activating Woo-Commerce', 'academy');
	}
	if (
		can_manage_addons &&
		inPriceMode &&
		monetizationEngine === 'storeengine' &&
		!storeengine_is_active
	) {
		message = __('Unlock Pricing By Activating StoreEngine', 'academy');
	}

	return (
		<div className="academy-inner">
			<h2 className="academy-heading">
				{__('Course Type', 'academy')}
				<Tooltip suffix="course-type-info">
					{__(
						'A course can be Public or restricted (RCP/MemberPress), or priced normally — unlockable with GameEngine points instead of money, or both at once.',
						'academy'
					)}
				</Tooltip>
			</h2>
			<CourseTypeBox
				showPaidType={showPaidType}
				inPriceMode={inPriceMode}
				effectivePrice={effectivePrice}
				selectPriceMode={selectPriceMode}
				monetizationEngine={monetizationEngine}
				hasEngineName={hasEngineName}
				isEnableStore={isEnableStore}
				isDisablePaidCourseType={isDisablePaidCourseType}
				isShowPriceFields={isShowPriceFields}
				isForceProductCreation={isForceProductCreation}
				plainPrice={plainPrice}
				onPriceCommitted={setLastPrice}
				onStorePriceCommitted={setStorePrice}
				reFetchData={reFetchData}
				typesData={typesData}
				toggleSpecialType={toggleSpecialType}
				message={message}
				showWarningText={showWarningText}
				isMembershipActive={isMembershipActive}
				isMemberpressActive={isMemberpressActive}
				membershipData={membershipData}
				memberpressData={memberpressData}
				fetchHandler={fetchHandler}
				loading={loading}
				isGameEngineActive={isGameEngineActive}
				isGameEnginePluginActive={isGameEnginePluginActive}
				isGameEngineProActive={isGameEngineProActive}
				showGameEngineOption={showGameEngineOption}
			/>
		</div>
	);
};

export default CourseType;
