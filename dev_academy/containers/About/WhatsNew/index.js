import React from 'react';
import { ZoomProvider } from './media';
import JumpNav from './JumpNav';
import Hero from './sections/Hero';
import Admin from './sections/Admin';
import Courses from './sections/Courses';
import Quizzes from './sections/Quizzes';
import Assess from './sections/Assess';
import LearnPage from './sections/LearnPage';
import Player from './sections/Player';
import Customize from './sections/Customize';
import Design from './sections/Design';
import Dashboards from './sections/Dashboards';
import Certificates from './sections/Certificates';
import Family from './sections/Family';
import SiteTools from './sections/SiteTools';
import Integrations from './sections/Integrations';
import Pro from './sections/Pro';
import { HeadsUp, Closing } from './sections/Closing';

import './styles.scss';

/*
 * The What's New tab. Chapters run top to bottom with no tabs, so every
 * feature is visible while scrolling; the sticky JumpNav links to each one.
 * Images: kodezen-assets repo, images/academy/ (see media.js). A Shot with `todo` renders a
 * placeholder naming the file still to capture.
 */
const WhatsNew = ({ version }) => (
	<ZoomProvider>
		<div className="awn">
			<Hero version={version} />
			<JumpNav />
			<Admin />
			<Courses />
			<Quizzes />
			<Assess />
			<LearnPage />
			<Player />
			<Customize />
			<Design />
			<Dashboards />
			<Certificates />
			<Family />
			<SiteTools />
			<Integrations />
			<Pro />
			<HeadsUp />
			<Closing />
		</div>
	</ZoomProvider>
);

export default WhatsNew;
