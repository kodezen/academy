import React from 'react';
import {
	can,
	can_manage_addons,
	getAddonActiveStatus,
	is_pro,
	permissionDeniedMessage,
	route_path,
} from '@Utils/helper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import ProTag from '@Components/ProTag';
import AddNewAssignment from './assignments/AddNewAssignment';
import AddNewLesson from './Lesson/AddNewLesson';
import AddNewQuiz from './quiz/AddNewQuiz';
import AddNewMeeting from './Meeting/AddNewMeeting';
import AddNewBooking from './Booking/AddNewBooking';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

// For an admin, a content type still shows here even when it can't be used
// yet — either a Pro-only type with Pro off, or a free addon that's just
// toggled off — instead of vanishing. Anyone else (an instructor) can't
// turn addons on, so for them it's left out entirely. Clicking it goes to the Add-ons page for that addon
// rather than running its normal "create new" flow. `onClickCapture`
// intercepts the click before it reaches the wrapped `AddNew*` component's
// own button.
const GatedItem = ({ addonSlug, badge, children }) => {
	const navigate = useNavigate();
	// Only an admin can turn the addon on — everyone else (instructors on
	// the frontend dashboard) just doesn't get the option.
	if (!can_manage_addons) {
		return null;
	}
	return (
		<div
			className="academy-add-new-content__gated-item"
			onClickCapture={(e) => {
				e.preventDefault();
				e.stopPropagation();
				navigate(
					`${route_path}admin.php?page=academy-addons&addon=${addonSlug}`
				);
			}}
		>
			{children}
			<span className="academy-add-new-content__badge">{badge}</span>
		</div>
	);
};

// A content type still shows here even when the current (staff) user lacks
// the permission to create it, so the list stays a stable "what content
// types exist" reference rather than reflowing per-user — but clicking it
// must not open a create form doomed to fail server-side (RestGuard already
// rejects the save). Mirrors the disabled-button + toast pattern used on the
// standalone Lessons/Quizzes pages (see `can()`/`permissionDeniedMessage()`
// call sites there) rather than silently hiding the option.
const PermissionGatedItem = ({ slug, children }) => {
	const dispatch = useDispatch();
	if (can(slug)) {
		return children;
	}
	return (
		<div
			className="academy-add-new-content__gated-item academy-add-new-content__gated-item--no-permission"
			onClickCapture={(e) => {
				e.preventDefault();
				e.stopPropagation();
				dispatch(
					showNotification({
						message: permissionDeniedMessage(slug),
						isShow: true,
						type: 'error',
					})
				);
			}}
		>
			{children}
		</div>
	);
};

const NewTabContent = ({
	itemIndex,
	isSubCurriculum,
	subCurriculumIndex,
	updateTopic,
	isAddNewItem,
	closeModal,
}) => {
	const allAddons = useSelector((state) => state.addons);

	const quizItem = (
		<PermissionGatedItem slug="academy.quizzes.create">
			<AddNewQuiz
				viewFromCourseBuilder={false}
				updateTopic={updateTopic}
				itemIndex={itemIndex}
				subCurriculumIndex={subCurriculumIndex}
				isSubCurriculum={isSubCurriculum}
				hasIcon={true}
				closeModal={closeModal}
				isAddNewItem={isAddNewItem}
			/>
		</PermissionGatedItem>
	);
	const assignmentItem = (
		<PermissionGatedItem slug="academy.assignments.create">
			<AddNewAssignment
				itemIndex={itemIndex}
				updateTopic={updateTopic}
				viewFromCourseBuilder={false}
				subCurriculumIndex={subCurriculumIndex}
				isSubCurriculum={isSubCurriculum}
				hasIcon={true}
				closeModal={closeModal}
				isAddNewItem={isAddNewItem}
			/>
		</PermissionGatedItem>
	);
	const meetingItem = (
		<PermissionGatedItem slug="academy.meeting">
			<AddNewMeeting
				itemIndex={itemIndex}
				updateTopic={updateTopic}
				subCurriculumIndex={subCurriculumIndex}
				isSubCurriculum={isSubCurriculum}
				hasIcon={true}
				closeModal={closeModal}
				isAddNewItem={isAddNewItem}
			/>
		</PermissionGatedItem>
	);
	const bookingItem = (
		<PermissionGatedItem slug="academy.tutor_booking.create">
			<AddNewBooking
				viewFromCourseBuilder={false}
				itemIndex={itemIndex}
				updateTopic={updateTopic}
				subCurriculumIndex={subCurriculumIndex}
				isSubCurriculum={isSubCurriculum}
				hasIcon={true}
				closeModal={closeModal}
				isAddNewItem={isAddNewItem}
			/>
		</PermissionGatedItem>
	);

	return (
		<div className="academy-add-new-content">
			<PermissionGatedItem slug="academy.lessons.create">
				<AddNewLesson
					viewFromCourseBuilder={false}
					updateTopic={updateTopic}
					itemIndex={itemIndex}
					subCurriculumIndex={subCurriculumIndex}
					isSubCurriculum={isSubCurriculum}
					hasIcon={true}
					closeModal={closeModal}
					isAddNewItem={isAddNewItem}
				/>
			</PermissionGatedItem>
			{getAddonActiveStatus(allAddons, 'quizzes')
				? quizItem
				: can_manage_addons && (
						<GatedItem
							addonSlug="quizzes"
							badge={
								<span className="academy-off-badge">
									{__('Off', 'academy')}
								</span>
							}
						>
							{quizItem}
						</GatedItem>
					)}
			{is_pro
				? getAddonActiveStatus(allAddons, 'assignments', true) &&
					assignmentItem
				: can_manage_addons && (
						<GatedItem
							addonSlug="assignments"
							badge={<ProTag suffix="academy-pro-badge-gradient" />}
						>
							{assignmentItem}
						</GatedItem>
					)}
			{is_pro
				? getAddonActiveStatus(allAddons, 'meeting', true) && meetingItem
				: can_manage_addons && (
						<GatedItem
							addonSlug="meeting"
							badge={<ProTag suffix="academy-pro-badge-gradient" />}
						>
							{meetingItem}
						</GatedItem>
					)}
			{is_pro
				? getAddonActiveStatus(allAddons, 'tutor-booking', true) &&
					bookingItem
				: can_manage_addons && (
						<GatedItem
							addonSlug="tutor-booking"
							badge={<ProTag suffix="academy-pro-badge-gradient" />}
						>
							{bookingItem}
						</GatedItem>
					)}
		</div>
	);
};

export default NewTabContent;
