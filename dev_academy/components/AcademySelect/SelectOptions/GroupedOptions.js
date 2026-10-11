import React from 'react';
import Option from './Option';
import { optionMatchesSearch } from '../helper';

const GroupedOptions = ({
	groupItems,
	handleSelectValue,
	searchOptions,
	multiSelectValue,
	isMulti,
	groupItemsIndex,
	suffix,
}) => {
	return (
		<div className="academy-grouped-items" key={groupItemsIndex}>
			{groupItems.options.length > 0 && (
				<p className="academy-grouped-items--title">
					{groupItems.label}
				</p>
			)}

			{groupItems.options
				?.filter((option) => {
					const hasItem = isMulti
						? multiSelectValue.filter(
								(item) => item.value === option.value
							)
						: !multiSelectValue.includes(option);

					if (hasItem.length !== 0) {
						return false;
					}
					return true;
				})
				?.filter((option) => optionMatchesSearch(option, searchOptions))
				.map((option, index) => {
					return (
						<Option
							option={option}
							index={index}
							key={index}
							suffix={suffix}
							handleSelectValue={handleSelectValue}
						/>
					);
				})}
		</div>
	);
};

export default GroupedOptions;
