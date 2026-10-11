import React from 'react';
import Device from './../Device';
import PropTypes from 'prop-types';

const propTypes = {
	value: PropTypes.string,
	onChangeHandler: PropTypes.func,
};

export default function DevicePreview({ value, onChangeHandler }) {
	return (
		<React.Fragment>
			<div className="academy-responsive-device">
				<Device type={value} />
				<ul className="academy-responsive-btn-group">
					<li
						className={`desktop${
							value === 'desktop' ? ' active' : ''
						}`}
					>
						<Device
							type="desktop"
							onClickHandler={onChangeHandler}
						/>
					</li>
					<li
						className={`tablet${
							value === 'tablet' ? ' active' : ''
						}`}
					>
						<Device
							type="tablet"
							onClickHandler={onChangeHandler}
						/>
					</li>
					<li
						className={`mobile${
							value === 'mobile' ? ' active' : ''
						}`}
					>
						<Device
							type="mobile"
							onClickHandler={onChangeHandler}
						/>
					</li>
				</ul>
			</div>
		</React.Fragment>
	);
}

DevicePreview.propTypes = propTypes;
