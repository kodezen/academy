import React, { useState } from 'react';
import DevicePreview from './../components/DevicePreview';
import BoxModel from '../components/BoxModel';
import Unit from '../components/Unit';

const View = (props) => {
	const [currentDevice, setCurrentDevice] = useState('desktop');

	const handleFieldChange = (field, value) => {
		props.onChange({ [field]: value });
	};

	const deviceChangeHandler = (type) => {
		setCurrentDevice(type);
		wp.customize.previewedDevice.set(type);
	};

	return (
		<fieldset>
			<label
				htmlFor={props.label}
				className="academy-customize-control-label customize-control-title"
			>
				<span>{props.label}</span>
				<DevicePreview
					value={currentDevice}
					onChangeHandler={deviceChangeHandler}
				/>
				<Unit
					value={props.unit}
					handleFieldChange={handleFieldChange}
				/>
			</label>
			<div
				className="customize-control-notifications-container"
				ref={props.setNotificationContainer}
			></div>
			<div className="academy-customize-control-field academy-customize-control-field--dimension">
				{currentDevice === 'desktop' && (
					<>
						<BoxModel
							dataField="desktop"
							id={'desktop'}
							value={props.desktop}
							isLinked={props.isLinked}
							onChange={handleFieldChange}
						/>
					</>
				)}
				{currentDevice === 'tablet' && (
					<>
						<BoxModel
							dataField="tablet"
							id={'tablet'}
							value={props.tablet}
							isLinked={props.isLinked}
							onChange={handleFieldChange}
						/>
					</>
				)}
				{currentDevice === 'mobile' && (
					<>
						<BoxModel
							dataField="mobile"
							id={'mobile'}
							value={props.mobile}
							isLinked={props.isLinked}
							onChange={handleFieldChange}
						/>
					</>
				)}
			</div>
		</fieldset>
	);
};

export default View;
