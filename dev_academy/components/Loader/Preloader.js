import PropTypes from 'prop-types';
import React from 'react';
import { Spinner } from '@wordpress/components';
import './preloader.scss';

const propTypes = {
	size: PropTypes.string,
};

export default function Preloader({ size = 'md', className="" }) {
	return (
		<div className={`academy-preloader academy-preloader--${size} ${className}`}>
			<Spinner />
		</div>
	);
}

Preloader.propTypes = propTypes;
