import React from 'react';
import { __ } from '@wordpress/i18n';

const propTypes = {};

export default function LazyLoader() {
	return (
		<React.Fragment>
			<p>{__('Loading…', 'academy')}</p>
		</React.Fragment>
	);
}

LazyLoader.propTypes = propTypes;
