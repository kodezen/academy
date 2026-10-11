import { Field, useFormikContext } from 'formik';
import React from 'react';
import { __ } from '@wordpress/i18n';
import AcademySelect from '@Components/AcademySelect';

const durationUnitOptions = [
	{ value: 'days', label: __('Days', 'academy') },
	{ value: 'months', label: __('Months', 'academy') },
	{ value: 'years', label: __('Years', 'academy') },
];

const modeOptions = [
	{
		value: 'course_default',
		label: __('Use the site-wide default', 'academy'),
	},
	{ value: 'duration', label: __('Custom duration', 'academy') },
	{ value: 'unlimited', label: __('Unlimited (never expires)', 'academy') },
];

// A group's seat package for this course inherits this setting automatically
// whenever it's granted without an admin picking explicit dates by hand on
// the Group Plus side — see academy-pro's
// Settings::resolve_end_date_for_course(). Deliberately no "fixed calendar
// date" option here (unlike the site-wide setting): a fixed date belongs to
// a specific purchase/contract, not a reusable course template default.
const GroupPlusSeatValidity = () => {
	const { values, setFieldValue } = useFormikContext();
	// register_post_meta() returns '' (not null/undefined) for an unset
	// single string meta, so ?? never applies its fallback here — a course
	// that has never had this saved needs || to actually fall through to
	// 'course_default' instead of showing a blank, unmatched select value.
	const mode =
		values?.meta?.academy_group_plus_seat_validity_mode || 'course_default';
	const isDuration = mode === 'duration';

	return (
		<section className="academy-group-plus-settings__section flex flex-col gap-4">
			<div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
				<div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-1">
					<span className="academy-title">
						{__('Seat validity', 'academy')}
					</span>
					<span className="text-xs leading-5 text-academy-gray-2">
						{__(
							'How long a group seat package for this course stays active by default. An admin can still override it per purchase on the Group Plus screen.',
							'academy'
						)}
					</span>
				</div>
				<div className="academy-group-plus-settings__control shrink-0">
					<AcademySelect
						className="academy-select"
						suffix="group-plus-seat-validity-mode"
						options={modeOptions}
						value={modeOptions.find((o) => o.value === mode)}
						onChangeHandler={(val) =>
							setFieldValue(
								'meta.academy_group_plus_seat_validity_mode',
								val
							)
						}
					/>
				</div>
			</div>

			{isDuration && (
				<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
					<span className="academy-title">
						{__('Duration', 'academy')}
					</span>
					<div className="academy-group-plus-settings__control flex shrink-0 items-center gap-3">
						<Field
							type="number"
							className="academy-input academy-group-plus-settings__duration"
							name="meta.academy_group_plus_seat_validity_duration_value"
							min="1"
							placeholder="e.g. 30"
							// Stored as 0 when unset; show the hint, not "0".
							value={
								values?.meta
									?.academy_group_plus_seat_validity_duration_value ||
								''
							}
							onChange={(e) => {
								// Registered as an integer meta — must never
								// be an empty string, the REST create/update
								// rejects that with a 400. Blank stays as the
								// numeric fallback below, not ''.
								const raw = e.target.value;
								setFieldValue(
									'meta.academy_group_plus_seat_validity_duration_value',
									raw === '' ? 0 : parseInt(raw, 10)
								);
							}}
						/>
						<AcademySelect
							className="academy-select academy-group-plus-settings__unit"
							suffix="group-plus-seat-validity-duration-unit"
							options={durationUnitOptions}
							value={durationUnitOptions.find(
								(o) =>
									o.value ===
									values?.meta
										?.academy_group_plus_seat_validity_duration_unit
							)}
							onChangeHandler={(val) =>
								setFieldValue(
									'meta.academy_group_plus_seat_validity_duration_unit',
									val
								)
							}
						/>
					</div>
				</div>
			)}
		</section>
	);
};

export default GroupPlusSeatValidity;
