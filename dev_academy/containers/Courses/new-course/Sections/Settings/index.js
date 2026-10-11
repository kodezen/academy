import Additional from './Tabs/Additional';
import ContentDrip from './Tabs/ContentDrip';
import General from './Tabs/General';
import React from 'react';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { can_manage_addons, getAddonActiveStatus, is_pro } from '@Utils/helper';

import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import ProTag from '@Components/ProTag';
import ProLockedContent from '@Components/ProTag/ProLockedContent';
import Buddypress from './Tabs/Buddypress';
import Buddyboss from './Tabs/Buddyboss';
import FluentCommunity from './Tabs/FluentCommunity';
import CourseActiveTimer from './Tabs/CourseActiveTimer';
import GroupPlus from './Tabs/GroupPlus';
import CoursePrerequisite from '../CoursesPrerequisite';
import './styles.scss';

// Pro off: the feature needs buying — gradient "PRO" badge.
// Pro on but this addon is switched off: it only needs enabling — orange
// "Off" badge, same convention as the Settings tabs (ChatGPT) and the course
// builder's content picker. Addon on: no badge.
const proTabTitle = (label, addonOn = false) => (
	<span className="academy-tab-title">
		{label}
		{!addonOn &&
			(is_pro ? (
				<span className="academy-off-badge">
					{__('Off', 'academy')}
				</span>
			) : (
				<ProTag suffix="academy-pro-badge-gradient" />
			))}
	</span>
);

// An off addon's tab is kept (as a locked preview) only for an admin, who
// can turn it on. Anyone else (an instructor) doesn't see the tab at all.
const onlyIfUsable = (tabs, addonOn) =>
	addonOn || can_manage_addons ? tabs : [];

