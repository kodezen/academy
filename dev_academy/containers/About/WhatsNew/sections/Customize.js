import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row, Tabs, TabPanels } from '../parts';
import { CompareShots, Shot, Carousel } from '../media';

// Mirrors includes/design/presets.php.
const PRESETS = [
	{ name: __('Classic', 'academy'), body: __('Everything a course has to show: image, categories, instructor, rating and price.', 'academy') },
	{ name: __('Minimal', 'academy'), body: __('Just the essentials, in a wider grid. Good for a short catalog.', 'academy') },
	{ name: __('Modern', 'academy'), body: __('Roomy cards with a summary and a big title. Rounded corners throughout.', 'academy') },
	{ name: __('Marketplace', 'academy'), body: __('For many instructors: badges, ratings, wishlist and a tight grid.', 'academy') },
	{ name: __('Sales page', 'academy'), body: __('Course pages read like a sales page: what they will learn comes first.', 'academy') },
	{ name: __('Internal training', 'academy'), body: __('No prices and no marketing: a plain library for staff or members.', 'academy') },
];

const SLIDES = [
	{
		file: 'customize-preview-v2.webp',
		url: 'Academy LMS › Customize',
		alt: __('Customize with the Course Catalog settings and a live preview of the catalog', 'academy'),
		caption: {
			title: __('Live preview.', 'academy'),
			body: __('Your real site beside the settings, on desktop, tablet or mobile. Save only when you are happy; a guided tour shows where everything is.', 'academy'),
		},
	},
	{
		file: 'customize-presets.webp',
		url: 'Customize › Course Catalog › Presets',
		alt: __('Six preset cards: Classic, Minimal, Modern, Marketplace, Sales page and Internal training', 'academy'),
		caption: {
			title: __('Presets.', 'academy'),
			body: __('Six starting points set the catalog cards and the course page sections in one click. Apply one to the catalog only, the page only, or both.', 'academy'),
		},
	},
	{
		file: 'customize-learn-preview.webp',
		url: 'Customize › Learn Page',
		alt: __('Learn Page settings with a live preview of a lesson', 'academy'),
		caption: {
			title: __('Edit with blocks.', 'academy'),
			body: __('For anything the settings do not cover, open the card, the page or the learn page in the block editor. Reset brings the settings back.', 'academy'),
		},
	},
];

