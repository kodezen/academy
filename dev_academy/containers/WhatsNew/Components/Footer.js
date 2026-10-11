import React from 'react';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import { plugin_root_url } from '@Utils/helper';

const Footer = () => {
	return (
		<div className="academy-whatsnew__footer py-[60px] relative">
			<img
				src={plugin_root_url + '/assets/images/whatsnew_foo.svg'}
				className="academy-whatsnew__foo-img w-full"
			/>

			<div className="academy-whatsnew__foo-center absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
				<div className="academy-whatsnew__footer-content flex flex-col items-center w-[calc(100%-80px)] p-10 rounded-xl gap-5">
					<div className="academy-whatsnew__footer-title text-2xl font-semibold leading-9 text-white text-center">
						<span>
							{__(
								'Unlock powerful addons, integrations, and ',
								'academy'
							)}
						</span>
						<br />
						<span>{__('exciting new features.', 'academy')}</span>
					</div>

					<Button
						label={__('Compare Free vs Pro', 'academy')}
						preset="transparent"
						suffix="compare"
						type="link"
						link="https://academylms.net/pricing/"
						target="blank"
						icon={
							<span className="academy-icon academy-icon--rocket1" />
						}
						iconPosition="right"
					/>
				</div>
			</div>
		</div>
	);
};

export default Footer;
