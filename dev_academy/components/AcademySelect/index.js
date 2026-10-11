import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import Preloader from '../Loader/Preloader';

// select child components
import MultiSelectValue from './multiSelect/MultiSelectValue';
import SearchOption from './SearchOption';
import SelectOptions from './SelectOptions';

import './styles.scss';

const propTypes = {
	id: PropTypes.string,
	label: PropTypes.string,
	className: PropTypes.string,
	placeholder: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
		PropTypes.string,
		PropTypes.number,
	]),
	suffix: PropTypes.string,
	isSearchable: PropTypes.bool,
	isDisabled: PropTypes.bool,
	isClearable: PropTypes.bool,
	isGrouped: PropTypes.bool,
	options: PropTypes.array,
	onChangeHandler: PropTypes.func,
	isMulti: PropTypes.bool,
	isLoading: PropTypes.bool,
	onMenuOpen: PropTypes.func,
	onInputChange: PropTypes.func,
	positionTop: PropTypes.string,
};

// Fallback ids for selects whose caller passes none, so the component's own
// `label` still has something to point at.
let nextId = 0;

const AcademySelect = ({
	id = '',
	label = '',
	className = '',
	placeholder = __('Select…', 'academy'),
	value = '',
	suffix = '',
	isSearchable = false,
	isDisabled = false,
	isClearable = false,
	isGrouped = false,
	options = [],
	onChangeHandler = () => {},
	isMulti = false,
	isLoading = false,
	onMenuOpen = () => {},
	onInputChange = () => {},
	positionTop = '100%',
}) => {
	const inputRef = useRef(null);
	const inputValueRef = useRef(null);
	const optionsRef = useRef(null);
	const fallbackId = useRef(null);
	if (!fallbackId.current) {
		nextId += 1;
		fallbackId.current = `academy-select-${nextId}`;
	}
	const triggerId = id || fallbackId.current;

	const [isToggle, setIsToggle] = useState(false);
	const [searchOptions, setSearchOptions] = useState('');
	const [multiSelectValue, setMultiSelectValue] = useState(
		isMulti && value.length ? [...value] : []
	);

	// `value` can still be empty at mount and only resolve to the real
	// selection a tick later — e.g. Formik's `enableReinitialize` swaps in
	// loaded edit-mode data via an effect, one render after this component
	// (and its useState initializer above) already mounted with the empty
	// placeholder. Re-sync whenever the prop actually changes so that later
	// arrival still reaches the screen instead of being stuck on the stale
	// initial snapshot.
	useEffect(() => {
		if (isMulti) {
			setMultiSelectValue(value?.length ? [...value] : []);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMulti, value]);

	// Off-screen until placed, so the portal never flashes at (0, 0) before
	// its first real position is measured.
	const [menuPos, setMenuPos] = useState({
		top: -9999,
		left: -9999,
		minWidth: 0,
		maxWidth: 0,
	});

	// A negative positionTop has always meant "open above" in this component
	// (PostSelect's `position === 'top'`, the table footer's rows-per-page
	// select) — carry that intent forward even though the menu no longer sits
	// relative to its own container.
	const preferUp = String(positionTop).trim().startsWith('-');

	// Fire onMenuOpen when the menu opens so async selects can load their
	// initial list (react-select's onMenuOpen semantics). Typeahead fetching is
	// driven separately by onInputChange.
	useEffect(() => {
		if (isToggle) {
			onMenuOpen(searchOptions);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isToggle]);

	// The type-to-filter `<input>` only exists to be typed into while the
	// menu is open (rendered below, gated on `isToggle`) — closing without
	// picking anything (an outside click, toggling shut) would otherwise
	// leave `searchOptions` non-empty with the input it belonged to already
	// unmounted, hiding the selected value's label for nothing since the
	// label is suppressed whenever `searchOptions` isn't empty.
	useEffect(() => {
		if (!isToggle) {
			setSearchOptions('');
		}
	}, [isToggle]);

	// Focus on the input field when the parent is clicked
	const handleInputFocus = () => {
		inputValueRef?.current?.focus();
	};

	const handleSelectValue = (option) => {
		if (isMulti) {
			const updatedData = [];
			const existingItem = multiSelectValue.find(
				(item) => item.value === option.value
			);
			if (!existingItem) {
				updatedData.push(option);
				setMultiSelectValue([...multiSelectValue, ...updatedData]);
				onChangeHandler([...multiSelectValue, ...updatedData]);
			}
		} else {
			// Picking the option that is already selected is a no-op. The list draws
			// it as non-interactive (check mark, cursor: default, no hover change),
			// and firing onChangeHandler again would push consumers into redundant
			// work for a value that has not changed - the students course filter,
			// for one, refetches and re-renders the whole table. Only a different
			// option switches the selection.
			const currentValue = value?.value ?? value;
			if (currentValue !== option.value) {
				onChangeHandler(option.value);
			}
		}
		setSearchOptions('');
	};

	const handleRemoveMultiSelectValue = (option) => {
		let updatedData = [...multiSelectValue];
		updatedData = updatedData.filter((item) => item.value !== option.value);
		onChangeHandler(updatedData);
		setMultiSelectValue(updatedData);
	};

	const handleRemoveSingleSelectValue = (event) => {
		// Clearing is not a request to open the menu.
		event?.stopPropagation();
		onChangeHandler('');
		setSearchOptions('');
	};

	useEffect(() => {
		const handleClick = (e) => {
			if (
				inputRef?.current &&
				!inputRef?.current?.contains(e.target) &&
				!(optionsRef?.current && optionsRef.current.contains(e.target))
			) {
				setIsToggle(false);
			}
		};

		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	// The menu is portaled to <body> (see the render below) so an ancestor's
	// `overflow: hidden` — e.g. a data table that gets it once its content
	// needs to scroll horizontally — can't clip it. Position it from the
	// toggle's own viewport rect instead of relying on CSS relative to a
	// parent it's no longer inside, and re-place it if the page or an
	// ancestor (the table's own horizontal scroller included) scrolls or
	// resizes while it's open.
	useEffect(() => {
		if (!isToggle) {
			return undefined;
		}

		const place = () => {
			if (!inputRef.current) {
				return;
			}
			const rect = inputRef.current.getBoundingClientRect();
			const optionsHeight = optionsRef.current?.offsetHeight || 0;
			const spaceBelow = window.innerHeight - rect.bottom;
			const spaceAbove = rect.top;
			const openUp = preferUp || (spaceBelow < optionsHeight && spaceAbove > spaceBelow);

			const next = {
				top: openUp ? rect.top - optionsHeight - 3 : rect.bottom + 3,
				left: rect.left,
				// Never narrower than the field, but free to grow for long
				// options: a field that shrank to a short selected value would
				// otherwise clip every longer option in the list. Capped so it
				// stays on screen; past that, option labels wrap.
				minWidth: rect.width,
				maxWidth: Math.max(
					rect.width,
					Math.min(360, window.innerWidth - rect.left - 16)
				),
			};
			// Skip the update (and re-render) when nothing moved — the brief
			// post-open animation-frame loop below calls this ~45 times.
			setMenuPos((prev) =>
				prev.top === next.top &&
				prev.left === next.left &&
				prev.minWidth === next.minWidth &&
				prev.maxWidth === next.maxWidth
					? prev
					: next
			);
		};

		place();
		window.addEventListener('resize', place);
		// Capture phase: scroll events don't bubble, so this is the only way to
		// hear about a nested scroller (the table) scrolling, not just the page.
		window.addEventListener('scroll', place, true);

		// Neither listener fires when the trigger moves because surrounding
		// page content changes size instead of the window — e.g. this table
		// is still on its shorter initial/loading render at the exact instant
		// the menu opens (right after a page load), then grows a moment later
		// once its data arrives, pushing this select further down a layout
		// whose overall document/body size never changes (a fixed-height
		// dashboard shell), so a ResizeObserver on body wouldn't fire either.
		// Re-placing on every animation frame for a short window after open
		// is the one thing that can't miss a layout settling for any reason —
		// it doesn't wait on a specific event, it just keeps checking.
		let rafId;
		let frame = 0;
		const tick = () => {
			place();
			frame += 1;
			if (frame < 45) {
				// ~750ms at 60fps.
				rafId = requestAnimationFrame(tick);
			}
		};
		rafId = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener('resize', place);
			window.removeEventListener('scroll', place, true);
			cancelAnimationFrame(rafId);
		};
	}, [isToggle, searchOptions, options, preferUp]);

	// The selected option's label, for a single select.
	const selectedLabel = (() => {
		if (isMulti) {
			return '';
		}
		// `options` is expected to be an array, but a caller's own async
		// fetch can hand it something else instead (e.g. an error payload
		// shaped like `{message: '...'}`) — `options?.find` throws on
		// anything non-array/non-nullish rather than short-circuiting, and
		// with no error boundary above this shared component that took the
		// whole page down. Guard here too, not just at each call site.
		const safeOptions = Array.isArray(options) ? options : [];
		const current = value?.value ? value.value : value;
		return (
			safeOptions.find((optionItem) => optionItem.value === current)
				?.label || ''
		);
	})();

	const renderLabel = () => {
		if (selectedLabel) {
			return (
				<div className="academy-select-single-label">
					<span
						className="academy-select-single-label--text"
						title={selectedLabel}
					>
						{selectedLabel}
					</span>
				</div>
			);
		}
		// Wrapped instead of returned as a bare text node so the placeholder can be
		// styled apart from a real selection - the same class the multi-value branch
		// already uses for its own placeholder.
		return (
			<span className="academy-select-default-text">{placeholder}</span>
		);
	};

	return (
		<div
			role="presentation"
			className={`academy-control academy-custom-select ${
				suffix ? 'academy-custom-select--' + suffix : ''
			} ${isDisabled ? 'academy-custom-select--disabled' : ''} ${
				className || ''
			}`}
			onClick={handleInputFocus}
		>
			{label && <label htmlFor={triggerId}>{label}</label>}
			<div className="academy-custom-select--container" ref={inputRef}>
				{/* What a `<label htmlFor>` (this one, or a caller's own
				    title) clicks through to, and what Tab lands on: opens the
				    menu. Visually hidden; the box around it shows its focus. */}
				<button
					type="button"
					id={triggerId}
					className="academy-custom-select--trigger"
					disabled={isDisabled}
					aria-haspopup="listbox"
					aria-expanded={isToggle}
					onClick={(event) => {
						event.stopPropagation();
						setIsToggle(true);
					}}
					onKeyDown={(event) => {
						if ('Escape' === event.key) {
							setIsToggle(false);
						}
					}}
				>
					{selectedLabel || placeholder}
				</button>
				{/* input box content  */}
				<div
					role="presentation"
					className="academy-custom-select--inner-content"
					onClick={() => setIsToggle(!isToggle)}
				>
					{/* Input and value content area  */}
					<div className="academy-custom-select--box">
						{isMulti ? (
							<div className="academy-custom-select--multi-value">
								{multiSelectValue?.length > 0 ? (
									multiSelectValue.map((option, index) => (
										<MultiSelectValue
											option={option}
											index={index}
											key={index}
											handleRemoveMultiSelectValue={
												handleRemoveMultiSelectValue
											}
										/>
									))
								) : (
									// The placeholder is absolutely positioned, so it must go
									// once the user types or it prints under the typed text.
									!(isSearchable && searchOptions?.length > 0) && (
										<span className="academy-select-default-text">
											{placeholder}
										</span>
									)
								)}
								{isSearchable && isToggle && (
									<SearchOption
										searchOptions={searchOptions}
										setSearchOptions={setSearchOptions}
										inputValueRef={inputValueRef}
										onInputChange={onInputChange}
									/>
								)}
							</div>
						) : (
							<div className="academy-custom-select--single-value">
								{isSearchable && searchOptions?.length > 0
									? ''
									: renderLabel()}

								{isSearchable && isToggle && (
									<SearchOption
										searchOptions={searchOptions}
										setSearchOptions={setSearchOptions}
										inputValueRef={inputValueRef}
										onInputChange={onInputChange}
									/>
								)}
							</div>
						)}
					</div>
					{/* Right side: clear (×) and arrow, always at the end of the
					    row whatever the value's length. */}
					<div className="academy-custom-select--indicator">
						{isClearable && selectedLabel && (
							<Button
								className="academy-remove-option"
								ariaLabel={__('Clear selection', 'academy')}
								onClick={handleRemoveSingleSelectValue}
								icon={
									<span className="academy-icon academy-icon--close" />
								}
							/>
						)}
						<span className="academy-icon academy-icon--arrow-down"></span>
					</div>
				</div>
				{/* dropdown options — portaled to <body> so a scroll-clipped
				ancestor (e.g. a table with a horizontal scrollbar) can't cut it
				off; see the placement effect above. */}
				{isToggle &&
					createPortal(
						<div
							role="presentation"
							className={`academy-custom-select--options academy-custom-select--options--toggle${
								suffix ? ' academy-custom-select--options--' + suffix : ''
							}`}
							style={{
								position: 'fixed',
								top: menuPos.top,
								left: menuPos.left,
								width: 'max-content',
								minWidth: menuPos.minWidth,
								maxWidth: menuPos.maxWidth,
								// Both portaled to <body> now: this must at least match
								// ui/Modal's z-[100000] overlay, or a select opened
								// inside a modal (e.g. the behaviour/notice forms) would
								// render its menu behind the modal instead of above it.
								zIndex: 100000,
							}}
							onClick={() => {
								setIsToggle(!isToggle);
							}}
							// This menu is portaled straight to <body>, so it can
							// sit outside a parent Dropdown's own portaled content
							// (see ui/Dropdown.js's contentRef.contains() check).
							// Without this, its native mousedown bubbles to that
							// Dropdown's document-level outside-click listener,
							// which then closes the whole popover before the
							// option's onClick ever runs.
							onMouseDown={(e) => e.stopPropagation()}
							ref={optionsRef}
						>
							{isLoading ? (
								<Preloader size="sm" />
							) : (
								<SelectOptions
									isGrouped={isGrouped}
									options={options}
									isMulti={isMulti}
									multiSelectValue={multiSelectValue}
									searchOptions={searchOptions}
									handleSelectValue={handleSelectValue}
									value={value}
									suffix={suffix}
								/>
							)}
						</div>,
						document.body
					)}
			</div>
		</div>
	);
};

AcademySelect.propTypes = propTypes;

export default AcademySelect;
