/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions  */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

export default function BoxModel({ dataField, id, value, onChange, isLinked }) {
	const [boxModelData, setBoxModelData] = useState(value);

	useEffect(() => {
		onChange(dataField, boxModelData);
	}, [boxModelData]);

	const onChangeHandler = (index, e) => {
		const tempData = [...boxModelData];
		if (isLinked) {
			tempData[0] = e.target.value;
			tempData[1] = e.target.value;
			tempData[2] = e.target.value;
			tempData[3] = e.target.value;
		} else {
			tempData[index] = e.target.value;
		}
		setBoxModelData(tempData);
	};
	return (
		<React.Fragment>
			<div style={{ display: 'flex' }}>
				<div>
					<label htmlFor={'top' + id}>
						<input
							type="number"
							data-field={dataField}
							id={'top' + id}
							value={boxModelData[0]}
							onChange={(e) => onChangeHandler(0, e)}
						/>
						{__('Top', 'academy')}
					</label>
				</div>
				<div>
					<label htmlFor={'right' + id}>
						<input
							type="number"
							data-field={dataField}
							id={'right' + id}
							value={boxModelData[1]}
							onChange={(e) => onChangeHandler(1, e)}
						/>
						{__('right', 'academy')}
					</label>
				</div>
				<div>
					<label htmlFor={'bottom' + id}>
						<input
							type="number"
							data-field={dataField}
							id={'bottom' + id}
							value={boxModelData[2]}
							onChange={(e) => onChangeHandler(2, e)}
						/>
						{__('bottom', 'academy')}
					</label>
				</div>
				<div>
					<label htmlFor={'left' + id}>
						<input
							type="number"
							data-field={dataField}
							id={'left' + id}
							value={boxModelData[3]}
							onChange={(e) => onChangeHandler(3, e)}
						/>
						{__('left', 'academy')}
					</label>
				</div>
				<div>
					<label
						htmlFor={'linked-' + id}
						className={`btn-linked ${
							isLinked ? 'btn-linked--active' : ''
						}`}
						onClick={() => onChange('isLinked', !isLinked)}
					>
						<span
							id={'linked-' + id}
							className="dashicons dashicons-admin-links"
						></span>
					</label>
				</div>
			</div>
		</React.Fragment>
	);
}
