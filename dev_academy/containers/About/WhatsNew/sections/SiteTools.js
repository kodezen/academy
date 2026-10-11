import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row, FeatureGrid } from '../parts';
import { Shot } from '../media';

const SMALL = [
	{
		icon: 'lock',
		title: __('Force-login popup', 'academy'),
		body: __('Ask guests to log in with a popup, right where they are.', 'academy'),
	},
	{
		icon: 'bell',
		title: __('Live notifications', 'academy'),
		body: __('Notifications update live, without a page reload.', 'academy'),
	},
	{
		icon: 'search',
		title: __('Student search', 'academy'),
		body: __('Search your students straight from the Students screen.', 'academy'),
	},
	{
		icon: 'download',
		title: __('Export everything', 'academy'),
		body: __('Export all students and all courses, not only the page you are on.', 'academy'),
	},
	{
		icon: 'eye',
		title: __('Buy from a locked preview', 'academy'),
		body: __('A locked lesson preview now offers to buy or enroll right there.', 'academy'),
	},
	{
		icon: 'download',
		title: __('Attachment downloads', 'academy'),
		body: __('A download modal, an attachment editor, and a record of who downloaded what.', 'academy'),
	},
	{
		icon: 'note',
		title: __('Notes addon', 'academy'),
		body: __('Per-lesson notes, notes pinned to a video time, and a My Notes dashboard page.', 'academy'),
	},
	{
		icon: 'mail',
		title: __('Mail builder', 'academy'),
		body: __('A rich-text editor for the emails Academy sends.', 'academy'),
	},
	{
		icon: 'webhook',
		title: __('Webhooks screen', 'academy'),
		body: __('Outgoing and incoming webhooks in one place.', 'academy'),
	},
	{
		icon: 'zap',
		title: __('Faster under load', 'academy'),
		body: __('Lesson comments now work with a persistent object cache.', 'academy'),
	},
	{
		icon: 'puzzle',
		title: __('SCORM packages', 'academy'),
		body: __('Uploaded zips may now contain .html and .htm files.', 'academy'),
	},
	{
		icon: 'wand',
		title: __('Dummy Data seeder', 'academy'),
		body: __('Fill a test site with a full sample course in one click, and remove it just as fast.', 'academy'),
	},
];

const SiteTools = () => (
	<Chapter
		id="awn-site"
		head={{
			eyebrow: __('Running your site', 'academy'),
			title: __('The quiet features', 'academy'),
			accent: __('you will use every week.', 'academy'),
			desc: __(
				'Maintenance mode, a new home for extensions, and a long list of small things that remove friction for admins and students.',
				'academy'
			),
		}}
	>
		<Row
			kicker={__('Maintenance mode', 'academy')}
			title={__('Lock the catalog while you work', 'academy')}
			body={__(
				'Temporarily lock visitors out of the whole course catalog, a single course, or the learn page while you make changes. Admins and instructors always get through.',
				'academy'
			)}
			bullets={[
				__('Scope: whole site or selected courses', 'academy'),
				__('Off by default', 'academy'),
			]}
			media={
				<Shot
					file="settings.webp"
					url="Academy LMS › Settings"
					alt={__('Settings › General with the Maintenance Mode scope option', 'academy')}
				/>
			}
		/>

		<Row
			flip
			kicker={__('Extensions & Integrations', 'academy')}
			title={__('Every addon, filtered and explained', 'academy')}
			body={__(
				'Addons are grouped by what they do, with plan and status filters and a short description on each card, so you know what you are switching on.',
				'academy'
			)}
			media={
				<Shot
					file="addons.webp"
					url="Academy LMS › Add-ons"
					alt={__('Add-ons screen grouped into Course Features with toggles', 'academy')}
				/>
			}
		/>

		<Row
			kicker={__('Discover', 'academy')}
			title={__('The rest of the Kodezen ecosystem', 'academy')}
			body={__(
				'A Discover page shows the plugins built to work with Academy, from selling and engagement to design and security.',
				'academy'
			)}
			media={
				<Shot
					file="discover.webp"
					url="Academy LMS › Discover"
					alt={__('Discover page listing Kodezen products by category', 'academy')}
				/>
			}
		/>

		<FeatureGrid items={SMALL} cols={3} />
	</Chapter>
);

export default SiteTools;
