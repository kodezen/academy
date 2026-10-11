import React, { useContext, useEffect, useState } from 'react';

import Button from '@Components/Button';
import PropTypes from 'prop-types';
import TopicContext from '../../context/TopicContext';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { API, makeRequest, namespace, is_admin } from '@Utils/helper';
import { useNavigate, useSearchParams } from 'react-router-dom';

const propTypes = {
	updateTopic: PropTypes.bool,
	viewFromCourseBuilder: PropTypes.bool,
	itemIndex: PropTypes.number,
	item: PropTypes.object,
	hasIcon: PropTypes.bool,
};

const AddNewMeeting = ({
	item,
	itemIndex,
	isSubCurriculum,
	subCurriculumIndex,
	closeModal,
	isAddNewItem,
	updateTopic = false,
	viewFromCourseBuilder = false,
	hasIcon = false,
}) => {
	const [isOpenMeetingModal, setOpenMeetingModal] = useState(false);
	const [editMeetingData, setEditMeetingData] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const { topicUpdateHandler, subTopicUpdateHandler, moduleIndex } =
		useContext(TopicContext);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [hostEmail, setHostEmail] = useState('');
	const [existingHostEmail, setExistingHostEmail] = useState(false);

	const [meetingType, setMeetingType] = useState(false);
	const [meetingConfig, setMeetingConfig] = useState({
		google_meet: false,
		zoom: {
			account_id: '',
			client_id: '',
			client_secret: '',
		},
	});

	useEffect(() => {
		if (isOpenMeetingModal) {
			makeRequest({
				action: 'academy_pro_meeting/get_meeting_credentials',
			}).then(({ data }) => {
				if (data?.data) {
					setHostEmail(data?.data?.host_email);
				}

				if (data.data.google_meet && data.data.zoom) {
					setMeetingConfig(data.data);
				} else if (data.data.zoom && !data.data.google_meet) {
					setMeetingConfig({
						...meetingConfig,
						zoom: data?.data.zoom,
					});
				} else if (data.data.google_meet && !data.data.zoom) {
					setMeetingConfig({
						...meetingConfig,
						google_meet: data?.data.google_meet,
					});
				}
			});
		}
	}, [isOpenMeetingModal]);

	const useMeetingRoute =
		is_admin && moduleIndex !== undefined && moduleIndex !== null;

	const openMeetingModal = () => {
		if (useMeetingRoute) {
			const sp = new URLSearchParams(searchParams);
			sp.set('curriculum', 'meeting');
			sp.set('topic', String(moduleIndex ?? itemIndex));
			if (isSubCurriculum) {
				sp.set('subtopic', String(itemIndex));
			} else {
				sp.delete('subtopic');
			}
			sp.set('step', 'builder');
			if (item?.id) {
				sp.set('item_id', String(item.id));
			} else {
				sp.delete('item_id');
			}
			navigate(`?${sp.toString()}`);
			return;
		}
		// Close the "Add New Content" dropdown immediately — see AddNewLesson's
		// openLessonFormModal() for why this is now safe (Dropdown keepMounted).
		closeModal?.();
		if (item?.id) {
			setLoading(true);
			setOpenMeetingModal(true);
			API.get(`${namespace}academy_meeting/${parseInt(item.id)}`, {
				params: {
					context: 'edit',
				},
			}).then((res) => {
				setEditMeetingData(res.data);
				const parsedRequest = JSON.parse(
					res.data.meta.academy_meeting_response
				);
				setExistingHostEmail(parsedRequest.host_email);
				setMeetingType(res.data.meta.academy_meeting_type);
				setTimeout(() => {
					setLoading(false);
				}, 1000);
			});
		} else {
			setOpenMeetingModal(true);
		}
	};

	const onRequestClose = (formData = null) => {
		if (isSubCurriculum && formData) {
			subTopicUpdateHandler(
				{
					id: formData.id,
					name: formData.title.rendered,
					type: 'meeting',
				},
				itemIndex,
				subCurriculumIndex
			);
		} else if (topicUpdateHandler && formData) {
			topicUpdateHandler(
				{
					id: formData.id,
					name: formData.title.rendered,
					type: 'meeting',
				},
				itemIndex
			);
		}
		setOpenMeetingModal(false);
	};

	const meetingModalOpenHandler = (type = '', params = null) => {
		if (params) {
			setEditMeetingData(params);
		}
		setOpenMeetingModal(true);
		setMeetingType(type);
	};

	return (
		<div>
			{item?.id || viewFromCourseBuilder ? (
				<Button
					onClick={openMeetingModal}
					preset="transparent"
					size="xs"
					suffix="edit"
					icon={
						<span className="academy-icon academy-icon--edit-two"></span>
					}
					iconPosition="center"
				/>
			) : (
				<>
					{hasIcon ? (
						<Button
							onClick={() => openMeetingModal()}
							icon={
								<span className="academy-icon academy-icon--meeting"></span>
							}
							label={__('Add Meeting', 'academy')}
						/>
					) : (
						<Button
							onClick={() => openMeetingModal()}
							label={__('Create New Meeting', 'academy')}
						/>
					)}
				</>
			)}
			{isOpenMeetingModal &&
				applyFilters('academy.meeting-modal.modal', null, {
					openMeetingModal: isOpenMeetingModal,
					onRequestClose,
					formData: editMeetingData,
					isModalLoading: isLoading,
					updateTopic,
					topicUpdateHandler,
					itemIndex,
					hostEmail: existingHostEmail
						? existingHostEmail
						: hostEmail,
					isSubCurriculum,
					subCurriculumIndex,
					subTopicUpdateHandler,
					closeModal,
					isAddNewItem,
					config: meetingConfig,
					meetingType,
					setMeetingType,
					isSetupModalOpen: false,
					modalOpenHandler: meetingModalOpenHandler,
				})}
		</div>
	);
};
AddNewMeeting.propTypes = propTypes;
export default AddNewMeeting;
