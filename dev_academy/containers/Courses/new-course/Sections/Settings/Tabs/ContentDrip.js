import Checkbox from '@Components/Formik/Checkbox';
import { Field } from 'formik';
import React from 'react';
import { __ } from '@wordpress/i18n';

const contentDripOptions = [
	{
		name: 'meta.academy_course_drip_content_type',
		label: __('Schedule Course content according to the date', 'academy'),
		value: 'schedule_by_date',
	},
	{
		name: 'meta.academy_course_drip_content_type',
		label: __('Content Accessible after X days from enrollment', 'academy'),
		value: 'schedule_by_enroll_date',
	},
	{
		name: 'meta.academy_course_drip_content_type',
		label: __('Course content available sequentially', 'academy'),
		value: 'schedule_by_sequentially',
	},
	{
		name: 'meta.academy_course_drip_content_type',
		label: __(
			'Course content available after completing prerequisites',
			'academy'
		),
		value: 'schedule_by_prerequisite',
	},
	{
		name: 'meta.academy_course_drip_content_type',
		label: __(
			'Content Accessible after X days from topic completed',
			'academy'
		),
		value: 'schedule_by_topic_complete_date',
	},
	{
		name: 'meta.academy_course_drip_content_type',
		label: __(
			'Course content automatically locks after a set period (X days) after access',
			'academy'
		),
		value: 'schedule_by_topic_unlock_date',
	},
	{
		name: 'meta.academy_course_drip_content_type',
		label: __(
			'Release course modules automatically on a monthly schedule (each module expires when the next one is released)',
			'academy'
		),
		value: 'schedule_by_module',
	},
];

const moduleDripBasisOptions = [
	{
		value: 'enrollment',
		label: __("Start from each student's enrollment date", 'academy'),
		description: __(
			'Module 1 unlocks the day a student enrolls, and each later module follows a month after that — separately for every student.',
			'academy'
		),
	},
	{
		value: 'fixed_date',
		label: __('Start from one date, for everyone', 'academy'),
		description: __(
			'Module 1 unlocks on the date you set below, and each later module follows a month after that — the same for every student.',
			'academy'
		),
	},
];

const ContentDrip = (props) => {
	const { meta } = props;

	return (
		<div className="academy-content-drip-settings">
			<Checkbox
				name="meta.academy_course_drip_content_enabled"
				title={__('Enable/Disable Content Drip', 'academy')}
			/>
			<div
				className={`academy-content-drip-settings-options ${
					!meta.academy_course_drip_content_enabled &&
					'academy-content-drip-options-opacity'
				}`}
			>
				<h4>{__('Content Drip Types', 'academy')}</h4>
				<p>
					{__(
						'Select your content schedule using the following content drip options',
						'academy'
					)}
				</p>

				<div className="academy-content-drip-option-items">
					{contentDripOptions.map((item, index) => {
						return (
							<div
								className="academy-content-drip-option"
								key={index}
							>
								<Field
									type="radio"
									id={item.value}
									name={item.name}
									value={item.value}
									disabled={
										!meta.academy_course_drip_content_enabled
									}
								/>
								<label
									htmlFor={item.value}
									className="academy-drip-item-label"
								>
									{item.label}
								</label>
							</div>
						);
					})}
				</div>

				{meta.academy_course_drip_content_type ===
					'schedule_by_module' && (
					<div className="academy-content-drip-module-settings">
						<h4>{__('Monthly Module Schedule', 'academy')}</h4>
						<p>
							{__(
								'Only one module is unlocked at a time — each one locks again as soon as the next month’s module is released.',
								'academy'
							)}
						</p>

						<div className="academy-content-drip-basis-options">
							{moduleDripBasisOptions.map((item) => (
								<label
									key={item.value}
									htmlFor={`module-drip-basis-${item.value}`}
									className={`academy-content-drip-basis-option${
										meta.academy_course_module_drip_basis ===
										item.value
											? ' is-selected'
											: ''
									}`}
								>
									<Field
										type="radio"
										id={`module-drip-basis-${item.value}`}
										name="meta.academy_course_module_drip_basis"
										value={item.value}
										disabled={
											!meta.academy_course_drip_content_enabled
										}
									/>
									<span className="academy-content-drip-basis-option__text">
										<strong>{item.label}</strong>
										<span>{item.description}</span>
									</span>
								</label>
							))}
						</div>

						{meta.academy_course_module_drip_basis ===
							'fixed_date' && (
							<div className="academy-content-drip-days">
								<h4 className="academy-content-drip-title">
									{__('Module 1 start date', 'academy')}
								</h4>
								<Field
									name="meta.academy_course_module_drip_start_date"
									type="date"
									disabled={
										!meta.academy_course_drip_content_enabled
									}
								/>
								<p className="academy-content-drip-description">
									{__(
										'Module 1 unlocks on this date for every student, and each later module follows a month after the last.',
										'academy'
									)}
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ContentDrip;
