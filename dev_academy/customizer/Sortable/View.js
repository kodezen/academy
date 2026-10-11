import React from 'react';
import { arrayMoveImmutable } from 'array-move';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(
	({ itemKey, value, handleFieldChange }) => {
		const onClickHandler = (e) => {
			e.preventDefault();
			handleFieldChange(itemKey, !value);
		};
		return (
			<li
				className={`academy-customize-sortable-list__item ${
					value ? 'visible' : 'invisible'
				}`}
			>
				<label
					htmlFor={itemKey}
					className="academy-customize-sortable-list__item-label"
				>
					{itemKey}
				</label>
				<button
					id={itemKey}
					className="academy-customize-sortable-list__item-control"
					onClick={onClickHandler}
				>
					{value ? (
						<span className="dashicons dashicons-visibility"></span>
					) : (
						<span className="dashicons dashicons-hidden"></span>
					)}
				</button>
			</li>
		);
	}
);

const SortableList = SortableContainer(({ items, handleFieldChange }) => {
	return (
		<ul className="academy-customize-sortable-list">
			{items.map(([itemKey, itemValue], index) => {
				return (
					<SortableItem
						key={`item-${itemKey}`}
						index={index}
						itemKey={itemKey}
						value={itemValue}
						handleFieldChange={handleFieldChange}
					/>
				);
			})}
		</ul>
	);
});

class SortableComponent extends React.Component {
	state = {
		items: Object.entries(this.props.data),
	};
	onUpdateItem = (key, value) => {
		const UpdateValue = {
			...Object.fromEntries(this.state.items),
			[key]: value,
		};
		this.setState(() => ({
			items: Object.entries(UpdateValue),
		}));
		this.props.handleFieldChange(UpdateValue);
	};
	onSortEnd = ({ oldIndex, newIndex }) => {
		if (oldIndex === newIndex) {
			return;
		}
		const newPosition = arrayMoveImmutable(
			this.state.items,
			oldIndex,
			newIndex
		);
		this.setState(() => ({
			items: newPosition,
		}));
		this.props.HandleSortingChange(newPosition);
	};
	render() {
		return (
			<SortableList
				items={this.state.items}
				labels={this.props.labels}
				onSortEnd={this.onSortEnd}
				handleFieldChange={this.onUpdateItem}
			/>
		);
	}
}

const View = (props) => {
	const handleFieldChange = (UpdateValue) => {
		props.onChange({ items: UpdateValue, updateFlug: Math.random() });
	};
	const HandleSortingChange = (data) => {
		const UpdateValue = Object.fromEntries(data);
		props.onChange({ items: UpdateValue, updateFlug: Math.random() });
	};
	return (
		<fieldset>
			<label
				htmlFor={props.label}
				className="academy-customize-control-label customize-control-title"
			>
				<span>{props.label}</span>
			</label>
			<div
				className="customize-control-notifications-container"
				ref={props.setNotificationContainer}
			></div>
			<div className="academy-customize-control-field academy-customize-control-field--sortable">
				<SortableComponent
					data={props.value.items}
					HandleSortingChange={HandleSortingChange}
					handleFieldChange={handleFieldChange}
				/>
			</div>
		</fieldset>
	);
};

export default View;
