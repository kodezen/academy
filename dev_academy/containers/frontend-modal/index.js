import React from 'react';
import PopupLogin from './PopupLogin';
import WishList from './WishList';
import CompleteCourse from './CompleteCourse';
import CourseDetails from './CourseDetailsModal';
import Notification from '@Components/Notification';
import BulkPurchase from './BulkPurchase/index.js';

export default function FrontendModal() {
	return (
		<React.Fragment>
			<Notification icon={false} hideProgressBar={true} />
			<PopupLogin />
			<WishList />
			<CompleteCourse />
			<CourseDetails />
			{window.AcademyGlobal?.is_enabled_group_plus && <BulkPurchase />}
		</React.Fragment>
	);
}
