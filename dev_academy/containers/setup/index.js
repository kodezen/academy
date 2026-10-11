import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import SetupContext from './context/SetupContext';
import Instructor from './pages/Instructor';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';
// eslint-disable-next-line prettier/prettier
import { getAddonActiveStatus} from '@Utils/helper';
import { __ } from '@wordpress/i18n';

import './styles.scss';

const propTypes = {};

export default function Setup() {
	const allAddons = useSelector((state) => state.addons);
	const [addonsStatus, setAddonStatus] = useState({
		multi_instructor: getAddonActiveStatus(allAddons, 'multi_instructor'),
	});
	const saveAddonsStatusHandler = (addon = null, status = null) => {
		if (!addon && !status) {
			return;
		}
		addonsStatus[addon] = status;
		setAddonStatus({ ...addonsStatus });
	};
	return (
		<div className="academy-setup-screen">
			<SetupContext.Provider
				value={{ addonsStatus, saveAddonsStatusHandler }}
			>
				<Routes>
					<Route exact path="/" element={<Welcome />} />
					<Route path="/instructor" element={<Instructor />} />
					<Route path="/settings" element={<Settings />} />
				</Routes>
			</SetupContext.Provider>
		</div>
	);
}

Setup.propTypes = propTypes;
