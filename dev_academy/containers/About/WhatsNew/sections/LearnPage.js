import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, FeatureGrid } from '../parts';
import { CompareShots, Shot } from '../media';

const DRAWERS = [
	{
		file: 'f-learn-notes.webp',
		title: __('Notes', 'academy'),
		body: __('Notes per lesson, or for the whole course, without leaving the video.', 'academy'),
	},
	{
		file: 'f-learn-progress.webp',
		title: __('Progress', 'academy'),
		body: __('Completed lessons, total duration and Mark as Complete in one drawer.', 'academy'),
	},
];

const MORE = [
	{
		icon: 'message',
		title: __('Q&A and Announcements drawers', 'academy'),
		body: __('Ask a question or read course news in a side drawer, right beside the lesson.', 'academy'),
	},
	{
		icon: 'layout',
		title: __('Docked, collapsible curriculum', 'academy'),
		body: __('Left or right, open or closed, with the width you choose for comfortable reading.', 'academy'),
	},
	{
		icon: 'type',
		title: __('S / M / L content size', 'academy'),
		body: __('Students pick the reading size that suits them from small, medium or large.', 'academy'),
	},
	{
		icon: 'sliders',
		title: __('A top bar you arrange', 'academy'),
		body: __('Progress, review, notes, announcements, Q&A, favorite and share, arranged in your order.', 'academy'),
	},
	{
		icon: 'zap',
		title: __('Instant or full reload', 'academy'),
		body: __('Load lessons without a page refresh, or with one for pages using heavy shortcodes.', 'academy'),
	},
	{
		icon: 'phone',
		title: __('Built for phones', 'academy'),
		body: __('A mobile layout that starts with the curriculum closed so content comes first.', 'academy'),
	},
];

const LearnPage = () => (
	<Chapter
		id="awn-learn"
		head={{
			eyebrow: __('Learn page', 'academy'),
			title: __('A learn page students', 'academy'),
			accent: __('want to stay on.', 'academy'),
			desc: __(
				'Rebuilt from scratch. Notes, Q&A, announcements and progress open in drawers beside the lesson, so students never lose their place.',
				'academy'
			),
		}}
	>
		<CompareShots
			label={__('Compare the learn page in light and dark mode', 'academy')}
			left={{ file: 'f-learn-v2.webp', alt: __('Learn page in light mode', 'academy') }}
			right={{ file: 'f-learn-dark-v2.webp', alt: __('Learn page in dark mode', 'academy') }}
		/>

		<div className="awn-duo">
			{DRAWERS.map((d) => (
				<div className="awn-duo__card" key={d.file}>
					<Shot file={d.file} alt={d.title} />
					<h4>{d.title}</h4>
					<p>{d.body}</p>
				</div>
			))}
		</div>

		<FeatureGrid items={MORE} cols={3} />
	</Chapter>
);

export default LearnPage;
