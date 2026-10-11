import React, { useEffect, useState } from 'react';
import { Field, useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import Select2 from '@Components/AcademySelect';
import SwitchControl from '@Components/Formik/Checkbox/SwitchControl';
import { makeRequest } from '@Utils/helper';

const fluentCommunityEvents = [
	{
		value: 'course_enrollment',
		label: 'Course Enrollment',
	},
	{
		value: 'course_complete',
		label: 'Course Complete',
	},
	{
		value: 'course_announcements',
		label: 'Course Announcements',
	},
	{
		value: 'user_question',
		label: 'User Question',
	},
	{
		value: 'question_answer',
		label: 'Question Answer',
	},
	{
		value: 'lesson_update',
		label: 'Lesson Update',
	},
	{
		value: 'quiz_start',
		label: 'Quiz Start',
	},
	{
		value: 'quiz_end',
		label: 'Quiz End',
	},
];

const FluentCommunity = () => {
	const [options, setOptions] = useState([]);

	useEffect(() => {
		fetchDataHandler();
	}, []);

	const { values, setFieldValue } = useFormikContext();

	const fetchDataHandler = () => {
		makeRequest({
			action: 'academy_pro/fluent_community/spaces',
		}).then((response) => {
			const dataHolder = response.data.data;

			const options = dataHolder.map((item) => {
				return { value: item.id, label: item.title };
			});
			setOptions(options);
		});
	};

	return (
		<React.Fragment>
			<div className="academy-course-settings--fluent-community">
				<p className="academy-title-subtitle">
					<span className="academy-title">
						{__('Enable Fluent Community Feed', 'academy')}
					</span>

					<span className="academy-sub-title">
						{__(
							'Toggle to enable or disable the Fluent Community feed for activity sharing.',
							'academy'
						)}
					</span>
				</p>

				<Field
					id="qa"
					type="checkbox"
					name="meta.is_fluent_community_feed_active"
					component={SwitchControl}
				/>
			</div>

			<div className="academy-course-settings--fluent-community">
				<p className="academy-title-subtitle">
					<span className="academy-title">
						{__('Selected Events', 'academy')}
					</span>

					<span className="academy-sub-title">
						{__(
							'Choose which event activities will be pushed to Fluent Community.',
							'academy'
						)}
					</span>
				</p>

				<Select2
					id="fluent_community_notifiable_events"
					isMulti={true}
					className="academy-select academy-select--w-100"
					onChangeHandler={(selected) => {
					const optionsIds = selected.map((item) => item.value);
					setFieldValue(
						'meta.fluent_community_notifiable_events',
						optionsIds
					);
				}}
					options={fluentCommunityEvents}
					value={
						values?.meta?.fluent_community_notifiable_events.length
							? fluentCommunityEvents.filter((item) =>
									values?.meta?.fluent_community_notifiable_events?.some(
										(id) => item.value === id
									)
								)
							: []
					}
					onMenuOpen={fetchDataHandler}
				/>
			</div>

			<div className="academy-course-settings--fluent-community">
				<p className="academy-title-subtitle">
					<span className="academy-title">
						{__('Fluent Community Space ID', 'academy')}
					</span>

					<span className="academy-sub-title">
						{__(
							'Select a specific Fluent Community space where the activities will be posted',
							'academy'
						)}
					</span>
				</p>

				<Select2
					id="fluent_community_space_id"
					className="academy-select academy-select--w-100"
					onChangeHandler={(val) => {
					setFieldValue('meta.fluent_community_space_id', val);
				}}
					options={options}
					value={values?.meta?.fluent_community_space_id}
					onMenuOpen={fetchDataHandler}
				/>
			</div>
		</React.Fragment>
	);
};

export default FluentCommunity;
