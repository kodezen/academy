import React from 'react';
import Option from './Option';
import GroupedOptions from './GroupedOptions';
import { __ } from '@wordpress/i18n';
import { optionMatchesSearch } from '../helper';

const SelectOptions = ({
	isGrouped,
	value,
	options,
	isMulti,
	multiSelectValue,
	searchOptions,
	handleSelectValue,
	suffix,
}) => {
	return (
		<>
			{isGrouped ? (
				<>
					{options.length > 0 ? (
						<>
							{options.map((groupItems, groupItemsIndex) => {
								return (
									<GroupedOptions
										groupItems={groupItems}
										handleSelectValue={handleSelectValue}
										searchOptions={searchOptions}
										multiSelectValue={multiSelectValue}
										isMulti={isMulti}
										groupItemsIndex={groupItemsIndex}
										suffix={suffix}
										key={groupItemsIndex}
									/>
								);
							})}
						</>
					) : (
						<span className="academy-custom-select--default-text">
							{__('No items found', 'academy')}
						</span>
					)}
				</>
			) : (
				<>
					{options.length > 0 ? (
						<>
							{isMulti ? (
								options
									?.filter((option) => {
										const hasItem = multiSelectValue.filter(
											(item) =>
												item.value === option.value
										);

										if (hasItem.length !== 0) {
											return false;
										}
										return true;
									})
									?.filter((option) =>
										optionMatchesSearch(
											option,
											searchOptions
										)
									)
									.map((option, index) => (
										<Option
											option={option}
											index={index}
											key={index}
											suffix={suffix}
											handleSelectValue={
												handleSelectValue
											}
										/>
									))
							) : (
								<>
									{options
										?.filter((option) =>
											optionMatchesSearch(
												option,
												searchOptions
											)
										)
										?.map((option, index) => (
											<Option
												option={option}
												index={index}
												key={index}
												isActive={
													value === option.value
												}
												suffix={suffix}
												handleSelectValue={
													handleSelectValue
												}
											/>
										))}
								</>
							)}
						</>
					) : (
						<span className="academy-custom-select--default-text">
							{__('No items found', 'academy')}
						</span>
					)}
				</>
			)}
		</>
	);
};

export default SelectOptions;
