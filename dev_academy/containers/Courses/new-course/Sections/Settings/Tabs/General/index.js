import React, { useEffect } from 'react';
import { Field, FieldArray, useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import { is_pro } from '@Utils/helper';
import SwitchControl from '@Components/Formik/Checkbox/SwitchControl';
import Checkbox from '@Components/Formik/Checkbox';
import { useSelector } from 'react-redux';
import AcademySeparator from '@Components/AcademySeparator';
import AcademySelect from '@Components/AcademySelect';
import Tooltip from '@Components/Tooltip';

export default function General() {
	const { errors, values, setFieldValue } = useFormikContext();
	const settings = useSelector((state) => state.settings);

	const showExpireField =
		is_pro && settings?.data?.is_expire_course_enrollment;
	const isEnabledCourseReview = settings?.data?.is_enabled_course_review;
	const isEnabledCourseReviewPopUp =
		settings?.data?.is_enabled_course_popup_review;
	const isEnabledCourseComingSoon =
		settings?.data?.is_enabled_course_coming_soon;

	const difficultyLevels = [
		{
			label: __('All Levels', 'academy'),
			value: 'all_levels',
		},
		{
			label: __('Beginner', 'academy'),
			value: 'beginner',
		},
		{
			label: __('Intermediate', 'academy'),
			value: 'intermediate',
		},
		{
			label: __('Experts', 'academy'),
			value: 'experts',
		},
	];

	return (
		<React.Fragment>
			<div className="meta-field meta-field--qa">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Question and answer', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__(
							'Enable/Disable QA section for this course.',
							'academy'
						)}
					</span>
				</div>
				<div className="meta-field__body">
					<Field
						id="qa"
						type="checkbox"
						name="meta.academy_is_enabled_course_qa"
						component={SwitchControl}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--qa">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Announcements', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__(
							'Enable/Disable Announcements section for this course.',
							'academy'
						)}
					</span>
				</div>
				<div className="meta-field__body">
					<Field
						id="qa"
						type="checkbox"
						name="meta.academy_is_enabled_course_announcements"
						component={SwitchControl}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--playback-time">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Course Duration', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__(
							'Set the expected time duration for this course ',
							'academy'
						)}
					</span>
				</div>
				<div className="meta-field__body">
					<FieldArray
						name="meta.academy_course_duration"
						render={() => (
							<div className="group-field">
								<label
									htmlFor="hours"
									className="group-field__items academy-input"
								>
									<Field
										id="hours"
										type="number"
										name="meta.academy_course_duration[0]"
										min="0"
										onChange={(e) =>
											setFieldValue(
												'meta.academy_course_duration[0]',
												!e.target.value
													? 0
													: e.target.value
											)
										}
									/>
									<span>{__('Hrs', 'academy')}</span>
								</label>
								<label
									htmlFor="minutes"
									className="group-field__items academy-input"
								>
									<Field
										id="minutes"
										type="number"
										name="meta.academy_course_duration[1]"
										min="0"
										onChange={(e) =>
											setFieldValue(
												'meta.academy_course_duration[1]',
												!e.target.value
													? 0
													: e.target.value
											)
										}
									/>
									<span>{__('Min', 'academy')}</span>
								</label>
								<label
									htmlFor="seconds"
									className="group-field__items academy-input"
								>
									<Field
										id="seconds"
										type="number"
										name="meta.academy_course_duration[2]"
										min="0"
										onChange={(e) =>
											setFieldValue(
												'meta.academy_course_duration[2]',
												!e.target.value
													? 0
													: e.target.value
											)
										}
									/>
									<span>{__('Sec', 'academy')}</span>
								</label>
							</div>
						)}
					/>
				</div>
			</div>

			<AcademySeparator />

			<div className="meta-field meta-field--maximum-students">
				<div>
					<label
						htmlFor="max_students"
						className="academy-title-subtitle"
					>
						<span className="academy-title">
							{__('Maximum Students', 'academy')}
						</span>
						<span className="academy-sub-title">
							{__(
								'Maximum number of students who can enroll in this course.',
								'academy'
							)}
						</span>
					</label>
				</div>
				<Field
					id="max_students"
					type="number"
					name="meta.academy_course_max_students"
					placeholder="max students"
					className={`academy-input
						${errors?.meta?.academy_course_max_students && 'academy-input-field-required'}`}
					min="0"
				/>
			</div>
			{showExpireField && (
				<div className="meta-field meta-field--expire-enrollment">
					<div className="meta-field__label">
						{__('Expire Enrollment', 'academy')}
						<p className="academy-sub-title">
							{__(
								'Set the number of days after enrollment that a student loses access to the course (0 for lifetime access).',
								'academy'
							)}
						</p>
					</div>
					<Field
						id="academy_course_expire_enrollment"
						type="number"
						name="meta.academy_course_expire_enrollment"
						className={`academy-input
							${
								errors?.meta
									?.academy_course_expire_enrollment &&
								'academy-input-field-required'
							}`}
						placeholder="0"
						min="0"
					/>
				</div>
			)}

			<div className="meta-field meta-field--difficulty-level">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Difficulty Level', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__('Choose course level', 'academy')}
					</span>
				</div>
				<div className="meta-field__body">
					<AcademySelect
						className="academy-select academy-select--difficulty-level"
						suffix="difficulty-level"
						options={difficultyLevels}
						value={difficultyLevels.find(
							(option) =>
								option.value ===
								values.meta.academy_course_difficulty_level
						)}
						onChangeHandler={(option) => {
							setFieldValue(
								'meta.academy_course_difficulty_level',
								option
							);
						}}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--languages">
				<label htmlFor="languages" className="meta-field__label">
					<span className="academy-title">
						{__('Language', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__('Mention the language of the course', 'academy')}
					</span>
				</label>
				<Field
					id="languages"
					type="text"
					name="meta.academy_course_language"
					placeholder={__('Language', 'academy')}
					className="academy-input"
				/>
			</div>
			{isEnabledCourseComingSoon && (
				<>
					<AcademySeparator />
					<div className="meta-field meta-field--comming-soon">
						<div className="meta-field__label">
							<span className="academy-title">
								{__('Enrollment Start Date', 'academy')}
							</span>
							<span className="academy-sub-title">
								{__(
									'Specify the exact date and time registration opens for this course.',
									'academy'
								)}
							</span>
						</div>
						<Field
							name="meta.academy_course_coming_soon_end_date"
							type="datetime-local"
							id={'courseEnrollDate'}
							// Disable past dates. datetime-local needs a
							// "YYYY-MM-DDTHH:mm" string in local time — a Date
							// object stringifies to a form the browser ignores.
							min={new Date(
								Date.now() - new Date().getTimezoneOffset() * 60000
							)
								.toISOString()
								.slice(0, 16)}
							className="academy-input academy-courese-comming-soon-date"
						/>
					</div>
				</>
			)}

			{isEnabledCourseReview ? (
				<>
					<AcademySeparator />
					<div className="meta-field meta-field--ratings">
						<div className="meta-field__label">
							<span className="academy-title">
								{__('Disable Review', 'academy')}
							</span>
							<span className="academy-sub-title">
								{__(
									'Disable ratings for this course only.',
									'academy'
								)}
							</span>
						</div>
						<div className="meta-field__body">
							<Checkbox
								id="single_review"
								type="checkbox"
								name="meta.academy_is_disabled_course_review"
							/>
						</div>
					</div>
				</>
			) : null}
		</React.Fragment>
	);
}
