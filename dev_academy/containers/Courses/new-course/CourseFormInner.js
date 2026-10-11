import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import StatusSelect from '@Components/SubmitBox/StatusSelect';
import Button from '@Components/Button';
import { getCoursePreviewUrl } from './helper';
import TopBar from '@Components/TopBar';
import { __ } from '@wordpress/i18n';
import { getStatusActionLabel } from '@Utils/statusLabel';
import StatusBadge from '@Components/StatusBadge';
import CourseBuilder from './builder';
import General from './Sections/General';
import CourseInstructors from './Sections/CourseInstructor';
import CourseType from './Sections/CourseType';
import FeatureImageAndIntro from './Sections/FeatureImageAndIntro';
import CourseTaxonomy from './Sections/CourseTaxonomy';
import CourseSettings from './Sections/Settings';
import { useFormikContext } from 'formik';
import { current_user_can, is_admin } from '@Utils/helper';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CourseCertificate from './Sections/CourseCertificate/index';
import CustomFieldGroup from './Sections/CustomFieldGroup';
import Attachment from './Sections/Attachment/Attachment';
import {
	Stepper,
	OverviewStepIcon,
	BuilderStepIcon,
	SettingsStepIcon,
} from '@Components/ui';

const CourseFormInner = ({
	id,
	isShowCourseType,
	setLoading,
	stepperSlotNode = null,
}) => {
	const { values, setFieldValue, dirty, isSubmitting, handleSubmit } =
		useFormikContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const settings = useSelector((state) => state.settings);
	// Instructors can only publish directly when the site admin has enabled
	// it in Settings > Pages > Instructor Page; admins are never restricted.
	const canPublishCourse =
		is_admin || Boolean(settings?.data?.is_instructor_can_publish_course);

	const tabs = [
		{
			key: 'overview',
			label: __('Overview', 'academy'),
			icon: <OverviewStepIcon />,
		},
		{
			key: 'builder',
			label: __('Builder', 'academy'),
			icon: <BuilderStepIcon />,
		},
		{
			key: 'settings',
			label: __('Settings', 'academy'),
			icon: <SettingsStepIcon />,
		},
	];

	// The active step lives in the URL (`step`) so it deep-links and survives
	// returning from the full-page lesson editor. Programmatic updates don't
	// trip the NavigationBlocker (it only catches back/anchor/refresh).
	const stepParam = searchParams.get('step');
	const activeTab = tabs.some((t) => t.key === stepParam)
		? stepParam
		: 'overview';
	const setActiveTab = (key) => {
		const sp = new URLSearchParams(searchParams);
		sp.set('step', key);
		setSearchParams(sp, { replace: true });
	};

	// Panels stay mounted and are toggled with `hidden` so the course builder
	// and rich-text editors keep their state when switching tabs.
	const panelClass = (key) => (activeTab === key ? '' : 'hidden');

	const stepper = (
		<Stepper steps={tabs} value={activeTab} onChange={setActiveTab} />
	);

	const stepKeys = tabs.map((t) => t.key);
	const activeIndex = stepKeys.indexOf(activeTab);
	const isLastStep = activeIndex === stepKeys.length - 1;
	const isEditingPublished =
		Boolean(id || values.post_ID) && values.status === 'publish';

	// Auto-create the course as a draft the moment it has a title, mirroring
	// WordPress's own auto-draft behavior for posts. Without this, a
	// brand-new course has no real post ID until the admin explicitly clicks
	// "Save & Continue" — and several Course Type features (StoreEngine's
	// "Add Price" chief among them: it needs a real course_id to attach a
	// product to) simply can't be used before that, which is what made the
	// price/type-sync bugs possible in the first place. Reuses the exact
	// same `handleSubmit` → `onSubmitHandler` → `createNewCourse` path a
	// manual "Save & Continue" already goes through (including its
	// duplicate-create guards), just triggered automatically instead of by
	// a click. Fires once per mount, debounced so it doesn't fire on every
	// keystroke.
	const hasAutoCreatedRef = useRef(false);
	useEffect(() => {
		if (id || values.post_ID || hasAutoCreatedRef.current) {
			return;
		}
		const title = values.title?.trim();
		if (!title) {
			return;
		}
		const timeout = setTimeout(() => {
			hasAutoCreatedRef.current = true;
			handleSubmit();
		}, 1000);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values.title, id, values.post_ID]);

	const saveThen = (advance) => {
		handleSubmit();
		// A brand-new course without a title can't be saved (the submit
		// handler just shows "Title missing!"), so stay on this step.
		if (advance && !isLastStep && values.title?.trim()) {
			setActiveTab(stepKeys[activeIndex + 1]);
		}
	};

	// Same publish control (Publish/Draft/Private + schedule) on every step —
	// it used to be last-step-only, which meant a course couldn't be
	// published (or saved as Private, etc.) without clicking through every
	// step first. Earlier steps just relabel the primary action
	// "Save & Continue" and advance the wizard after saving; picking a
	// status still only stages it in Formik state (StatusSelect's own
	// behavior) until that primary action actually saves it.
	//
	// With nothing unsaved the button is only faded (`isMuted`), never
	// disabled: "Save & Continue" still has to advance the wizard, and
	// saving unchanged values is a harmless update.
	//
	// Plain "Save" (save without advancing) lives in the caret menu rather
	// than as a second topbar button. The last step has no "continue"
	// destination, so it doesn't need it.
	const saveButtons = (
		<StatusSelect
			name="status"
			type="course"
			isSubmitted={isSubmitting}
			value={values.status}
			saveValueHandler={setFieldValue}
			label={
				isLastStep
					? getStatusActionLabel(values.status, isEditingPublished)
					: __('Save & Continue', 'academy')
			}
			isMuted={!dirty}
			showStickyOption={true}
			disabledOptionValues={canPublishCourse ? [] : ['publish']}
			disabledOptionReason={__(
				'Publishing is disabled for instructors by the site admin.',
				'academy'
			)}
			extraActions={
				isLastStep
					? []
					: [
							{
								key: 'save',
								label: __('Save', 'academy'),
								description: __(
									'Save without leaving this step',
									'academy'
								),
								onClick: () => saveThen(false),
							},
						]
			}
			// `submitHandler` already runs handleSubmit on click; a default
			// type="submit" inside <Form> would fire it a second time, sending
			// two identical parallel saves (which races and 500s on meta).
			submitButtonType="button"
			submitHandler={() => saveThen(!isLastStep)}
		/>
	);

	return (
		<>
			<TopBar
				render={() => (
					<h3 className="academy-topbar-heading flex items-center gap-3">
						<span className="flex items-center">
							<span className="academy-icon academy-icon--angle-right" />
							{id
								? __('Edit Course', 'academy')
								: __('Add New Course', 'academy')}
						</span>
						<StatusBadge status={values.status || 'draft'} />
					</h3>
				)}
				centerContent={() => stepper}
				rightContent={() => (
					<div className="academy-course-topbar-right">
						{getCoursePreviewUrl(values.link) && (
							<Button
								type="link"
								link={getCoursePreviewUrl(values.link)}
								target="_blank"
								preset="transparent"
								suffix="course-preview"
								ariaLabel={__('Preview', 'academy')}
								icon={
									<span
										className="academy-icon academy-icon--link-arrow"
										title={__('Preview', 'academy')}
									/>
								}
							/>
						)}
						{saveButtons}
					</div>
				)}
			/>
			<div className="academy-page-content academy-page-content--course academy-editor academy-editor--course">
				{/* Frontend has no admin topbar: the course modal's header gets
				the stepper (portaled into its centre slot); inline otherwise. */}
				{!is_admin &&
					(stepperSlotNode ? (
						createPortal(stepper, stepperSlotNode)
					) : (
						<div className="mb-6 flex justify-center">{stepper}</div>
					))}

				{/* Overview: basic info + existing sidebar settings */}
				<div className={panelClass('overview')}>
					<div className="academy-editor__content">
						<div className="entry-left">
							<General />
							<FeatureImageAndIntro />
						</div>
						<div className="entry-right">
							{isShowCourseType && <CourseType />}

							<CourseTaxonomy />

							<Attachment />

							{current_user_can.manage_options && (
								<CourseInstructors
									course_id={id}
									saveValueHandler={setFieldValue}
								/>
							)}
						</div>
					</div>
				</div>

				{/* Builder */}
				<div className={panelClass('builder')}>
					<CourseBuilder />
				</div>

				{/* Settings */}
				<div className={panelClass('settings')}>
					<div className="academy-editor__content-meta">
						<CourseSettings />
						<CourseCertificate
							course_id={id}
							saveValueHandler={setFieldValue}
						/>
						<CustomFieldGroup />
					</div>
				</div>
			</div>
		</>
	);
};

export default CourseFormInner;
