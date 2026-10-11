import React from 'react';
import { createRoot } from 'react-dom/client';
import { controlBase } from './../utils';
import View from './View';

const NumberDimension = wp.customize.Control.extend({
	...controlBase,
	renderContent: function renderContent() {
		const control = this;
		const value = control.setting.get();
		const root = createRoot(control.container[0]);
		const form = (
			<View
				label={control.params.label}
				{...value}
				setNotificationContainer={control.setNotificationContainer}
				onChange={control.updateSetting}
			/>
		);
		root.render(form);
	},
});

export default NumberDimension;
