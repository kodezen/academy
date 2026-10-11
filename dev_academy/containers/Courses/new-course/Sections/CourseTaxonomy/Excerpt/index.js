import { Field } from 'formik';
import React from 'react';
import { __ } from '@wordpress/i18n';

const propTypes = {};

export default function Excerpt() {
	return (
		<React.Fragment>
			<div className="academy-widget academy-widget--excerpt">
				<h2 className="academy-title">{__('Excerpt', 'academy')}</h2>
				<div className="academy-widget__body">
					<Field
						type="text"
						name="excerpt"
						as="textarea"
						className="academy-input"
						placeholder=""
					/>
				</div>
				<span className="academy-ecm--subtitle">
					{__('This allows a maximum of 100 characters. ', 'academy')}
					<a
						href="https://academylms.net/docs/how-to-work-the-academy-lms-course-excerpt/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('docs', 'academy')}
					</a>
				</span>
			</div>
		</React.Fragment>
	);
}

Excerpt.propTypes = propTypes;
