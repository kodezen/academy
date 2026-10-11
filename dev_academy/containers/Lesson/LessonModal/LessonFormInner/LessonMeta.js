import React, { useEffect } from 'react';
import { Field } from 'formik';
import Checkbox from '@Components/Formik/Checkbox';
import AcademySelect from '@Components/AcademySelect';
import Video from '@Components/Video';
import ProTag from '@Components/ProTag';
import {
	capitalizeFirstLetter,
	can_manage_addons,
	getAddonActiveStatus,
	is_pro,
	route_path,
} from '@Utils/helper';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import LessonScormUpload from '../../LessonModal/LessonFormInner/LessonScromUpload';
import SwitchControl from '@Components/Formik/Checkbox/SwitchControl';
import { Link, useNavigate } from 'react-router-dom';
import LessonSubtitles from './LessonSubtitles';

const LessonMeta = ({ values, saveValueHandler }) => {
	const allAddons = useSelector((state) => state.addons);
	const settings = useSelector((state) => state.settings.data);
	const navigate = useNavigate();

	const isShowVideoSource = () => {
		if (values?.video_source) {
			return (
				values?.video_source?.type &&
				values?.video_source?.type !== 'none'
			);
		}
		return false;
	};

	const isEnableLessonPreview = getAddonActiveStatus(
		allAddons,
		'course-preview',
		false
	);

	// Always show the two options — badge + redirect to the Add-ons page
	// whenever the Attendance addon itself isn't toggled on, instead of
	// hiding them outright.
	const isAttendanceLocked = !getAddonActiveStatus(allAddons, 'attendance');

	const isGumletActive = getAddonActiveStatus(allAddons, 'gumlet-video', false);

	const videoSourceOptions = [
		{
			label: __('Youtube', 'academy'),
			value: 'youtube',
		},
		{
			label: __('Vimeo', 'academy'),
			value: 'vimeo',
		},
		{
			label: __('External URL', 'academy'),
			value: 'external',
		},
		{
			label: __('Embedded', 'academy'),
			value: 'embedded',
		},
		{
			label: __('HTML 5 (mp4)', 'academy'),
			value: 'html5',
		},
		{
			label: __('Shortcode', 'academy'),
			value: 'short_code',
		},
	];

	if (isGumletActive) {
		videoSourceOptions.push({ label: __('Gumlet', 'academy'), value: 'gumlet' });
	}

	// Pro off: Attendance needs buying — gradient "PRO" badge.
	// Pro on (Attendance addon just toggled off): it only needs enabling —
	// orange "Off" badge. Either way the option stays visible and clicking it
	// routes to the Attendance add-on card instead of selecting it.
	const attendanceOptionLabel = (text) =>
		isAttendanceLocked ? (
			<span className="academy-select-option--locked">
				{text}
				{is_pro ? (
					<span className="academy-off-badge">
						{__('Off', 'academy')}
					</span>
				) : (
					<ProTag suffix="academy-pro-badge-gradient" />
				)}
			</span>
		) : (
			text
		);

	// Locked Online/Offline options are an "activate Attendance" prompt —
	// only shown to an admin, who can actually turn the addon on.
	if (!isAttendanceLocked || can_manage_addons) {
		videoSourceOptions.push(
			{
				label: attendanceOptionLabel(__('Online', 'academy')),
				searchLabel: __('Online', 'academy'),
				value: 'online',
				locked: isAttendanceLocked,
			},
			{
				label: attendanceOptionLabel(__('Offline', 'academy')),
				searchLabel: __('Offline', 'academy'),
				value: 'offline',
				locked: isAttendanceLocked,
			}
		);
	}
	return (
		<div className="academy-lesson-form--container">
			<h2 className="academy-heading py-5 px-6 bg-academy-surface border border-academy-border rounded-t m-0">
				{__('Lesson Settings', 'academy')}
			</h2>
			<div className="academy-lesson-form--container-body flex flex-col gap-6 p-6 border border-academy-border border-t-0 rounded-b">
				{isEnableLessonPreview && (
					<Checkbox
						name="meta.is_previewable"
						title={__('Preview Lesson', 'academy')}
						subtitle={__(
							'If the preview lesson is marked on, then students can view course content without enrolling in the course.',
							'academy'
						)}
					/>
				)}

				{!values?.scorm_data && (
					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="min-w-0">
								<h3 className="m-0 text-sm font-medium text-academy-text">
									{__('Video Source', 'academy')}
								</h3>
								<p className="m-0 mt-1 text-xs text-academy-gray-dark">
									{__(
										'Select your preferred video type.',
										'academy'
									)}
								</p>
							</div>
							<div className="w-full shrink-0 sm:w-56">
								<AcademySelect
									name="meta.video_source.type"
									suffix="lesson-video-source"
									isClearable={true}
									value={videoSourceOptions.find(
										(item) =>
											item.value ===
											values?.video_source?.type
									)}
									options={videoSourceOptions}
									placeholder={__(
										'Select Video Source',
										'academy'
									)}
									onChangeHandler={(option) => {
										const selected =
											videoSourceOptions.find(
												(item) =>
													item.value === option
											);
										if (selected?.locked) {
											navigate(
												`${route_path}admin.php?page=academy-addons&addon=attendance`
											);
											return;
										}
										saveValueHandler(
											'meta.video_source.type',
											option
										);
									}}
								/>
							</div>
						</div>
						{isShowVideoSource() && (
							<>
								{values.video_source.type === 'html5' ? (
									<Video
										name="meta.video_source.id"
										value={values.video_source.id}
										saveValueHandler={saveValueHandler}
									/>
								) : (
									<>
										<Field
											className="min-h-[80px] academy-input w-full rounded border border-academy-border p-3 text-sm text-academy-text focus:outline-none"
											type={
												values.video_source.type ===
													'online' ||
													values.video_source.type ===
													'offline' ||
													values.video_source.type ===
													'gumlet'
													? 'text'
													: 'url'
											}
											value={values.video_source.url}
											as="textarea"
											name="meta.video_source.url"
											placeholder={
												values.video_source.type ===
													'online' ||
													values.video_source.type ===
													'offline'
													? ''
													: values.video_source
														.type ===
														'embedded'
														? 'place your embedded code here'
														: values.video_source
															.type ===
															'gumlet'
															? __(
																'Gumlet Asset ID (e.g. 64a1b2c3d4e5f6789)',
																'academy'
															)
															: `${capitalizeFirstLetter(values.video_source.type)} video url`
											}
										/>
										{(values.video_source.type ===
											'online' ||
											values.video_source.type ===
											'offline') && (
												<div className="academy-lesson-form--container-body--setting-navigation flex gap-1">
													<p className="academy-sub-title">
														{__(
															'If the field is empty it will work as Offline Class Address.',
															'academy'
														)}
													</p>
													<Link
														to={`${route_path}admin.php?page=academy-settings&path=general`}
														className="academy-sub-title"
													>
														{__(
															'Go to Settings page',
															'academy'
														)}
													</Link>
												</div>
											)}
									</>
								)}
							</>
						)}
						{/* Online/Offline are classes, not videos — no subtitles. */}
						{isShowVideoSource() &&
							!['online', 'offline'].includes(
								values.video_source.type
							) && (
								<LessonSubtitles
									values={values}
									saveValueHandler={saveValueHandler}
								/>
							)}
						{values.video_source.type === 'external' && (
							<p className="academy-warning-text flex items-center mt-2.5">
								<span className="academy-icon academy-icon--information"></span>
								{__(
									'Auto-complete and auto-load next lesson features will not work for lessons with external links.',
									'academy'
								)}
							</p>
						)}
						{values.video_source.type === 'gumlet' && (
							<p className="academy-warning-text flex items-center mt-2.5">
								<span className="academy-icon academy-icon--information"></span>
								{__(
									'Enter your Gumlet Video Asset ID above. Secure playback requires Gumlet to be configured under Settings → Learn Page.',
									'academy'
								)}
							</p>
						)}
					</div>
				)}
				{(values.video_source.type === 'online' ||
					values.video_source.type === 'offline') && (
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h3 className="m-0 text-sm font-medium text-academy-text">
									{__('Attendance Required', 'academy')}
								</h3>
								<p className="m-0 mt-1 text-xs text-academy-gray-dark">
									{__(
										"This lesson requires student's attendance.",
										'academy'
									)}
								</p>
							</div>
							<div className="shrink-0">
								<Field
									type="checkbox"
									name="meta.is_required_to_attendance"
									component={SwitchControl}
								/>
							</div>
						</div>
					)}
				{getAddonActiveStatus(allAddons, 'scorm', true) && (
					<LessonScormUpload />
				)}

				<div className='flex justify-between'>
					<div>
						<h3 className="m-0 text-sm font-medium text-academy-text">
							{__('Video Playback Time', 'academy')}
						</h3>
						<p className="m-0 mt-1 text-xs text-academy-gray-dark">
							{__(
								'Set the expected time duration for this lesson',
								'academy'
							)}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						{[
							{ name: 'hours', label: __('Hrs', 'academy') },
							{ name: 'minutes', label: __('Min', 'academy') },
							{ name: 'seconds', label: __('Sec', 'academy') },
						].map(({ name, label }) => (
							<div className='group flex items-stretch rounded overflow-hidden border border-solid border-academy-border transition-colors hover:border-primary focus-within:border-primary'>
								<label
									key={name}
									htmlFor={`lesson-duration-${name}`}
									className="flex items-stretch"
								>
									<Field
										id={`lesson-duration-${name}`}
										type="number"
										min="0"
										name={`meta.video_duration.${name}`}
										className="academy-input w-[84px] h-10 flex-none px-2 text-center text-sm [font-family:inherit] text-academy-text bg-academy-surface appearance-none !border-0 hover:!border-0 focus:!border-0 !rounded-none !shadow-none !outline-none focus:!outline-none focus:!shadow-none focus:!ring-0"
									/>
									<span
										className="inline-flex bg-academy-gray items-center font-normal px-3 border-l border-solid border-academy-border text-xs text-academy-text select-none transition-colors "
									>
										{label}
									</span>
								</label>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
export default LessonMeta;
