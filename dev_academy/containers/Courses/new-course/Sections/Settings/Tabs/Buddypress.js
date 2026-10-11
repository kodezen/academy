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

export default function Buddypress() {
	const [options, setOptions] = useState([]);
	const { values, setFieldValue } = useFormikContext();

	// The addon tab itself only checks the "buddypress" addon toggle (which in
	// turn only requires the plugin to be active at the time it was turned on —
	// see includes/addons.php's required_plugin check). It has no way to know
	// whether BuddyPress's own Groups/Activity components (BuddyPress > Settings
	// > Components) are enabled, which is what academy-pro's Buddypress::load()
	// actually gates the group-fetch AJAX handler on. Without this, a
	// mismatched component setup means the "Search Groups" select just sits
	// empty with a silently failed 400 request and no clue why.
	const pluginActive = !!active_plugins?.buddypress_is_active;
	const groupsActive = pluginActive && !!bp_components_status?.groups_active;
	const activityActive =
		pluginActive && !!bp_components_status?.activity_active;
	const settingsUrl = bp_components_status?.buddypress_settings_url;

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
			action: 'academy_pro/buddypress/groups',
		})
			.then((response) => {
				const dataHolder = response.data?.data?.groups ?? [];
				const options = dataHolder.map((item) => {
					// BuddyPress returns group ids as strings, but the meta is an
					// integer array, so the saved value comes back as numbers.
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
					title={__('BuddyPress is not active', 'academy')}
					description={__(
						'Activate the BuddyPress plugin to attach groups and an activity feed to this course.',
						'academy'
					)}
				/>
			)}

			{can_manage_addons && pluginActive && !groupsActive && (
				<WarningNotice
					title={__(
						'BuddyPress "Groups" component is disabled',
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
									'Enable it under BuddyPress → Settings → Components',
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
						'BuddyPress "Activity Streams" component is disabled',
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
									'Enable it under BuddyPress → Settings → Components',
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
						{__('Active BuddyPress', 'academy')}
					</span>
					<span className="sub-title">
						{__(
							'Enable BuddyPress group activity feeds',
							'academy'
						)}
					</span>
				</div>
				<div className="meta-field__body">
					<Field
						id="qa"
						type="checkbox"
						name="meta.is_buddypress_notification_active"
						component={SwitchControl}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--buddypress">
				<div className="meta-field__label">
					<span className="academy-title">
						{__('Search Groups', 'academy')}
					</span>
					<span className="sub-title">
						{__('BuddyPress Groups', 'academy')}
					</span>
				</div>
				<div className="meta-field__body">
					<Select2
						id="assigned_buddypress_groups"
						isMulti={true}
						isDisabled={!groupsActive}
						className="academy-select academy-select--buddypress"
						onChangeHandler={(selected) => {
							const optionsIds = selected.map(
								(item) => item.value
							);
							setFieldValue(
								'meta.assigned_buddypress_groups',
								optionsIds
							);
						}}
						options={options}
						value={options.filter((item) =>
							(
								values?.meta?.assigned_buddypress_groups ?? []
							).some((value) => item.value === parseInt(value, 10))
						)}
						onMenuOpen={fetchDataHandler}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}
