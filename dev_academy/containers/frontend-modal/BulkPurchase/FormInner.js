import React from 'react';
import { __ } from '@wordpress/i18n';
import { Field, useFormikContext } from 'formik';
import Select from '@Components/AcademySelect';

const FormInner = ({ handleChange, content, groupOptions }) => {
	const { values, setFieldValue } = useFormikContext();
	return (
		<div className="academy-column-items">
			<div className="academy-flex">
				<span className="academy-title">
					{__(
						'Choose an existing group or a new group for this bulk purchase.',
						'academy'
					)}
				</span>
				<div className="academy-flex academy-bulk-purchase-modal-radio">
					<div className="academy-flex academy-bulk-purchase-modal-radio--select">
						<label htmlFor="new_group" className="academy-title">
							{__('New Group', 'academy')}
						</label>
						<input
							id="new_group"
							type="radio"
							checked={content === 'new_group'}
							onChange={() => {
								setFieldValue('type', 'new_group');
								handleChange('new_group');
							}}
						/>
					</div>
					<div className="academy-flex academy-bulk-purchase-modal-radio--select">
						<label
							htmlFor="existing_groups"
							className="academy-title"
						>
							{__('Existing Groups', 'academy')}
						</label>
						<input
							id="existing_groups"
							type="radio"
							checked={content === 'existing_groups'}
							onChange={() => {
								setFieldValue('type', 'group_existing');
								handleChange('existing_groups');
							}}
						/>
					</div>
				</div>
			</div>
			<div className="academy-column-items">
				<label htmlFor="quantity" className="academy-title">
					{__('Quantity', 'academy')}
				</label>
				<Field
					id="quantity"
					name="quantity"
					type="number"
					className="academy-input"
					placeholder={__('Enter quantity', 'academy')}
				/>
			</div>
			{content === 'new_group' ? (
				<div className="academy-column-items">
					<label htmlFor="group_name" className="academy-title">
						{__('Group Name', 'academy')}
					</label>
					<Field
						id="group_name"
						name="group_name"
						type="text"
						className="academy-input"
						placeholder={__('Enter Group Name', 'academy')}
					/>
				</div>
			) : (
				<div className="academy-column-items">
					<label htmlFor="group" className="academy-title">
						{__('Select Group', 'academy')}
					</label>
					<Select
						id="group"
						name="quantity"
						className="academy-select"
						placeholder={__('Select Group', 'academy')}
						options={groupOptions}
						menuPlacement="top"
						onChangeHandler={(val) => {
							const opt = groupOptions.find(
								(o) => o.value === val
							);
							setFieldValue('group_id', opt?.value);
							setFieldValue('group_name', opt?.label);
						}}
						value={values.groups}
					/>
				</div>
			)}
		</div>
	);
};

export default FormInner;
