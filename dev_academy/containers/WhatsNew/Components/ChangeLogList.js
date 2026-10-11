import React from 'react';
import { __ } from '@wordpress/i18n';

const ChangeLogList = ({ items }) => (
	<div className="academy-whatsnew__changelogs-lists flex flex-col gap-4">
		{items.map((item, index) => (
			<div
				key={index}
				className="academy-whatsnew__changelogs-list flex items-center shrink-0 gap-4 text-xl font-normal leading-[30px] text-academy-secondary-gray-color"
			>
				<span className="academy-icon academy-icon--check" />

				<span>
					{item.startsWith(__('Added:', 'academy')) && (
						<span style={{ color: '#0AAB2D' }}>
							{__('Added:', 'academy')}{' '}
						</span>
					)}
					{item.startsWith(__('Fixed:', 'academy')) && (
						<span style={{ color: '#0AAB2D' }}>
							{__('Fixed:', 'academy')}{' '}
						</span>
					)}
					{item.startsWith(__('Improved:', 'academy')) && (
						<span style={{ color: '#0AAB2D' }}>
							{__('Improved:', 'academy')}{' '}
						</span>
					)}

					{item.replace(/^Added: |^Fixed: |^Improved: /, '')}
				</span>
			</div>
		))}
	</div>
);

export default ChangeLogList;
