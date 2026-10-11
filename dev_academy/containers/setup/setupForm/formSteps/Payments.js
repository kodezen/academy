import React from 'react';
import PluginInstall from '../Component/PluginInstall';
import FormHeading from '../Component/FormHeading';
import { __ } from '@wordpress/i18n';

const Payments = () => {
	return (
		<React.Fragment>
			<FormHeading
				title={__('Set up payments', 'academy')}
				subtitle={__(
					'Sell courses with StoreEngine, the payment plugin made by the Academy LMS team. Free courses work without it.',
					'academy'
				)}
				icon={
					<span className="academy-icon academy-icon--withdrawal"></span>
				}
			/>
			<PluginInstall pluginName="storeengine" />
		</React.Fragment>
	);
};

export default Payments;
