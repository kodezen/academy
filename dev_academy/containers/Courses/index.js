/* eslint-disable no-undef, camelcase */
import React, { useState, useEffect } from 'react';
import CoursesTable from './CoursesTable';
import TopBar from '@Components/TopBar';
import GetHelp from '@Components/GetHelp';
import { __ } from '@wordpress/i18n';
import { is_admin, makeRequest } from '@Utils/helper';
import NewCourse from './new-course';
import CourseSubTopBar from './CourseSubTopBar';
import CourseTabs from './CourseTabs';
import { useNavigate } from 'react-router-dom';

const propTypes = {};

const Courses = ({ redirectUrl }) => {
	const navigate = useNavigate();
	const [openModal, isModalOpen] = useState(false);
	const [contentLoading, setContentLoading] = useState(false);
	const [editItemID, setEditItemID] = useState(0);

	const openModalHandler = (id) => {
		setContentLoading(true);
		isModalOpen(true);
		setEditItemID(id);
		setTimeout(() => {
			setContentLoading(false);
		}, 500);
	};

	const onRequestClose = () => {
		isModalOpen(false);
		setEditItemID(0);
	};

	return (
		<React.Fragment>
			<TopBar
				render={() => (
					<React.Fragment>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{__('All Courses', 'academy')}
						</h3>
						<GetHelp filterText={['course', 'courses private']} />
					</React.Fragment>
				)}
				centerContent={() => (
					<CourseTabs navigate={navigate} value="courses" />
				)}
			/>

			<CourseSubTopBar
				setEditItemID={setEditItemID}
				isModalOpen={isModalOpen}
			/>

			<div className="academy-page-content academy-page-content--courses">
				<CoursesTable
					openModalHandler={openModalHandler}
					setEditItemID={setEditItemID}
					isModalOpen={isModalOpen}
					redirectUrl={redirectUrl}
				/>
			</div>

			{!is_admin && openModal && (
				<NewCourse
					openModal={openModal}
					onRequestClose={onRequestClose}
					id={editItemID}
					setEditItemID={setEditItemID}
					contentLoading={contentLoading}
				/>
			)}
		</React.Fragment>
	);
};

Courses.propTypes = propTypes;
export default Courses;
