import React from 'react';
import GroupPlusSeatValidity from './GroupPlusSeatValidity';
import GroupPlusVolumePricing from './GroupPlusVolumePricing';

// Everything Group Plus sets per course, in one Course Settings tab:
// how long a group's seats last, and bulk (volume) seat pricing.
const GroupPlus = () => (
	<div className="academy-group-plus-settings flex flex-col gap-6">
		<GroupPlusSeatValidity />
		<div className="border-0 border-t border-solid border-academy-border" />
		<GroupPlusVolumePricing />
	</div>
);

export default GroupPlus;
