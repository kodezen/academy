import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import Button from '@Components/Button';
import { plugin_root_url, is_pro } from '@Utils/helper';
import { releaseSummary } from '../../../utils/releases';

const Header = () => {
	const { version } = releaseSummary;

	return (
		<div className="academy-whatsnew__banner w-full rounded-t-xl pb-[60px] flex flex-col justify-center items-center relative">
			<img
				src={plugin_root_url + 'assets/images/whatsnew_banner.svg'}
				className="academy-whatsnew__banner-img w-full"
			/>

			<div className="academy-whatsnew__banner-center absolute flex flex-col items-center top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
				{is_pro ? (
					<div className="academy-whatsnew__top-brand py-3 px-5 justify-between items-center rounded flex bg-academy-surface">
						<div className="academy-whatsnew__top-left flex flex-row items-center gap-3">
							<div className="academy-whatsnew__logo-icon"></div>

							<div className="academy-whatsnew__brand flex flex-col items-start">
								<span className="academy-whatsnew__brand-name text-base font-semibold leading-6 m-0 p-0">
									{__('Academy LMS', 'academy')}
								</span>
								<span className="academy-whatsnew__brand-var text-sm font-medium leading-5 m-0 p-0">
									{version}
								</span>
							</div>
						</div>
					</div>
				) : (
					<div className="academy-whatsnew__top w-[420px] py-3 px-5 justify-between items-center rounded flex bg-academy-surface">
						<div className="academy-whatsnew__top-left flex flex-row items-center gap-3">
							<div className="academy-whatsnew__logo-icon"></div>

							<div className="academy-whatsnew__brand flex flex-col items-start">
								<span className="academy-whatsnew__brand-name text-base font-semibold leading-6 m-0 p-0">
									{__('Academy LMS', 'academy')}
								</span>
								<span className="academy-whatsnew__brand-var text-sm font-medium leading-5 m-0 p-0">
									{version}
								</span>
							</div>
						</div>

						<Button
							label={__('Upgrade Now', 'academy')}
							suffix="upgrade-now"
							size="sm"
							type="link"
							link="https://academylms.net/pricing/"
							target="blank"
							icon={
								<span className="academy-icon academy-icon--refresh-cw" />
							}
							iconPosition="right"
						/>
					</div>
				)}

				<h1 className="academy-whatsnew__banner-title text-center text-[40px] font-semibold leading-[52px] tracking-[-0.8px] mt-8 mb-4">
					{__("What's New in Academy LMS 🥳", 'academy')}
				</h1>

				<div className="academy-whatsnew__banner-description text-center text-base font-normal leading-6" style={{ color: 'var(--academy-secondary-gray-color)' }}>
					<span className="block">
						{sprintf(
							__(`You are using Academy LMS (%s)`, 'academy'),
							version
						)}
					</span>
					<span className="mt-1 block">
						{__(
							'Here are features and improvements made to this version!',
							'academy'
						)}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Header;
