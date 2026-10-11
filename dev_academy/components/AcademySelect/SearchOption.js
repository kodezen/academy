import React, { useEffect, useState } from 'react';

function SearchOption({
	searchOptions,
	setSearchOptions,
	inputValueRef,
	onInputChange,
}) {
	const [inputWidth, setInputWidth] = useState('4px');

	// This only mounts once the menu is actually open (AcademySelect gates it
	// on `isToggle` now, instead of always rendering it), so that opening
	// click no longer lands on an already-mounted input the way the parent's
	// own click-to-focus handler used to assume — focus it ourselves as soon
	// as it appears.
	useEffect(() => {
		inputValueRef.current?.focus();
	}, []);

	useEffect(() => {
		if (inputValueRef.current && searchOptions !== '') {
			setInputWidth(`${inputValueRef.current.scrollWidth}px`);
		} else if (searchOptions === '') {
			setInputWidth('4px');
		}
	}, [searchOptions]);

	// onInputChange
	useEffect(() => {
		if (searchOptions !== '') {
			onInputChange(searchOptions);
		}
	}, [searchOptions]);

	return (
		<div className="academy-custom-select--input-container">
			<input
				className="academy-custom-select--search-option"
				type="text"
				value={searchOptions}
				ref={inputValueRef}
				onChange={(e) => {
					setSearchOptions(e.target.value);
					onInputChange(e.target.value);
				}}
				style={{ width: inputWidth }}
			/>
		</div>
	);
}

export default SearchOption;
