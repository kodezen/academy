import React from 'react';
import { __ } from '@wordpress/i18n';

const propTypes = {};

const stepsList = [
	__('Quiz Info', 'academy'),
	__('Questions', 'academy'),
	__('Settings', 'academy'),
];

export default function Step({ currentStepIndex }) {
	return (
		<React.Fragment>
			<ul className="academy-quiz-form__steps academy-steps-section academy-steps-section--size-small">
				{stepsList.map((step, index) => (
					<li
						className={`step-item ${
							currentStepIndex >= index &&
							'step-item--is-completed'
						}`}
						key={index}
					>
						<div className="academy-step-details">
							<span
								className={`academy-step-details__step-index ${
									currentStepIndex === index
										? 'academy-step-details__step-index--active'
										: ''
								}`}
							>
								<span className="academy-step-details__step-index__number">
									{index + 1}
								</span>{' '}
								<span className="academy-icon academy-icon--filled-checkmark"></span>
							</span>
							<span className="academy-step-details__step-name">
								{step}
							</span>
						</div>
					</li>
				))}
			</ul>
		</React.Fragment>
	);
}

Step.propTypes = propTypes;