const PANELS = [
	{
		key: 'style',
		icon: 'palette',
		label: __('Colors & Style', 'academy'),
		kicker: __('Colors & Style', 'academy'),
		title: __('Brand colors for light and dark', 'academy'),
		body: __('Pick a color set, then adjust. The same colors run through course pages, the learn page and the dashboard, with a separate palette for dark mode.', 'academy'),
		bullets: [
			__('Primary: buttons, links and highlights', 'academy'),
			__('Secondary: soft backgrounds behind highlights and tags', 'academy'),
			__('Text, Gray, Borders and Surface', 'academy'),
			__('A full second palette for Dark Mode', 'academy'),
			__('Ready-made color sets and “Back to Academy’s default”', 'academy'),
			__('Let your theme’s buttons and links follow the primary color', 'academy'),
			__('Shape: card corners, button corners and card title size', 'academy'),
		],
		media: (
			<CompareShots
				label={__('Compare Colors & Style in light and dark', 'academy')}
				left={{ file: 'customize-style-v2.webp', alt: __('Colors & Style in light mode', 'academy') }}
				right={{ file: 'customize-style-dark-v2.webp', alt: __('Colors & Style in dark mode', 'academy') }}
			/>
		),
	},
	{
		key: 'card',
		icon: 'grid',
		label: __('Course Catalog', 'academy'),
		kicker: __('Course Catalog', 'academy'),
		title: __('Decide what every course card shows', 'academy'),
		body: __('Drag card parts into the order you want and switch off anything you do not need. The settings apply everywhere courses are listed.', 'academy'),
		bullets: [
			__('Image, featured badge, categories, price, title, excerpt', 'academy'),
			__('Instructor, course details, rating, button, wishlist', 'academy'),
			__('Image shape for every card', 'academy'),
			__('Courses per row on desktop, tablet and mobile', 'academy'),
			__('Filters sidebar on the right, left or hidden', 'academy'),
			__('Card style for classic templates and [academy_courses]', 'academy'),
			__('Edit the card, or the whole catalog, with blocks', 'academy'),
		],
		media: <Shot file="customize-card.webp" url="Customize › Course Catalog" alt={__('Course card parts with drag handles and toggles', 'academy')} />,
	},
	{
		key: 'page',
		icon: 'book',
		label: __('Course Page', 'academy'),
		kicker: __('Course Page', 'academy'),
		title: __('Arrange the sections of a course page', 'academy'),
		body: __('The sections down the middle of a course page, in your order. Drag to reorder, switch off what you do not want, and choose where the enroll box sits.', 'academy'),
		bullets: [
			__('Intro video or image, categories, title', 'academy'),
			__('Instructor, rating and details; description', 'academy'),
			__('Benefits and requirements; curriculum; attachments', 'academy'),
			__('Instructor profiles, rating summary, review form, reviews', 'academy'),
			__('Enroll box on the right or left', 'academy'),
			__('Show or hide how many students enrolled', 'academy'),
			__('Edit the sections with blocks', 'academy'),
		],
		media: <Shot file="customize-page.webp" url="Customize › Course Page" alt={__('Course page sections list with toggles', 'academy')} />,
	},
	{
		key: 'learn',
		icon: 'video',
		label: __('Learn Page', 'academy'),
		kicker: __('Learn Page', 'academy'),
		title: __('Shape the page students learn on', 'academy'),
		body: __('Choose the new block learn page or the classic player, then set its layout, top bar and colors while the preview shows a real lesson.', 'academy'),
		bullets: [
			__('Block learn page or classic player', 'academy'),
			__('Curriculum side, width, and open by default', 'academy'),
			__('Content width: Standard, Wide or Focused', 'academy'),
			__('Theme header and footer on or off', 'academy'),
			__('Color mode: light, dark or follow the device', 'academy'),
			__('Top bar items in your order, plus a More menu', 'academy'),
			__('Colors for top bar, curriculum, lesson area, footer and current topic', 'academy'),
			__('“Lesson 3 of 12” topic title and Mark as complete button', 'academy'),
			__('Let students switch to dark mode or change the width', 'academy'),
		],
		media: <Shot file="customize-learn.webp" url="Customize › Learn Page" alt={__('Learn Page settings: block or classic, layout and top bar', 'academy')} />,
	},
	{
		key: 'dashboard',
		icon: 'layout',
		label: __('Dashboard', 'academy'),
		kicker: __('Dashboard', 'academy'),
		title: __('The dashboard people see after logging in', 'academy'),
		body: __('Pick the block dashboard or the classic one, then set its layout, menu, home page and colors. The same options apply to both.', 'academy'),
		bullets: [
			__('Layout: your theme’s page, header and footer only, or dashboard only', 'academy'),
			__('Width: automatic, centred or full', 'academy'),
			__('Color mode, and a switch that lets people pick dark', 'academy'),
			__('Rename, reorder or switch off any menu item, per area', 'academy'),
			__('Add a new page, or an existing WordPress page, to the menu', 'academy'),
			__('Menu width, and start with the menu collapsed', 'academy'),
			__('Home page: welcome message with {name}, continue learning, numbers', 'academy'),
			__('Colors for background, menu, current item, top bar and cards', 'academy'),
		],
		media: <Shot file="customize-dashboard.webp" url="Customize › Dashboard" alt={__('Dashboard settings: block or classic, layout, width and menu', 'academy')} />,
	},
];

const Customize = () => {
	const [active, setActive] = useState('style');

	return (
		<Chapter
			id="awn-customize"
			tone="wash"
			head={{
				eyebrow: __('Customize', 'academy'),
				title: __('Your look, set in one place.', 'academy'),
				accent: __('With a live preview.', 'academy'),
				desc: __(
					'A new Customize screen decides how everything looks: colors, course cards, course pages, the learn page and the dashboard. Nothing changes until you press Save.',
					'academy'
				),
			}}
		>
			<Carousel label={__('Customize screenshots', 'academy')} slides={SLIDES} />

			<Tabs
				label={__('Customize panels', 'academy')}
				items={PANELS}
				active={active}
				onChange={setActive}
			/>
			<TabPanels items={PANELS} active={active}>
				{(panel) => (
					<Row
						kicker={panel.kicker}
						title={panel.title}
						body={panel.body}
						bullets={panel.bullets}
						media={panel.media}
					/>
				)}
			</TabPanels>

			<div className="awn-presets">
				{PRESETS.map((p) => (
					<div className="awn-preset" key={p.name}>
						<b>{p.name}</b>
						<p>{p.body}</p>
					</div>
				))}
			</div>
		</Chapter>
	);
};

export default Customize;
