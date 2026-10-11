import React, { useEffect, useState } from 'react';
import { Field, useFormikContext } from 'formik';
import { __ } from '@wordpress/i18n';
import Select2 from '@Components/AcademySelect';
import SwitchControl from '@Components/Formik/Checkbox/SwitchControl';
import WarningNotice from '@Components/WarningNotice/WarningNotice';
import {
	active_plugins,
	bp_components_status,
	can_manage_addons,
	makeRequest,
} from '@Utils/helper';

export default function Buddyboss() {
	const [options, setOptions] = useState([]);
	const { values, setFieldValue } = useFormikContext();

	// See Buddypress.js's matching comment — same gap, same fix: the addon tab
	// only checks the "buddyboss" addon toggle, not BuddyBoss's own
	// Groups/Activity components, which is what academy-pro's
	// Buddyboss::load() actually gates the group-fetch AJAX handler on.
	const pluginActive = !!active_plugins?.buddyboss_is_active;
	const groupsActive = pluginActive && !!bp_components_status?.groups_active;
	const activityActive =
		pluginActive && !!bp_components_status?.activity_active;
	const settingsUrl = bp_components_status?.buddyboss_settings_url;

	useEffect(() => {
		if (groupsActive) {
			fetchDataHandler();
		}
	}, [groupsActive]);

	const fetchDataHandler = () => {
		if (!groupsActive) {
			return;
		}
		makeRequest({
			action: 'academy_pro/buddyboss/groups',
		})
			.then((response) => {
				const dataHolder = response.data?.data?.groups ?? [];
				const options = dataHolder.map((item) => {
					// Group ids come back as strings, but the meta is an integer
					// array, so the saved value comes back as numbers.
					return { value: parseInt(item.id, 10), label: item.name };
				});
				setOptions(options);
			})
			.catch(() => {
				setOptions([]);
			});
	};

	// Site-setup warnings (activate the plugin / enable a component) are
	// admin actions — instructors don't see them.
	return (
		<React.Fragment>
			{can_manage_addons && !pluginActive && (
				<WarningNotice
					title={__('BuddyBoss is not active', 'academy')}
					description={__(
						'Activate the BuddyBoss Platform plugin to attach groups and an activity feed to this course.',
						'academy'
					)}
				/>
			)}

			{can_manage_addons && pluginActive && !groupsActive && (
				<WarningNotice
					title={__(
						'BuddyBoss "Groups" component is disabled',
						'academy'
					)}
					description={
						<>
							{__(
								'No groups can be listed here until the Groups component is enabled. ',
								'academy'
							)}
							<a href={settingsUrl} target="_blank" rel="noopener noreferrer">
								{__(
									'Enable it under BuddyBoss → Settings → Components',
									'academy'
								)}
							</a>
							{__(', then reload this page.', 'academy')}
						</>
					}
				/>
			)}

			{can_manage_addons && groupsActive && !activityActive && (
				<WarningNotice
					title={__(
						'BuddyBoss "Activity Streams" component is disabled',
						'academy'
					)}
					description={
						<>
							{__(
								'Groups can be selected below, but the course activity feed needs the Activity Streams component too. ',
								'academy'
							)}
							<a href={settingsUrl} target="_blank" rel="noopener noreferrer">
								{__(
									'Enable it under BuddyBoss → Settings → Components',
									'academy'
								)}
							</a>
							.
						</>
					}
				/>
			)}

			<div className="meta-field meta-field--qa">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Active BuddyBoss', 'academy')}
					</span>
					<span className="sub-title">
						{__('Enable BuddyBoss group activity feeds', 'academy')}
					</span>
				</div>
				<div className="meta-field__body">
					<Field
						id="qa"
						type="checkbox"
						name="meta.is_buddyboss_notification_active"
						component={SwitchControl}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--buddyboss">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Search Groups', 'academy')}
					</span>
					<span className="sub-title">
						{__('BuddyBoss Groups', 'academy')}
					</span>
				</div>
				<div className="meta-field__body">
					<Select2
						id="assigned_buddyboss_groups"
						isMulti={true}
						isDisabled={!groupsActive}
						className="academy-select academy-select--buddyboss"
						onChangeHandler={(selected) => {
							const optionsIds = selected.map(
								(item) => item.value
							);
							setFieldValue(
								'meta.assigned_buddyboss_groups',
								optionsIds
							);
						}}
						options={options}
						value={options.filter((item) =>
							(
								values?.meta?.assigned_buddyboss_groups ?? []
							).some((value) => item.value === parseInt(value, 10))
						)}
						onMenuOpen={fetchDataHandler}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}
