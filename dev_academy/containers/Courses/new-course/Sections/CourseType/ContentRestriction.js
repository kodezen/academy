import React, { useEffect, useState } from 'react';
import Select2 from '@Components/AcademySelect';
import Tooltip from '@Components/Tooltip';
import { __ } from '@wordpress/i18n';
import { makeRequest } from '@Utils/helper';

const RESTRICT_TYPE_OPTIONS = [
	{ value: 'none', label: __('None', 'academy') },
	{ value: 'points', label: __('Points Required', 'academy') },
	{ value: 'achievement', label: __('Achievement Required', 'academy') },
	{ value: 'level', label: __('Min Level Required', 'academy') },
];

/**
 * Free-tier "lock this course's landing-page content" control, backed by
 * the GameEngine plugin's Restrict Content addon. Independent of
 * `academy_course_type` — applies regardless of how the course is sold.
 * Meta keys registered for REST in
 * `gameengine/includes/addons/restrict-content/class-meta-box.php`.
 *
 * Rendered as a plain fragment-like block (no own `.academy-inner` box) —
 * the caller (`CourseType/index.js`) embeds this as the second stacked
 * section inside the shared "GameEngine" box, alongside the Unlock toggle.
 */
const ContentRestriction = ({ values, setFieldValue }) => {
	const [achievements, setAchievements] = useState([]);
	const [levels, setLevels] = useState([]);

	const type = values?.meta?._gameengine_restrict_type || 'none';
	const value = values?.meta?._gameengine_restrict_value || '';
	// A type picked with no threshold set (blank points amount, no
	// achievement/level chosen) isn't a "strict" restriction — PHP-side
	// (`Restriction_Helper::can_access()`) reads a blank points amount as a
	// threshold of 0 (any logged-in user clears it) and a blank
	// achievement/level id as "nothing to gate against" (also lets everyone
	// through). Both are silent no-ops: the dropdown looks configured but
	// nothing is actually restricted, which is exactly what makes this
	// setting look broken in testing. Warn inline rather than block saving,
	// matching this form's existing non-blocking warning convention (see
	// the eCommerce-engine warning in CourseType above).
	const isMisconfigured = 'none' !== type && !value;

	useEffect(() => {
		if ('achievement' === type || 'level' === type) {
			makeRequest({ action: 'gameengine_academy/get_achievements' }).then((res) => {
				setAchievements(res?.data?.data || []);
			});
			makeRequest({ action: 'gameengine_academy/get_levels' }).then((res) => {
				setLevels(res?.data?.data || []);
			});
		}
	}, [type]);

	return (
		<div className="academy-gameengine-content-restriction flex flex-col gap-2">
			<h3 className="academy-sub-heading flex items-center gap-2">
				{__('Content Restriction (Free)', 'academy')}
				<Tooltip suffix="content-restriction">
					{__(
						'Restricts only this course’s landing-page description to students who meet the condition below — it does not block enrollment or curriculum access. To fully gate the course itself (no enrolling until the condition is met), use “Enable GameEngine Unlock” above instead.',
						'academy'
					)}
				</Tooltip>
			</h3>

			<Select2
				className="academy-select"
				value={
					RESTRICT_TYPE_OPTIONS.find(
						(item) => item.value === type
					) || RESTRICT_TYPE_OPTIONS[0]
				}
				onChangeHandler={(newType) => {
					setFieldValue(
						'meta._gameengine_restrict_type',
						newType || 'none'
					);
					setFieldValue('meta._gameengine_restrict_value', '');
				}}
				options={RESTRICT_TYPE_OPTIONS}
				isSearchable={false}
				isClearable={false}
				isMulti={false}
			/>

			{'points' === type && (
				<input
					type="number"
					min="0"
					className="academy-input"
					placeholder={__('Points amount', 'academy')}
					value={value}
					onChange={(e) => {
						const raw = e.target.value;
						// Blank stays blank (the "not configured yet"
						// state that drives the warning below) — only a
						// typed negative number gets clamped, since a
						// negative threshold would make the restriction
						// trivially always-pass rather than an honest
						// unconfigured state. Stays a string either way:
						// `_gameengine_restrict_value` is registered
						// with a REST schema `type: 'string'`
						// (`class-meta-box.php`), and sending a JS
						// number against that schema 400s on save.
						const next = raw === '' ? '' : String(Math.max(0, Number(raw) || 0));
						setFieldValue('meta._gameengine_restrict_value', next);
					}}
				/>
			)}

			{'achievement' === type && (
				<Select2
					className="academy-select"
					placeholder={__('Select Achievement', 'academy')}
					value={achievements.find((item) => String(item.value) === String(value)) || ''}
					onChangeHandler={(newValue) => setFieldValue('meta._gameengine_restrict_value', newValue || '')}
					options={achievements}
					isSearchable={true}
					isClearable={true}
					isMulti={false}
				/>
			)}

			{'level' === type && (
				<Select2
					className="academy-select"
					placeholder={__('Select Level', 'academy')}
					value={levels.find((item) => String(item.value) === String(value)) || ''}
					onChangeHandler={(newValue) => setFieldValue('meta._gameengine_restrict_value', newValue || '')}
					options={levels}
					isSearchable={true}
					isClearable={true}
					isMulti={false}
				/>
			)}

			{isMisconfigured && (
				<div className="academy-warning-text mb-2">
					<span className="academy-icon academy-icon--information"></span>
					<p>
						{'points' === type
							? __(
									'Set a points amount above to activate this restriction — left blank, every logged-in visitor passes.',
									'academy'
								)
							: 'achievement' === type
								? __(
										'Select an achievement above to activate this restriction — with none selected, every logged-in visitor passes.',
										'academy'
									)
								: __(
										'Select a level above to activate this restriction — with none selected, every logged-in visitor passes.',
										'academy'
									)}
					</p>
				</div>
			)}

			{'none' !== type && (
				<>
					<label className="block mt-2.5">
						<input
							type="checkbox"
							checked={!!values?.meta?._gameengine_lock_media}
							onChange={(e) => setFieldValue('meta._gameengine_lock_media', e.target.checked)}
						/>{' '}
						{__('Lock images & links only', 'academy')}
					</label>
					<textarea
						className="academy-textarea"
						rows="3"
						placeholder={__('Lock message shown to restricted visitors', 'academy')}
						value={values?.meta?._gameengine_restrict_message || ''}
						onChange={(e) => setFieldValue('meta._gameengine_restrict_message', e.target.value)}
					/>
				</>
			)}
		</div>
	);
};

export default ContentRestriction;
