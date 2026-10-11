import React from 'react';
import { __ } from '@wordpress/i18n';
import { oldReleases } from '../../../utils/releases';
import ChangeLogList from './ChangeLogList';

const OldRelease = () => {
	return (
		<>
			<div className="academy-whatsnew__changelogs">
				{oldReleases.map((release, index) => (
					<div
						key={index}
						className="academy-whatsnew__changelogs-block"
					>
						<h2 className="academy-whatsnew__changelogs-version bg-[#F2F0FD] w-fit py-1.5 px-3 rounded-full text-base font-normal leading-5 text-[#454F59] mt-6 mb-4">
							{__('Version', 'academy')} {release.version}
						</h2>

						{release.free && (
							<>
								<h3 className="academy-whatsnew__changelogs-title academy-whatsnew__changelogs-free py-1.5 px-3 rounded-full text-center text-base font-normal leading-4 w-fit m-0 bg-[#FFF3D8] mb-4 !text-[#1D1D1D]">
									{__(release.free.type, 'academy')}
								</h3>

								<ChangeLogList items={release.free.items} />
							</>
						)}

						{release.pro && (
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

			<div className="academy-whatsnew__btn-changelog flex justify-center items-center mt-10">
				<a
					href="https://academylms.net/whats-new/"
					target="_blank"
					className="academy-whatsnew__changelog-btn bg-academy-surface rounded-full no-underline p-1 shadow-[0_12px_72px_-8px_rgba(16,24,40,0.25)] leading-none border border-academy-border w-fit"
					rel="noreferrer"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="M18.7071 9.70698C19.0976 9.31646 19.0976 8.68345 18.7071 8.29292C18.3166 7.9024 17.6836 7.9024 17.293 8.29292L12.0001 13.5859L6.70711 8.29292C6.31658 7.9024 5.68357 7.9024 5.29304 8.29292C4.90252 8.68345 4.90252 9.31646 5.29304 9.70698L11.293 15.707C11.6836 16.0975 12.3166 16.0975 12.7071 15.707L18.7071 9.70698Z"
							fill="#141A24"
						/>
					</svg>
				</a>
			</div>
		</>
	);
};

export default OldRelease;
