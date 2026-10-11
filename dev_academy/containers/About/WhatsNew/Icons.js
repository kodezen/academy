import React from 'react';

/*
 * Stroke icons for the About page, drawn on a 24px grid. Kept local because
 * the admin app ships no icon library and these only live here.
 */
const PATHS = {
	sparkle: (
		<>
			<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
			<path d="M19 3v4M21 5h-4" />
		</>
	),
	arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
	check: <path d="M5 12.5l4.2 4.2L19 7" />,
	checkCircle: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M8.2 12.3l2.6 2.6 5-5.2" />
		</>
	),
	sun: (
		<>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
		</>
	),
	moon: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
	search: (
		<>
			<circle cx="11" cy="11" r="6.5" />
			<path d="M20 20l-4.2-4.2" />
		</>
	),
	compass: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M15.5 8.5l-2 5-5 2 2-5z" />
		</>
	),
	wand: (
		<>
			<path d="M4 20L15 9M13 7l4 4" />
			<path d="M18 3v3M16.5 4.5h3M7 4v2M6 5h2M20 13v2M19 14h2" />
		</>
	),
	layers: (
		<>
			<path d="M12 3l9 5-9 5-9-5z" />
			<path d="M3 13l9 5 9-5" />
		</>
	),
	book: (
		<>
			<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z" />
			<path d="M4 20.5A2.5 2.5 0 006.5 23H20v-5" />
		</>
	),
	help: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M9.5 9.2a2.6 2.6 0 015 .8c0 1.8-2.5 2.2-2.5 3.8M12 17h.01" />
		</>
	),
	award: (
		<>
			<circle cx="12" cy="9" r="5.5" />
			<path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5" />
		</>
	),
	list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
	mic: (
		<>
			<rect x="9" y="3" width="6" height="11" rx="3" />
			<path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
		</>
	),
	lock: (
		<>
			<rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
			<path d="M8 10.5V7.5a4 4 0 018 0v3" />
		</>
	),
	resume: (
		<>
			<path d="M20 12a8 8 0 11-2.3-5.6" />
			<path d="M20 4v4.5h-4.5" />
			<path d="M10.5 9.5v5l4-2.5z" />
		</>
	),
	bot: (
		<>
			<rect x="4" y="8" width="16" height="12" rx="3" />
			<path d="M12 4v4M9 13h.01M15 13h.01M9.5 17h5" />
		</>
	),
	chevronDown: <path d="M6 9l6 6 6-6" />,
	play: <path d="M8 5.5v13l10.5-6.5z" />,
	users: (
		<>
			<circle cx="9" cy="8" r="3.5" />
			<path d="M2.5 20a6.5 6.5 0 0113 0M16 4.8a3.5 3.5 0 010 6.4M18 14.2a6.5 6.5 0 013.5 5.8" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</>
	),
	type: <path d="M5 7V5h14v2M12 5v14M9 19h6" />,
	image: (
		<>
			<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
			<circle cx="9" cy="10" r="1.8" />
			<path d="M20.5 16l-5-5-9 8.5" />
		</>
	),
	qr: (
		<>
			<rect x="4" y="4" width="6" height="6" rx="1" />
			<rect x="14" y="4" width="6" height="6" rx="1" />
			<rect x="4" y="14" width="6" height="6" rx="1" />
			<path d="M14 14h2v2M20 14v6h-4M17 18h.01" />
		</>
	),
	filter: <path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" />,
	grid: (
		<>
			<rect x="4" y="4" width="7" height="7" rx="1.5" />
			<rect x="13" y="4" width="7" height="7" rx="1.5" />
			<rect x="4" y="13" width="7" height="7" rx="1.5" />
			<rect x="13" y="13" width="7" height="7" rx="1.5" />
		</>
	),
	cap: (
		<>
			<path d="M2.5 9L12 4.5 21.5 9 12 13.5z" />
			<path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11" />
		</>
	),
	video: (
		<>
			<rect x="3" y="5.5" width="13" height="13" rx="2.5" />
			<path d="M16 10l5-3v10l-5-3" />
		</>
	),
	note: (
		<>
			<path d="M5 3.5h10l4 4v13H5z" />
			<path d="M14.5 3.5v4.5H19M8.5 12.5h7M8.5 16h5" />
		</>
	),
	camera: (
		<>
			<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" />
			<circle cx="12" cy="13.5" r="3.5" />
		</>
	),
	bell: (
		<>
			<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" />
			<path d="M10 20.5a2 2 0 004 0" />
		</>
	),
	download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
	shield: (
		<>
			<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
			<path d="M9 12l2.2 2.2L15.5 10" />
		</>
	),
	key: (
		<>
			<circle cx="8" cy="15" r="4" />
			<path d="M11 12l9-9M16 7l3 3M14 9l2 2" />
		</>
	),
	calendar: (
		<>
			<rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
			<path d="M3.5 10h17M8 3v4M16 3v4" />
		</>
	),
	puzzle: (
		<path d="M10 4a2 2 0 014 0v2h4v4h-2a2 2 0 000 4h2v5h-5v-2a2 2 0 00-4 0v2H4v-5h2a2 2 0 000-4H4V6h6z" />
	),
	webhook: (
		<>
			<path d="M9 8.5a3.5 3.5 0 116 2.5l2.5 4.5" />
			<path d="M6 12.5a3.5 3.5 0 105 4.5h5" />
			<path d="M15.5 15.5a3.5 3.5 0 11-1.5 4.5" />
		</>
	),
	mail: (
		<>
			<rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
			<path d="M4 7l8 6 8-6" />
		</>
	),
	palette: (
		<>
			<path d="M12 3.5a8.5 8.5 0 100 17c1.2 0 1.8-.8 1.8-1.8 0-1.3-1-1.6-1-2.7 0-1 .8-1.7 1.8-1.7H17a3.5 3.5 0 003.5-3.5c0-4.1-3.8-7.3-8.5-7.3z" />
			<circle cx="7.8" cy="11" r="1" />
			<circle cx="10.5" cy="7.5" r="1" />
			<circle cx="15" cy="8" r="1" />
		</>
	),
	layout: (
		<>
			<rect x="3.5" y="4" width="17" height="16" rx="2.5" />
			<path d="M3.5 9h17M9.5 9v11" />
		</>
	),
	phone: (
		<>
			<rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
			<path d="M11 18.5h2" />
		</>
	),
	star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />,
	zoom: (
		<>
			<circle cx="11" cy="11" r="6.5" />
			<path d="M20 20l-4.2-4.2M11 8v6M8 11h6" />
		</>
	),
	close: <path d="M6 6l12 12M18 6L6 18" />,
	volume: (
		<>
			<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
			<path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
		</>
	),
	eye: (
		<>
			<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
			<circle cx="12" cy="12" r="3" />
		</>
	),
	zap: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
	school: (
		<>
			<path d="M3 20.5h18M5 20.5V10l7-4.5 7 4.5v10.5" />
			<path d="M10 20.5v-5h4v5M12 5.5V2.5h3" />
		</>
	),
	message: (
		<path d="M4.5 5.5h15a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H10l-4.5 3.5V17.5h-1A1.5 1.5 0 013 16V7a1.5 1.5 0 011.5-1.5z" />
	),
	sliders: <path d="M5 4v6M5 14v6M12 4v10M12 18v2M19 4v2M19 10v10M3 12h4M10 16h4M17 8h4" />,
	blocks: (
		<>
			<rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
			<rect x="13.5" y="3.5" width="7" height="7" rx="3.5" />
			<rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
			<path d="M17 13.5v7M13.5 17h7" />
		</>
	),
	form: (
		<>
			<rect x="4" y="3.5" width="16" height="17" rx="2.5" />
			<path d="M8 8h8M8 12h8M8 16h4" />
		</>
	),
	gift: (
		<>
			<rect x="3.5" y="8" width="17" height="4.5" rx="1" />
			<path d="M5 12.5V20h14v-7.5M12 8v12M12 8c-1.5-3.5-5.5-3.5-5.5-1S10 8 12 8zm0 0c1.5-3.5 5.5-3.5 5.5-1S14 8 12 8z" />
		</>
	),
};

const Icon = ({ name, size = 20, className = '', strokeWidth = 1.8 }) => (
	<svg
		className={className}
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		{PATHS[name]}
	</svg>
);

export default Icon;
