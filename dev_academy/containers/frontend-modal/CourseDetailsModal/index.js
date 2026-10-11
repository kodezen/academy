import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import ReactModal from '@Components/Modal/ReactModal';
import CourseDetailsTable from './CourseDetailsTable';

function CourseDetails() {
	const [openModal, setOpenModal] = useState(false);
	const [courseID, setCourseID] = useState(null);

	useEffect(() => {
		const viewDetailsElements = document.querySelectorAll(
			'.academy-widget-enroll__view_details'
		);
		if (viewDetailsElements) {
			viewDetailsElements.forEach((element) => {
				const dataId = element.getAttribute('data-id');
				element.children[0].addEventListener('click', () => {
					setOpenModal(true);
					setCourseID(dataId);
				});
			});
		}
	}, [courseID]);

	const closeModal = () => {
		setOpenModal(false);
		setCourseID(null);
	};

	return (
		<ReactModal
			isOpen={openModal}
			onRequestClose={closeModal}
			title={__('Course Details', 'academy')}
			suffix="analytics-course-details"
			size="medium"
		>
			<CourseDetailsTable courseID={courseID} />
		</ReactModal>
	);
}

export default CourseDetails;
