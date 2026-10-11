import React from 'react';
import { sprintf, __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import ReactModal from '@Components/Modal/ReactModal';
import { capitalizeFirstLetter } from '@Utils/helper';

import './styles.scss';

const propTypes = {
	data: PropTypes.object,
};

export default function DetailsModal({ data = {}, title, closeModal }) {
	const { meta, enrolled_courses, ...restData } = data;

	return (
		<>
			<ReactModal
				isOpen={true}
				onRequestClose={closeModal}
				title={title}
				suffix="user-details"
				size="medium"
				isSmallAvailable={false}
			>
				<div className="academy-user-details__info-list">
					{Object.entries(restData).map(([key, id], index) => {
						return (
							<div
								className="academy-user-details__info-list--item"
								key={index}
							>
								<span className="academy-title">
									{sprintf(
										// translators: %s: label
										__('%s', 'academy'),
										capitalizeFirstLetter(
											key.split('_').join(' ')
										)
									)}
								</span>
								<span>-</span>
								<span className="academy-user-details-item__value">
									{id}
								</span>
							</div>
						);
					})}

					{meta && meta?.length && (
						<>
							{meta?.length &&
								meta.map((item, index) => {
									return (
										<div
											className="academy-user-details__info-list--item"
											key={index}
										>
											<span className="academy-title">
												{item.label}
											</span>
											<span>-</span>
											<span className="academy-user-details-item__value">
												{item.value}
											</span>
										</div>
									);
								})}
						</>
					)}
				</div>
			</ReactModal>
		</>
	);
}

DetailsModal.propTypes = propTypes;
