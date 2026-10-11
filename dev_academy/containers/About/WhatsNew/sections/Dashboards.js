import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row, FeatureGrid } from '../parts';
import { Shot } from '../media';

const AREAS = [
	{
		key: 'learning',
		label: __('Learning', 'academy'),
		who: __('Students land here', 'academy'),
		tone: 'violet',
		menu: [
			__('Home', 'academy'),
			__('Enrolled Courses', 'academy'),
			__('Grades', 'academy'),
			__('My Notes', 'academy'),
			__('My Reviews', 'academy'),
		],
		stats: [
			[__('Enrolled', 'academy'), '12'],
			[__('Completed', 'academy'), '5'],
		],
	},
	{
		key: 'teaching',
		label: __('Teaching', 'academy'),
		who: __('Instructors land here', 'academy'),
		tone: 'blue',
		menu: [
			__('Home', 'academy'),
			__('My Courses', 'academy'),
			__('Students', 'academy'),
			__('Received Reviews', 'academy'),
			__('Earnings', 'academy'),
		],
		stats: [
			[__('Students', 'academy'), '284'],
			[__('Courses', 'academy'), '9'],
		],
	},
	{
		key: 'family',
		label: __('Family', 'academy'),
		who: __('Guardians land here', 'academy'),
		tone: 'pink',
		menu: [
			__('Home', 'academy'),
			__('My Family', 'academy'),
			__('Assign Courses', 'academy'),
			__('Approvals', 'academy'),
			__('Messages', 'academy'),
		],
		stats: [
			[__('Children', 'academy'), '2'],
			[__('Courses', 'academy'), '6'],
		],
	},
];

const MORE = [
	{
		icon: 'users',
		title: __('“Viewing as” switcher', 'academy'),
		body: __('In the account menu. People with a single role never see it.', 'academy'),
	},
	{
		icon: 'list',
		title: __('Submenus', 'academy'),
		body: __('Any dashboard item can carry a submenu with its own index link.', 'academy'),
	},
	{
		icon: 'award',
		title: __('Grades page', 'academy'),
		body: __('Students see their marks across quizzes and assignments.', 'academy'),
	},
	{
		icon: 'star',
		title: __('My Reviews and Received Reviews', 'academy'),
		body: __('Separate pages, so instructors can finally reach reviews of their courses.', 'academy'),
	},
	{
		icon: 'blocks',
		title: __('Block dashboard', 'academy'),
		body: __('Rearrange the home page and add any block to it in the editor.', 'academy'),
	},
	{
		icon: 'moon',
		title: __('Dark mode', 'academy'),
		body: __('A switch in the top bar; the choice carries over to the learn page.', 'academy'),
	},
];

const Dashboards = () => (
	<Chapter
		id="awn-dashboards"
		tone="wash"
		head={{
			eyebrow: __('Frontend dashboard', 'academy'),
			title: __('One dashboard.', 'academy'),
			accent: __('A view for every role.', 'academy'),
			accentBreak: true,
			desc: __(
				'The menu is grouped into Learning, Teaching and Family. Each area has its own landing page and its own numbers, instead of one long list for everyone.',
				'academy'
			),
		}}
	>
		<div className="awn-areas">
			{AREAS.map((a) => (
				<div className={`awn-area awn-area--${a.tone}`} key={a.key}>
					<div className="awn-area__head">
						<b>{a.label}</b>
						<small>{a.who}</small>
					</div>
					<div className="awn-area__ui" aria-hidden="true">
						<div className="awn-area__menu">
							{a.menu.map((m, i) => (
								<span key={m} className={i === 0 ? 'is-on' : ''}>
									{m}
								</span>
							))}
						</div>
						<div className="awn-area__body">
							<i className="awn-area__hello" />
							<div className="awn-area__stats">
								{a.stats.map(([l, v]) => (
									<span key={l}>
										<small>{l}</small>
										<b>{v}</b>
									</span>
								))}
							</div>
							<i className="awn-area__line" />
							<i className="awn-area__line awn-area__line--short" />
						</div>
					</div>
				</div>
			))}
		</div>

		<Row
			kicker={__('Viewing as', 'academy')}
			title={__('Switch areas from the account menu', 'academy')}
			body={__(
				'An instructor who is also a parent moves between Teaching and Family in one click. Each area opens on its own home page.',
				'academy'
			)}
			media={
				<Shot
					file="dashboard-viewing-as.webp"
					url="Dashboard"
					alt={__('Frontend dashboard with the account menu open, showing Viewing as Learning or Teaching', 'academy')}
				/>
			}
		/>

		<FeatureGrid items={MORE} cols={3} />
	</Chapter>
);

export default Dashboards;
