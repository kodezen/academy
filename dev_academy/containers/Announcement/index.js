import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnnouncementTable from './AnnouncementTable';
import AnnouncementEditor from './AnnouncementEditor';
import AnnouncementModal from './AnnouncementModal';
import TopBar from '@Components/TopBar';
import SubTopBar from '@Components/SubTopBar';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import GetHelp from '@Components/GetHelp';
import { is_admin, can, permissionDeniedMessage } from '@Utils/helper';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const Announcement = ({ redirectUrl }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [searchParams] = useSearchParams();
	const canCreateAnnouncement = can('academy.announcements.create');

	// wp-admin keeps the route-based full-page editor.
	const announcementForm = searchParams.get('announcement_form');
	const isEditorRoute =
		is_admin && ['new', 'edit'].includes(announcementForm);
	const itemId = searchParams.get('item_id');

	// Frontend dashboard edits/creates announcements in a modal instead.
	const [openModal, setOpenModal] = useState(false);
	const [editItemID, setEditItemID] = useState(null);

	const goToEditor = (id = null) => {
		const sp = new URLSearchParams(searchParams);
		sp.set('announcement_form', id ? 'edit' : 'new');
		if (id) {
			sp.set('item_id', String(id));
		} else {
			sp.delete('item_id');
		}
		navigate(`?${sp.toString()}`);
	};

	const goToList = () => {
		const sp = new URLSearchParams(searchParams);
		sp.delete('announcement_form');
		sp.delete('item_id');
		navigate(`?${sp.toString()}`);
	};

	const announcementFormOpenHandler = (params = null) => {
		const id = params?.id || params?.ID || null;
		if (is_admin) {
			goToEditor(id);
		} else {
			setEditItemID(id);
			setOpenModal(true);
		}
	};

	const onModalRequestClose = () => {
		setOpenModal(false);
		setEditItemID(null);
	};

	if (isEditorRoute) {
		return (
			<AnnouncementEditor
				itemId={itemId}
				leadingCrumbs={[
					{
						label: __('Announcements', 'academy'),
						onClick: goToList,
					},
				]}
				onSaved={(item) => {
					// Stay on the editor after saving; a new announcement
					// switches to edit mode so later saves update it.
					if (!item?.id || String(item.id) === itemId) {
						return;
					}
					const sp = new URLSearchParams(searchParams);
					sp.set('announcement_form', 'edit');
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
							{__('Announcements', 'academy')}
						</h3>
						<GetHelp filterText={['announcement']} />
					</>
				)}
				label={__('Announcements', 'academy')}
			/>
			{/* The page's main action sits on its title row, as on Courses. */}
			<SubTopBar heading={__('Announcements', 'academy')}>
				<Button
					type="button"
					isDisabled={is_admin && !canCreateAnnouncement}
					title={
						is_admin && !canCreateAnnouncement
							? permissionDeniedMessage(
									'academy.announcements.create'
								)
							: undefined
					}
					onClick={() => {
						if (is_admin && !canCreateAnnouncement) {
							dispatch(
								showNotification({
									message: permissionDeniedMessage(
										'academy.announcements.create'
									),
									isShow: true,
									type: 'error',
								})
							);
							return;
						}
						announcementFormOpenHandler();
					}}
					label={__('Add New Announcement', 'academy')}
				/>
			</SubTopBar>
			<div className="academy-page-content academy-page-content--announcement">
				<AnnouncementTable
					redirectUrl={redirectUrl}
					announcementFormOpenHandler={announcementFormOpenHandler}
				/>
			</div>
			{!is_admin && openModal && (
				<AnnouncementModal
					itemId={editItemID}
					onRequestClose={onModalRequestClose}
				/>
			)}
		</>
	);
};

export default Announcement;
