import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import store from './redux/store';
import Setup from './containers/setup';
import './../assets/scss/setup.scss';
import './tailwind.css';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('academysetupscreenwrap');
	if (container) {
		const root = createRoot(container);
		root.render(
			<Provider store={store}>
				<HashRouter basename="/">
					<Setup />
				</HashRouter>
			</Provider>
		);
	}
});
