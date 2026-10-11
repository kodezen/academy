import React from 'react';
import Button from '@Components/Button';

function MultiSelectValue({ option, index, handleRemoveMultiSelectValue }) {
	return (
		<div className="academy-multi-select--option" key={index}>
			<span className="academy-multi-select--option-label">
				{option?.label}
			</span>
			<Button
				className={'academy-remove-option'}
				onClick={() => handleRemoveMultiSelectValue(option)}
				icon={<span className="academy-icon academy-icon--close" />}
			/>
		</div>
	);
}

export default MultiSelectValue;
