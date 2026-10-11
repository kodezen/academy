import React from 'react';
import { useFormikContext } from 'formik';
import { useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';
import ProLockedContent from '@Components/ProTag/ProLockedContent';
import Tooltip from '@Components/Tooltip';
import { can_manage_addons } from '@Utils/helper';
import { Switch } from '@Components/ui';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import GameEngineRules from './GameEngineRules';
import ContentRestriction from './ContentRestriction';

/**
 * Boxed content shown right under the Price picker inside the "Price" row
 * (the "OR" divider above this box is rendered by `CourseTypeBox`, not
 * here, so it sits outside this component's own
 * `.meta-field--course-type__rcp` box rather than as the first thing inside
 * it): a toggle that adds GameEngine's points-based rules as an alternate
 * way to unlock the course. The manual Unlockable/Paid-or-Unlockable
 * override for whether an attached price is actually offered alongside the
 * rules lives in `CourseTypeBox` now, in the same slot the Paid/Free toggle
 * occupies when GameEngine is off — not duplicated here — so there's one
 * place to read the course's real state, not two. Whichever the student
 * satisfies first actually unlocks it, checked server-side in
 * `Course_Unlock::modify_course_type()` against
 * `academy_courses_gameengine_allow_purchase`, which `handleToggle` below
 * defaults to `true` the moment this toggle turns on while a price is
 * attached (previously unconditional and with no way back to `false` at
 * all — `CourseTypeBox`'s toggle is what lets an admin flip it back).
 * Turning the main toggle on also reveals the Pro-gated nudge and the free
 * "Content Restriction" description-lock panel — both are meaningless
 * while GameEngine unlock itself is off, so they stay behind the same
 * toggle rather than Content Restriction showing regardless of it.
 *
 * The base integration is free (free Academy + free GameEngine) — when the
 * GameEngine plugin itself is off, this renders as a locked preview
 * (`ProLockedContent`, the same component Course Settings uses for an off
 * addon, but with `isIntegration` so its CTA installs-and-activates the real
 * companion plugin instead of flipping a bundled-addon flag that GameEngine
 * — a separate plugin, not a bundled addon — never reads) linking to Add-ons
 * instead of the real controls, rather than a `!is_pro` gate.
 *
 * @param {Object}   props
 * @param {boolean}  props.isPluginActive     Whether the free GameEngine plugin is active.
 * @param {boolean}  props.isProActive        Whether GameEngine Pro is active (gates the nudge sub-control).
 * @param {boolean}  props.isGameEngineActive Whether `academy_course_type` is currently `gameengine_membership`.
 * @param {boolean}  props.hasPrice           Whether a real price/product is attached above — controls whether turning this toggle on should default `allow_purchase` to `true`.
 * @param {Function} props.onToggle           Flips `academy_course_type` between `gameengine_membership` and price-derived free/paid.
 */
const GameEngineSection = ({
	isPluginActive,
	isProActive,
	isGameEngineActive,
	hasPrice,
	onToggle,
}) => {
	const { values, setFieldValue } = useFormikContext();
	const dispatch = useDispatch();

	const nudgeEnabled =
		!!values?.meta?.academy_courses_gameengine_nudge_enabled;
	const nudgeThreshold =
		values?.meta?.academy_courses_gameengine_nudge_threshold ?? 80;

	const handleToggle = (checked) => {
		onToggle();
		// Default to the hybrid (hasn't declined purchase) the first time
		// GameEngine turns on while a price is already attached — matches
		// today's existing behavior for anyone who hasn't touched the new
		// Unlockable/Paid-or-Unlockable toggle below yet. Gated on
		// `hasPrice` now instead of unconditional: no point defaulting a
		// purchase flag true when there's nothing to purchase.
		if (checked && hasPrice) {
			setFieldValue(
				'meta.academy_courses_gameengine_allow_purchase',
				true
			);
		}
	};

	// Turning the nudge ON needs Pro; turning an already-on nudge OFF never
	// did, so only the ON direction is blocked. Errors via toast instead of
	// a permanently-visible warning box — the switch stays enabled so it's
	// discoverable, the error only fires on the attempt that actually needs
	// Pro.
	const handleNudgeToggle = (checked) => {
		if (checked && !isProActive) {
			dispatch(
				showNotification({
					message: __(
						'Automatic “almost there” nudge emails need GameEngine Pro.',
						'academy'
					),
					isShow: true,
					type: 'error',
				})
			);
			return;
		}
		setFieldValue('meta.academy_courses_gameengine_nudge_enabled', checked);
	};

	const content = (
		<>
			<div className="academy-gameengine-allow-purchase flex flex-col gap-2">
				<div className="academy-switch-row flex items-center gap-2">
					<label className="flex items-center gap-2">
						<Switch
							checked={isGameEngineActive}
							onChange={handleToggle}
						/>
						{__('GameEngine Unlock', 'academy')}
					</label>
					{/* Kept outside the <label> — a <button> (the Switch) is
					a labelable element, so clicking anywhere inside a label
					wrapping one activates it. With the tooltip nested in
					there too, clicking the info icon toggled the switch
					instead of just showing the tooltip text. */}
					<Tooltip suffix="gameengine-allow-purchase">
						{__(
							'Also let students unlock this course with GameEngine points — either by purchasing it above, or by meeting the point rule(s) below, whichever happens first.',
							'academy'
						)}
					</Tooltip>
				</div>
			</div>

			{/* Rules, the Pro nudge, and Content Restriction are all part of
			"GameEngine unlock is on" — none of them meant anything before
			this toggle existed, so all three stay behind it together
			instead of Content Restriction being visible regardless of
			whether the toggle above it is even on. */}
			{isGameEngineActive && (
				<>
					<GameEngineRules
						rules={values?.meta?.academy_courses_gameengine_rules}
						requireAll={
							values?.meta
								?.academy_courses_gameengine_require_all
						}
						onRulesChange={(rules) =>
							setFieldValue(
								'meta.academy_courses_gameengine_rules',
								rules
							)
						}
						onRequireAllChange={(checked) =>
							setFieldValue(
								'meta.academy_courses_gameengine_require_all',
								checked
							)
						}
					/>

					<div className="academy-gameengine-nudge flex flex-col gap-2 mt-2">
						{/* Not dimmed via meta-field--price-disabled (that's
						pointer-events: none) even when Pro is off — the
						switch has to stay clickable so handleNudgeToggle can
						fire and show the "needs Pro" error on the attempt to
						turn it on, rather than the toggle silently doing
						nothing. */}
						{/* Needs GameEngine Pro; only an admin can get it, so
						    instructors don't see the upsell. */}
						{(isProActive || can_manage_addons || nudgeEnabled) && (
							<label className="academy-switch-row flex items-center gap-2">
								<Switch
									checked={nudgeEnabled}
									onChange={handleNudgeToggle}
								/>
								{__(
									'Nudge students as they get close to unlocking',
									'academy'
								)}
							</label>
						)}
						{nudgeEnabled && (
							<label className="flex items-center gap-2">
								{__('Notify at', 'academy')}
								<input
									type="number"
									min="1"
									max="99"
									className="academy-input"
									style={{ width: '80px' }}
									value={nudgeThreshold}
									disabled={!isProActive}
									onChange={(e) =>
										setFieldValue(
											'meta.academy_courses_gameengine_nudge_threshold',
											Math.min(
												99,
												Math.max(
													1,
													parseInt(
														e.target.value,
														10
													) || 1
												)
											)
										)
									}
								/>
								{__('% of the requirement', 'academy')}
							</label>
						)}
					</div>

					<hr className="academy-gameengine-divider" />
					<ContentRestriction
						values={values}
						setFieldValue={setFieldValue}
					/>
				</>
			)}
		</>
	);

	if (isPluginActive) {
		return <div className="academy-gameengine-unlock">{content}</div>;
	}

	return (
		<ProLockedContent
			isProFeature={false}
			isIntegration={true}
			title={__('GameEngine Addon is Off', 'academy')}
			addonName={__('GameEngine', 'academy')}
			addonIcon="academy-icon--gamipress"
			addonSlug="gameengine"
		>
			<div className="academy-gameengine-unlock">{content}</div>
		</ProLockedContent>
	);
};

export default GameEngineSection;
