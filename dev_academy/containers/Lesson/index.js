import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button';
import LessonEditor from '@Containers/Courses/new-course/LessonEditor';
import LessonModal from '@Containers/Lesson/LessonModal';
import LessonsTable from '@Containers/Lesson/LessonsTable';
import TopBar from '@Components/TopBar';
import SubTopBar from '@Components/SubTopBar';
import { __ } from '@wordpress/i18n';
import GetHelp from '@Components/GetHelp';
import { is_admin, can, permissionDeniedMessage } from '@Utils/helper';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const Lessons = ({ redirectUrl }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [searchParams] = useSearchParams();
	const canCreateLesson = can('academy.lessons.create');

	// wp-admin keeps the route-based (full-page) lesson editor.
	const lessonForm = searchParams.get('lesson_form');
	const isEditorRoute = is_admin && ['new', 'edit'].includes(lessonForm);
	const itemId = searchParams.get('item_id');

	const goToEditor = (id = null) => {
		const sp = new URLSearchParams(searchParams);
		sp.set('lesson_form', id ? 'edit' : 'new');
		if (id) {
			sp.set('item_id', String(id));
		} else {
			sp.delete('item_id');
		}
		navigate(`?${sp.toString()}`);
	};

	const goToList = () => {
		const sp = new URLSearchParams(searchParams);
		sp.delete('lesson_form');
		sp.delete('item_id');
		navigate(`?${sp.toString()}`);
	};

	// Frontend (instructor) dashboard opens a modal instead.
	const [lessonModal, setLessonModal] = useState({
		isOpen: false,
		formData: {},
	});

	const closeLessonModal = () => {
		setLessonModal({ isOpen: false, formData: {} });
	};

	const lessonFormOpenHandler = (params = null) => {
		if (is_admin) {
			goToEditor(params?.ID || params?.id || null);
		} else {
			setLessonModal({ isOpen: true, formData: params || {} });
		}
	};

	if (isEditorRoute) {
		return (
			<LessonEditor
				headerMode="topbar"
				lessonId={itemId}
				topics={[]}
				isDripContentEnable={false}
				leadingCrumbs={[
					{
						label: __('Lessons', 'academy'),
						onClick: goToList,
					},
				]}
				onSaved={(item) => {
					const sp = new URLSearchParams(searchParams);
					sp.set('lesson_form', 'edit');
					sp.set('item_id', String(item.id));
					navigate(`?${sp.toString()}`, { replace: true });
				}}
				onBack={goToList}
			/>
		);
	}

	return (
		<>
			<TopBar
				render={() => (
					<>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{__('All Lessons', 'academy')}
						</h3>
						<GetHelp filterText={['lesson']} />
					</>
				)}
				label={__('All Lessons', 'academy')}
			/>
			{/* The page's main action sits on its title row, as on Courses. */}
			<SubTopBar heading={__('All Lessons', 'academy')}>
				<Button
					type="button"
					isDisabled={is_admin && !canCreateLesson}
					title={
						is_admin && !canCreateLesson
							? permissionDeniedMessage('academy.lessons.create')
							: undefined
					}
					onClick={() => {
						if (!is_admin) {
							lessonFormOpenHandler();
							return;
						}
						if (!canCreateLesson) {
							dispatch(
								showNotification({
									message: permissionDeniedMessage(
										'academy.lessons.create'
									),
									isShow: true,
									type: 'error',
								})
							);
							return;
						}
						goToEditor();
					}}
					label={__('Add New Lesson', 'academy')}
				/>
			</SubTopBar>
			<div className="academy-page-content academy-page-content--lessons">
				<LessonsTable
					lessonFormOpenHandler={lessonFormOpenHandler}
					redirectUrl={redirectUrl}
				/>
			</div>
			{!is_admin && (
				<LessonModal
					isOpenModal={lessonModal.isOpen}
					formData={lessonModal.formData}
					topics={[]}
					isDripContentEnable={false}
					isAddNewItem={true}
					closeModal={closeLessonModal}
					onRequestClose={closeLessonModal}
				/>
			)}
		</>
	);
};

export default Lessons;
