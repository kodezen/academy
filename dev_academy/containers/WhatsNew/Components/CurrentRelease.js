import React from 'react';
import { __ } from '@wordpress/i18n';
import { currentRelease } from '../../../utils/releases';
import ChangeLogList from './ChangeLogList';

const CurrentRelease = () => {
	return (
		<div className="academy-whatsnew__changelogs">
			{currentRelease.map((release, index) => (
				<div key={index} className="academy-whatsnew__changelogs-block">
					{release.free?.items?.length > 0 && (
						<>
							<h3 className="academy-whatsnew__changelogs-title academy-whatsnew__changelogs-free py-1.5 px-3 rounded-full text-center text-base font-normal leading-4 w-fit m-0 bg-[#FFF3D8] mb-4 !text-[#1D1D1D]">
								{__(release.free.type, 'academy')}
							</h3>

							<ChangeLogList items={release.free.items} />
						</>
					)}

					{release.pro?.items?.length > 0 && (
						<>
							<h3 className="academy-whatsnew__changelogs-title academy-whatsnew__changelogs-pro py-1.5 px-3 rounded-full text-center text-base font-normal leading-4 w-fit m-0 bg-[#BCFFFC] mt-6 mb-4 !text-[#1D1D1D]">
								{__(release.pro.type, 'academy')}
							</h3>

							<ChangeLogList items={release.pro.items} />
						</>
					)}
				</div>
			))}
		</div>
	);
};

export default CurrentRelease;
