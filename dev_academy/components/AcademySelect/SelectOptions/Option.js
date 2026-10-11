import React from 'react';

const Option = ({ option, index, isActive, suffix = '', handleSelectValue }) => {
	return (
		<span
			role="presentation"
			key={index}
			className={`academy-custom-select--option${
				isActive ? ' academy-custom-select--option--active' : ''
			}${suffix ? ` academy-custom-select--option--${suffix}` : ''}`}
			onClick={() => handleSelectValue(option)}
			onKeyDown={() => {}}
		>
			<span className="academy-custom-select--option-label">
				{option?.label}
			</span>
			{isActive && (
				<svg
					className="academy-custom-select--option-check"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
				>
					<path
						d="M13.5 4.5L6.5 12L2.5 8.5"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			)}
		</span>
	);
};

export default Option;
