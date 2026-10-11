import React, { useState, useLayoutEffect } from 'react';
import { __ } from '@wordpress/i18n';
import ChangeLog from '../WhatsNew/Components/ChangeLog';
import WhatsNew from './WhatsNew';
import { aboutRelease } from './highlights';
import { shotUrl } from './WhatsNew/media';
import { AboutClose } from './WhatsNew/JumpNav';

import './styles.scss';

const TABS = [
	{ key: 'whats-new', label: __("What's New", 'academy') },
	{ key: 'changelog', label: __('Changelog', 'academy') },
	{ key: 'get-involved', label: __('Get Involved', 'academy') },
];

const GetInvolved = () => {
	const links = [
		{
			title: __('Read the docs', 'academy'),
			body: __(
				'Guides and references for every Academy feature.',
				'academy'
			),
			cta: __('Browse docs', 'academy'),
			url: 'https://academylms.net/docs/',
		},
		{
			title: __('Explore the ecosystem', 'academy'),
			body: __(
				'Discover the Kodezen family of plugins that pair with Academy.',
				'academy'
			),
			cta: __('Open Discover', 'academy'),
			url: 'admin.php?page=academy-discover',
		},
		{
			title: __('Leave a review', 'academy'),
			body: __(
				'Enjoying Academy? A quick review helps other creators find it.',
				'academy'
			),
			cta: __('Write a review', 'academy'),
			url: 'https://wordpress.org/support/plugin/academy/reviews/#new-post',
		},
	];

	return (
		<div className="academy-about__involved">
			{links.map((l) => (
				<div className="academy-about__involved-card" key={l.title}>
					<h4>{l.title}</h4>
					<p>{l.body}</p>
					<a
						href={l.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{l.cta} →
					</a>
				</div>
			))}
		</div>
	);
};

/*
 * The About page has no TopBar, so it carries its own theme switch. It flips
 * the same attribute and storage key TopBar uses, so the choice follows the
 * admin everywhere.
 */
const useAdminTheme = () => {
	const [theme, setTheme] = useState(() => {
		try {
			return window.localStorage.getItem('academy_backend_theme') === 'dark'
				? 'dark'
				: 'light';
		} catch (e) {
			return 'light';
		}
	});

	useLayoutEffect(() => {
		const root = document.documentElement;
		root.classList.add('academy-theme-switching');
		root.setAttribute('data-academy-user-theme', theme);
		// eslint-disable-next-line no-unused-expressions
		root.offsetHeight;
		const frame = window.requestAnimationFrame(() =>
			root.classList.remove('academy-theme-switching')
		);
		try {
			window.localStorage.setItem('academy_backend_theme', theme);
		} catch (e) {}
		return () => window.cancelAnimationFrame(frame);
	}, [theme]);

	return [theme, () => setTheme(theme === 'dark' ? 'light' : 'dark')];
};

const About = () => {
	const [tab, setTab] = useState('whats-new');
	const [theme, toggleTheme] = useAdminTheme();
	const { version } = aboutRelease;

	return (
		<div className="academy-page-content academy-page-content--about">
			<div className="academy-about">
				<header className="academy-about__bar">
					<img
						className="academy-about__logo"
						src={shotUrl('hero/logo.png')}
						alt={__('Academy LMS', 'academy')}
						width="151"
						height="40"
					/>
					<nav
						className="academy-about__tabs"
						aria-label={__('About sections', 'academy')}
					>
						{TABS.map((t) => (
							<button
								type="button"
								key={t.key}
								aria-current={tab === t.key ? 'page' : undefined}
								className={`academy-about__tab${
									tab === t.key ? ' is-active' : ''
								}`}
								onClick={() => setTab(t.key)}
							>
								{t.key === 'whats-new' ? (
									<img
										src={shotUrl('hero/tab-sparkle.svg')}
										alt=""
										width="16"
										height="16"
									/>
								) : null}
								{t.label}
							</button>
						))}
					</nav>
					<div className="academy-about__actions">
					<button
						type="button"
						className="academy-about__theme"
						onClick={toggleTheme}
						aria-pressed={theme === 'dark'}
					>
						<img
							src={shotUrl('hero/moon.svg')}
							alt=""
							width="16"
							height="16"
						/>
						{theme === 'dark'
							? __('Light mode', 'academy')
							: __('Dark mode', 'academy')}
					</button>
					<AboutClose />
					</div>
				</header>

				{tab === 'whats-new' && (
					<WhatsNew version={version} />
				)}

				{tab === 'changelog' && (
					<div className="academy-about__body">
						<div className="academy-about__panel academy-about__panel--changelog">
							<ChangeLog />
						</div>
					</div>
				)}

				{tab === 'get-involved' && (
					<div className="academy-about__body">
						<div className="academy-about__panel">
							<GetInvolved />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default About;
