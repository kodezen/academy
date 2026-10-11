import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import './styles.scss';

const AcademyAccordion = ({
	index,
	renderTitle = () => {},
	renderContent = () => {},
	activeIndex,
	setActiveIndex,
}) => {
	const handleToggle = (index) => {
		setActiveIndex((prev) => (prev === index ? null : index));
	};

	return (
		<React.Fragment>
			<div key={index} className="academy-accordion__contents">
				<div
					onClick={(e) => {
						e.stopPropagation();
						handleToggle(index);
					}}
					className={`academy-flex academy-accordion__title ${
						activeIndex === index
							? 'academy-accordion__title--open'
							: ''
					}`}
				>
					{renderTitle()}
					{activeIndex === index ? (
						<span className="academy-icon academy-icon--minus-two"></span>
					) : (
						<span className="academy-icon academy-icon--plus"></span>
					)}
				</div>

				<div
					className={`academy-accordion__content ${
						activeIndex === index
							? 'academy-accordion__content--open'
							: ''
					}`}
				>
					{renderContent()}
				</div>
			</div>
		</React.Fragment>
	);
};

export default AcademyAccordion;
