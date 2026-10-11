import React, { useState } from 'react';

import Button from '@Components/Button';
import PropTypes from 'prop-types';
import Select from '@Components/AcademySelect';
import { __ } from '@wordpress/i18n';

const propTypes = {
	data: PropTypes.any,
	applyActionHandler: PropTypes.func,
	confirmMessage: PropTypes.string,
	options: PropTypes.array,
};

export default function BulkAction({
	data = [],
	applyActionHandler,
	confirmMessage = '',
	options = [{ value: 'delete', label: __('Delete', 'academy') }],
}) {
	const [bulkAction, setBulkAction] = useState({});
	const bulkMessage =
		bulkAction?.value === 'restore'
			? __('Are you sure you want to restore selected items?', 'academy')
			: confirmMessage;

	return (
		<React.Fragment>
			<div className="academy-bulk-actions">
				<Select
					className="academy-select"
					placeholder={__('Bulk Actions', 'academy')}
					isClearable={true}
					value={bulkAction?.value}
					options={options}
					onChangeHandler={(val) => setBulkAction(options.find((item) => item?.value === val) || '')}
				/>
				<Button
					type="button"
					label={__('Apply', 'academy')}
					preset="light-purple"
					onClick={() => {
						if (
							data.selectedRows &&
							data.selectedRows.length > 0 &&
							bulkAction.value &&
							confirm(bulkMessage) //eslint-disable-line
						) {
							applyActionHandler(data.selectedRows, bulkAction);
							setBulkAction('');
						}
					}}
				/>
			</div>
		</React.Fragment>
	);
}

BulkAction.propTypes = propTypes;
