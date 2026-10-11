import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { admin_url } from '@Utils/helper';

export const CHAPTERS = [
	{ id: 'awn-admin', label: __('Admin', 'academy') },
	{ id: 'awn-courses', label: __('Courses', 'academy') },
	{ id: 'awn-quizzes', label: __('Quizzes', 'academy') },
	{ id: 'awn-learn', label: __('Learn page', 'academy') },
	{ id: 'awn-customize', label: __('Customize', 'academy') },
	{ id: 'awn-blocks', label: __('Blocks', 'academy') },
	{ id: 'awn-dashboards', label: __('Dashboards', 'academy') },
	{ id: 'awn-certificates', label: __('Certificates', 'academy') },
	{ id: 'awn-family', label: __('Family', 'academy') },
	{ id: 'awn-site', label: __('Site tools', 'academy') },
	{ id: 'awn-integrations', label: __('Integrations', 'academy') },
	{ id: 'awn-pro', label: __('Pro', 'academy') },
];

/* Leaves the About page for the Academy dashboard. */
export const AboutClose = ({ className = '' }) => (
	<a
		className={`academy-about__close ${className}`.trim()}
		href={`${admin_url}admin.php?page=academy`}
		aria-label={__('Close and go to the dashboard', 'academy')}
		title={__('Close and go to the dashboard', 'academy')}
	>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
			<path d="M18 6 6 18M6 6l12 12" />
		</svg>
	</a>
);

/* Sticky chapter links that highlight the chapter currently on screen. */
const JumpNav = () => {
	const [active, setActive] = useState(CHAPTERS[0].id);

	useEffect(() => {
		if (!('IntersectionObserver' in window)) {
			return undefined;
		}
		const io = new window.IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						setActive(e.target.id);
					}
				});
			},
			{ rootMargin: '-35% 0px -60% 0px' }
		);
		CHAPTERS.forEach((c) => {
			const el = document.getElementById(c.id);
			if (el) {
				io.observe(el);
			}
		});
		return () => io.disconnect();
	}, []);

	return (
		<nav className="awn-jump" aria-label={__('Jump to a chapter', 'academy')}>
			{CHAPTERS.map((c) => (
				<a
					key={c.id}
					href={`#${c.id}`}
					className={active === c.id ? 'is-active' : ''}
					aria-current={active === c.id ? 'true' : undefined}
					onClick={(e) => {
						e.preventDefault();
						document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						setActive(c.id);
					}}
				>
					{c.label}
				</a>
			))}
			<span className="awn-jump__divider" aria-hidden="true" />
			<AboutClose className="awn-jump__close" />
		</nav>
	);
};

export default JumpNav;
