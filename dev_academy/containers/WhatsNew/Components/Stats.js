import React from 'react';
import { __ } from '@wordpress/i18n';
import { releaseSummary } from '../../../utils/releases';

const Stats = () => {
	const { addons, bugFixes, newFeatures } = releaseSummary;
	const stats = [
		{ id: 'addons', ...addons },
		{ id: 'bugFixes', ...bugFixes },
		{ id: 'newFeatures', ...newFeatures },
	];

	return (
		<div className="academy-whatsnew__stats flex flex-row flex-wrap justify-between gap-5 py-10">
			{stats.map((item, index) => (
				<React.Fragment key={item.id}>
					<div className="academy-whatsnew__stats-card flex items-center gap-4">
						<div className="academy-whatsnew__stats-card-icon bg-[#F9F8FF] rounded w-[74px] h-[74px] flex items-center justify-center">
							{item?.icon}
						</div>
						<div className="academy-whatsnew__stats-card-content flex flex-col">
							<span className="academy-whatsnew__stats-card-count text-[32px] font-bold leading-[42px]">
								{item?.count}
							</span>
							<span className="academy-whatsnew__stats-card-title text-base font-normal leading-6">
								{item?.label}
							</span>
						</div>
					</div>
					{index !== stats.length - 1 && (
						<div className="academy-whatsnew__divider w-px h-[70px] bg-[#E0E0E0]" />
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default Stats;
