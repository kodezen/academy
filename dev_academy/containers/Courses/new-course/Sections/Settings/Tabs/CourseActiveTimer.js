import Checkbox from '@Components/Formik/Checkbox';
import { Field, useFormikContext } from 'formik';
import React from 'react';
import { __ } from '@wordpress/i18n';
import AcademySelect from '@Components/AcademySelect';

const durationUnitOptions = [
	{ value: 'minutes', label: __('Minutes', 'academy') },
	{ value: 'hours', label: __('Hours', 'academy') },
	{ value: 'days', label: __('Days', 'academy') },
];

const expiryActionOptions = [
	{
		value: 'course_lock',
		label: __('Lock Course (block lesson access)', 'academy'),
	},
	{ value: 'cancel_enrollment', label: __('Cancel Enrollment', 'academy') },
];

const CourseActiveTimer = () => {
	const { values, setFieldValue } = useFormikContext();
	// Derive from live Formik values (not a snapshotted prop) so toggling the
	// checkbox immediately enables the duration/expiry fields.
	const isEnabled = !!values?.meta?.academy_course_timer_enabled;

	return (
		<div className="academy-course-active-timer-settings">
			<Checkbox
				name="meta.academy_course_timer_enabled"
				title={__('Enable Course Active Timer', 'academy')}
				subtitle={__(
					'Track and limit the total time a student spends on this course.',
					'academy'
				)}
			/>
			<div
				className={`academy-course-active-timer-settings-options ${
					!isEnabled &&
					'academy-course-active-timer-settings-options--disabled'
				}`}
			>
				<div className="meta-field">
					<div className="meta-field__label">
						<span className="academy-title">
							{__('Allowed Duration', 'academy')}
						</span>
						<span className="sub-title">
							{__('Leave blank for unlimited access.', 'academy')}
						</span>
					</div>
					<div className="meta-field__body academy-flex-2">
						<Field
							type="number"
							className="academy-input academy-input-w-120"
							name="meta.academy_course_timer_duration_value"
							min="1"
							placeholder="e.g. 5"
							disabled={!isEnabled}
							onChange={(e) => {
								// Field's default onChange stores the raw (string) DOM
								// input value — cast to an integer here so the API
								// receives a number, not "5". Blank stays '' (the
								// "unlimited access" sentinel), not 0.
								const raw = e.target.value;
								setFieldValue(
									'meta.academy_course_timer_duration_value',
									raw === '' ? '' : parseInt(raw, 10)
								);
							}}
						/>
						<AcademySelect
							className="academy-select"
							suffix="course-timer-duration-unit"
							options={durationUnitOptions}
							value={durationUnitOptions.find(
								(o) =>
									o.value ===
									values.meta
										.academy_course_timer_duration_unit
							)}
							onChangeHandler={(val) =>
								setFieldValue(
									'meta.academy_course_timer_duration_unit',
									val
								)
							}
							isDisabled={!isEnabled}
						/>
					</div>
				</div>

				<div className="meta-field">
					<div className="meta-field__label">
						<span className="academy-title">
							{__('On Timer Expiry', 'academy')}
						</span>
					</div>
					<div className="meta-field__body">
						<AcademySelect
							className="academy-select"
							suffix="course-timer-expiry-action"
							options={expiryActionOptions}
							value={expiryActionOptions.find(
								(o) =>
									o.value ===
									values.meta
										.academy_course_timer_expiry_action
							)}
							onChangeHandler={(val) =>
								setFieldValue(
									'meta.academy_course_timer_expiry_action',
									val
								)
							}
							isDisabled={!isEnabled}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CourseActiveTimer;
