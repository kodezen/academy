import React from 'react';
import Header from './Components/Header';
import Stats from './Components/Stats';
import ChangeLog from './Components/ChangeLog';
import UpgradeToPro from './Components/UpgradeToPro';
import Reviews from './Components/Reviews';
import Footer from './Components/Footer';
import { is_pro } from '@Utils/helper';

import './styles.scss';

const WhatsNew = () => {
	return (
		<div className="academy-page-content">
			<div className="academy-whatsnew flex flex-col bg-academy-surface justify-center items-center !mt-10 box-border border border-academy-border rounded-xl">
				<Header />
				<div className="academy-whatsnew__inner w-[85%] lg:w-3/4 mx-auto">
					<Stats />
					<ChangeLog />
				</div>
				{!is_pro && <UpgradeToPro />}
				<div className="academy-whatsnew__inner w-[85%] lg:w-3/4 mx-auto">
					{!is_pro && <Reviews />}
					{!is_pro && <Footer />}
				</div>
			</div>
		</div>
	);
};

export default WhatsNew;
