import React from 'react';
import { plugin_root_url } from '@Utils/helper';
import { __ } from '@wordpress/i18n';

const UpgradeToPro = () => {
	return (
		<div className="academy-whatsnew__upgradepro flex flex-col gap-[38px] py-[60px] mt-[60px] items-center bg-[#FAFBFF] w-full">
			<div className="academy-whatsnew__upgradepro-title text-2xl font-medium leading-8 text-center">
				<span>
					{__('Upgrade to Academy LMS Pro and Maximize', 'academy')}
				</span>
				<br />
				<span>{__('Your Revenue Potential!', 'academy')}</span>
			</div>
			<div className="academy-whatsnew__upgradepro-image w-full max-w-[880px] h-auto flex justify-center items-center">
				<img
					src={plugin_root_url + 'assets/images/ALMS\ 3.0.png'}
					alt="icon"
					className="w-full h-auto object-contain block"
				/>
			</div>
		</div>
	);
};

export default UpgradeToPro;
