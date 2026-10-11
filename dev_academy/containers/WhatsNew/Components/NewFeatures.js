import React from 'react';
import { __ } from '@wordpress/i18n';
import { newFeature } from '../../../utils/releases';

const NewFeatures = () => {
	return (
		<div className="academy-whatsnew__changelogs">
			{newFeature.map((release, index) => {
				return (
					<div
						key={index}
						className="academy-whatsnew__changelogs-block"
					>
						{release.free?.items?.length > 0 && (
							<div className="academy-whatsnew__changelogs-lists academy-mb-4 flex flex-col gap-4">
								{release.free?.items.map((item, index) => (
									<div
										key={index}
										className="academy-whatsnew__changelogs-list flex items-center shrink-0 gap-4 text-xl font-normal leading-[30px] text-[#454F59]"
									>
										<span className="academy-icon academy-icon--check" />

										<p className="text-xl font-normal leading-[30px] text-[#454F59] m-0">
											{item}{' '}
											<span className="academy-whatsnew__changelogs-title academy-whatsnew__changelogs-free py-1.5 px-3 rounded-full text-center text-base font-normal leading-4 w-fit m-0 bg-[#FFF3D8] mb-4 !text-[#1D1D1D]">
												{__(
													release.free?.type,
													'academy'
												)}
											</span>
										</p>
									</div>
								))}
							</div>
						)}

						{release.pro?.items?.length > 0 && (
							<div className="academy-whatsnew__changelogs-lists flex flex-col gap-4">
								{release.pro?.items.map((item, index) => (
									<div
										key={index}
										className="academy-whatsnew__changelogs-list flex items-center shrink-0 gap-4 text-xl font-normal leading-[30px] text-[#454F59]"
									>
										<span className="academy-icon academy-icon--check" />

										<p className="text-xl font-normal leading-[30px] text-[#454F59] m-0">
											{item}{' '}
											<span className="academy-whatsnew__changelogs-title academy-whatsnew__changelogs-pro py-1.5 px-3 rounded-full text-center text-base font-normal leading-4 w-fit m-0 bg-[#BCFFFC] mt-6 mb-4 !text-[#1D1D1D]">
												{__(
													release.pro?.type,
													'academy'
												)}
											</span>
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default NewFeatures;
