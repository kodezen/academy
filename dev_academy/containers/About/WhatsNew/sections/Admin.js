import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row, FeatureGrid } from '../parts';
import { CompareShots, Shot } from '../media';

const EXTRAS = [
	{
		icon: 'moon',
		title: __('Light, dark or system', 'academy'),
		body: __('One toggle in the top bar switches the whole admin and remembers your choice.', 'academy'),
	},
	{
		icon: 'search',
		title: __('Global search', 'academy'),
		body: __('Jump to any course, lesson, student or setting from anywhere with ⌘K.', 'academy'),
	},
	{
		icon: 'compass',
		title: __('Guide me', 'academy'),
		body: __('Step-by-step tours point at the exact button to press on screens you have not used yet.', 'academy'),
	},
	{
		icon: 'wand',
		title: __('A new setup wizard', 'academy'),
		body: __('Pages, roles and payments sorted in a few steps, so a fresh site is ready the same day.', 'academy'),
	},
	{
		icon: 'sparkle',
		title: __('Pro features, marked', 'academy'),
		body: __('Pro badges and short teasers show what a feature does before you click it.', 'academy'),
	},
	{
		icon: 'shield',
		title: __('Safer screens', 'academy'),
		body: __('If one panel fails, it shows a message and a retry instead of taking the whole page down.', 'academy'),
	},
];

const Admin = () => (
	<Chapter
		id="awn-admin"
		head={{
			eyebrow: __('Admin, rebuilt', 'academy'),
			title: __('Designed for flow.', 'academy'),
			accent: __('Day and night.', 'academy'),
			accentBreak: true,
			desc: __(
				'Every admin screen was rebuilt on one design system: a calmer palette, denser tables and the same controls in the same place on every page. Drag the handle to compare both themes.',
				'academy'
			),
		}}
	>
		<CompareShots
			label={__('Compare the light and dark admin', 'academy')}
			left={{ file: 'admin-light.webp', alt: __('Courses screen in light mode', 'academy') }}
			right={{ file: 'admin-dark.webp', alt: __('Courses screen in dark mode', 'academy') }}
		/>

		<FeatureGrid items={EXTRAS} cols={3} />

		<Row
			title={__('A home screen that tells you what to do next', 'academy')}
			body={__(
				'The Overview opens with a getting-started checklist that ticks itself off as you go, then the numbers that matter.',
				'academy'
			)}
			bullets={[
				__('Checklist: first course, your look, payments, first student', 'academy'),
				__('Hide the checklist once you are set up', 'academy'),
				__('Live meetings and upcoming meetings at a glance', 'academy'),
			]}
			media={
				<Shot
					file="overview.webp"
					url="admin.php?page=academy"
					alt={__('Academy Overview with the getting started checklist and stat cards', 'academy')}
				/>
			}
		/>
	</Chapter>
);

export default Admin;