const CourseSettings = () => {
	const allAddons = useSelector((state) => state.addons);
	const { values, setFieldValue } = useFormikContext();

	const { meta } = values;

	// An addon tab shows its locked "Off"/"PRO" preview only to someone who
	// can switch it on (an admin); for instructors it's left out entirely.
	const addonTab = (isOn, tabs) => (isOn || can_manage_addons ? tabs : []);

	const contentDripAddonOn = getAddonActiveStatus(allAddons, 'content-drip');
	// Always show the tab — when the addon isn't on, show the locked preview
	// instead of the real content, whether that's because Pro isn't active
	// (isProFeature: true, "upgrade") or Pro is active but this addon is
	// simply switched off (isProFeature: false, "turn it on"). Previously
	// this dropped the tab entirely for the second case, matching neither
	// state a user could actually be in.
	const contentDrip = [
		{
			name: 'content_drip',
			title: proTabTitle(
				__('Content Drip', 'academy'),
				contentDripAddonOn
			),
			className: 'meta-tab-link meta-tab-link--info',
			content: contentDripAddonOn ? (
				<ContentDrip meta={meta} setFieldValue={setFieldValue} />
			) : (
				<ProLockedContent
					isProFeature={!is_pro}
					addonName={__('Content Drip', 'academy')}
					addonIcon="academy-icon--content-drip"
					addonSlug="content-drip"
				>
					<ContentDrip meta={meta} setFieldValue={setFieldValue} />
				</ProLockedContent>
			),
		},
	];

	const prerequisiteAddonOn = getAddonActiveStatus(
		allAddons,
		'course-prerequisites'
	);
	const prerequisiteTab = [
		{
			name: 'prerequisite',
			title: proTabTitle(
				__('Prerequisite', 'academy'),
				prerequisiteAddonOn
			),
			className: 'meta-tab-link meta-tab-link--info',
			content: prerequisiteAddonOn ? (
				<CoursePrerequisite />
			) : (
				<ProLockedContent
					isProFeature={!is_pro}
					addonName={__('Course Prerequisites', 'academy')}
					addonIcon="academy-icon--course-prerequisites"
					addonSlug="course-prerequisites"
				>
					<CoursePrerequisite />
				</ProLockedContent>
			),
		},
	];

	const buddypressTab = getAddonActiveStatus(allAddons, 'buddypress', true)
		? [
				{
					name: 'buddypress',
					title: __('BuddyPress', 'academy'),
					className: 'meta-tab-link meta-tab-link--info',
					content: (
						<Buddypress meta={meta} setFieldValue={setFieldValue} />
					),
				},
			]
		: [];

	const buddybossTab = getAddonActiveStatus(allAddons, 'buddyboss', true)
		? [
				{
					name: 'buddyboss',
					title: __('BuddyBoss', 'academy'),
					className: 'meta-tab-link meta-tab-link--info',
					content: (
						<Buddyboss meta={meta} setFieldValue={setFieldValue} />
					),
				},
			]
		: [];

	const fluentCommunity = getAddonActiveStatus(
		allAddons,
		'fluent-community',
		true
	)
		? [
				{
					name: 'fluentCommunity',
					title: __('Fluent Community', 'academy'),
					className: 'meta-tab-link meta-tab-link--info',
					content: (
						<FluentCommunity
							meta={meta}
							setFieldValue={setFieldValue}
						/>
					),
				},
			]
		: [];

	const courseActiveTimerAddonOn = getAddonActiveStatus(
		allAddons,
		'course-active-timer'
	);
	const courseActiveTimer = [
		{
			name: 'course_active_timer',
			title: proTabTitle(
				__('Course Active Timer', 'academy'),
				courseActiveTimerAddonOn
			),
			className: 'meta-tab-link meta-tab-link--info',
			content: courseActiveTimerAddonOn ? (
				<CourseActiveTimer meta={meta} setFieldValue={setFieldValue} />
			) : (
				<ProLockedContent
					isProFeature={!is_pro}
					addonName={__('Course Active Timer', 'academy')}
					addonIcon="academy-icon--clock"
					addonSlug="course-active-timer"
				>
					<CourseActiveTimer
						meta={meta}
						setFieldValue={setFieldValue}
					/>
				</ProLockedContent>
			),
		},
	];

	const groupPlusAddonOn = getAddonActiveStatus(allAddons, 'group-plus');
	// Seat validity and volume pricing, both from Group Plus, in one tab.
	const groupPlusTab = [
		{
			name: 'group_plus',
			title: proTabTitle(__('Group Plus', 'academy'), groupPlusAddonOn),
			className: 'meta-tab-link meta-tab-link--info',
			content: groupPlusAddonOn ? (
				<GroupPlus />
			) : (
				<ProLockedContent
					isProFeature={!is_pro}
					addonName={__('Group Plus', 'academy')}
					addonIcon="academy-icon--group-plus"
					addonSlug="group-plus"
				>
					<GroupPlus />
				</ProLockedContent>
			),
		},
	];

	return (
		<div className="academy-postbox academy-postbox--settings">
			<div className="academy-postbox__header">
				<h2 className="academy-heading">
					{__('Course Settings', 'academy')}
				</h2>
			</div>
			<div className="academy-postbox__body">
				<TabPanel
					className="meta-tabs"
					initialTabName="general"
					activeClass="meta-tab-link--selected"
					tabs={[
						{
							name: 'general',
							title: __('General', 'academy'),
							className: 'meta-tab-link meta-tab-link--general',
							content: (
								<General
									meta={meta}
									setFieldValue={setFieldValue}
								/>
							),
						},
						{
							name: 'info',
							title: __('Additional Info', 'academy'),
							className: 'meta-tab-link meta-tab-link--info',
							content: (
								<Additional
									meta={meta}
									setFieldValue={setFieldValue}
								/>
							),
						},
						...onlyIfUsable(prerequisiteTab, prerequisiteAddonOn),
						...onlyIfUsable(contentDrip, contentDripAddonOn),
						...buddypressTab,
						...buddybossTab,
						...fluentCommunity,
						...onlyIfUsable(courseActiveTimer, courseActiveTimerAddonOn),
						...onlyIfUsable(groupPlusTab, groupPlusAddonOn),
					]}
				>
					{(tab) => (
						<div className="meta-tab-content">{tab.content}</div>
					)}
				</TabPanel>
			</div>
		</div>
	);
};

export default CourseSettings;
