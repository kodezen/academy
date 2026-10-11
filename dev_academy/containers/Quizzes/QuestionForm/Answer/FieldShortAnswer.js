import React from 'react';
import { __ } from '@wordpress/i18n';

const FieldShortAnswer = () => {
	return (
		<div>
			<p>
				{__(
					'This answer type will automatically add text field for answer.',
					'academy'
				)}
			</p>
		</div>
	);
};

export default FieldShortAnswer;
