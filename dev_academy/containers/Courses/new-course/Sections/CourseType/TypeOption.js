import React from 'react';
import { useDispatch } from 'react-redux';
import ProTag from '@Components/ProTag';
import { is_pro } from '@Utils/helper';
import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';

/**
 * A single Public/RCP/MemberPress radio tile inside the Course Type list.
 * `onSelect` is `toggleSpecialType` from the `CourseType` orchestrator — this
 * component only decides whether a click should open the upgrade modal
 * instead (a Pro-gated tile while Academy isn't Pro).
 *
 * @param {Object}   props
 * @param {Object}   props.type     `{ label, value, isPro }` entry from `typesData`.
 * @param {boolean}  props.isActive Whether this tile is the current `academy_course_type`.
 * @param {Function} props.onSelect Called with `type.value` to toggle it on/off.
 */
const TypeOption = ({ type, isActive, onSelect }) => {
	const dispatch = useDispatch();
	const isProField = type.value === 'public' && type.isPro && !is_pro;

	return (
		<label
			htmlFor={type.label}
			onClick={() => {
				if (isProField) {
					dispatch(upgradeProModal(true));
					return;
				}
				onSelect(type.value);
			}}
			className={`academy-radio-custom academy-course-types-label academy-course-types-label__${
				type.value
			} ${isActive && 'academy-label-is-active'} ${
				isProField && ' academy-label-disabled'
			} `}
		>
			<span className="academy-label-text">{type.label}</span>
			<span className="academy-course-types-label__indicator">
				{isProField && (
					<p className="academy-pro-badge--label">
						<ProTag suffix="academy-pro-badge-gradient" />
					</p>
				)}
				<input
					type="radio"
					id={type.label}
					checked={isActive}
					disabled={isProField}
					// This radio is a decorative, CSS-hidden (`display:
					// none`) mirror of `isActive` — the label's onClick,
					// not this input, drives selection. Because it's a
					// descendant of its own <label for=itself>, clicking
					// anywhere in the label makes the browser forward a
					// second, native click at this input (label→control
					// activation), which bubbles back up and fires the
					// label's onClick a second time. React re-renders in
					// between the two, so the second call sees the type
					// this click just set as "already active" and
					// immediately toggles it back off — turning every
					// switch between two special types (or out of Price
					// mode) into a select-then-instant-undo. Stopping
					// propagation here (not `disabled` — a <label>
					// wrapping a disabled control stops accepting clicks
					// at all in Chromium) keeps the forwarded click from
					// ever reaching the label's handler a second time.
					onClick={(e) => e.stopPropagation()}
					readOnly
				/>
				<span className="academy-radio-custom--mod"></span>
			</span>
		</label>
	);
};

export default TypeOption;
