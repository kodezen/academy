import React from 'react';
import { Field } from 'formik';
import { __ } from '@wordpress/i18n';

const propTypes = {};

export default function Format({ name }) {
	return (
		<React.Fragment>
			<div className="academy-sortable-format">
				<label htmlFor="onlytext">
					<Field
						id="onlytext"
						type="radio"
						name={name}
						value="text"
					/>{' '}
					{__('Only Text', 'academy')}
				</label>
				<label htmlFor="onlyimage">
					<Field
						id="onlyimage"
						type="radio"
						name={name}
						value="image"
					/>{' '}
					{__('Only Image', 'academy')}
				</label>
				<label htmlFor="onlytextimage">
					<Field
						id="onlytextimage"
						type="radio"
						name={name}
						value="textAndImage"
					/>{' '}
					{__('Text & Image Both', 'academy')}
				</label>
			</div>
		</React.Fragment>
	);
}

Format.propTypes = propTypes;
