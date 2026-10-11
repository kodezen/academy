import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
	type: PropTypes.string,
	onClickHandler: PropTypes.func,
};

export default function Device({
	type = 'desktop',
	onClickHandler = () => {},
}) {
	const iconClassList = {
		desktop: 'dashicons dashicons-desktop',
		tablet: 'dashicons dashicons-tablet',
		mobile: 'dashicons dashicons-smartphone',
	};
	return (
		<React.Fragment>
			<button
				type="button"
				className={`preview-${type}`}
				data-device={type}
				onClick={() => onClickHandler(type)}
			>
				<i className={iconClassList[type]}></i>
			</button>
		</React.Fragment>
	);
}

Device.propTypes = propTypes;
