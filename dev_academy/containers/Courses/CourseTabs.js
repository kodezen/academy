import React from 'react';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import RouteTabs from '@Components/TopBar/RouteTabs';
import { getAddonActiveStatus } from '@Utils/helper';

const TABS = [
	{
		key: 'courses',
		page: 'academy-courses',
		label: __('All Courses', 'academy'),
		icon: 'course',
	},
	{
		key: 'bundles',
		page: 'academy-course-bundle',
		label: __('Bundles', 'academy'),
		icon: 'course-bundle',
		addon: 'course-bundle',
		// A Pro addon: its saved "on" state outlives deactivating Pro.
		pro: true,
	},
	{
		key: 'certificates',
		page: 'academy-certificates',
		label: __('Certificates', 'academy'),
		icon: 'certificate-list',
		addon: 'certificates',
	},
];

/*
 * Courses / Bundles / Certificates tabs for those three list pages' top bar.
 * Bundles and Certificates show only while their addon is active; with
 * Courses alone there's nothing to switch to, so no tabs. `navigate` comes
 * from the page: Pro (Bundles) has its own router copy.
 */
const CourseTabs = ({ navigate, value }) => {
	const addons = useSelector((state) => state.addons);
	const tabs = TABS.filter(
		(tab) =>
			!tab.addon || getAddonActiveStatus(addons, tab.addon, !!tab.pro)
	);
	if (tabs.length < 2) {
		return null;
	}
	return (
		<RouteTabs
			page="academy-courses"
			tabs={tabs}
			value={value}
			navigate={navigate}
		/>
	);
};

export default CourseTabs;
