import React from 'react';
import { __ } from '@wordpress/i18n';
import Icon from '../Icons';
import { Chapter, Row } from '../parts';
import { Shot } from '../media';

// Grouped from every block.json that ships in 4.0 (47 in total).
const WALL = [
	{
		group: __('Course page', 'academy'),
		icon: 'book',
		blocks: ['Intro Media', 'Categories', 'Description', 'Details', 'Benefits & Requirements', 'Curriculum', 'Attachments', 'Announcements', 'Instructors', 'Instructor Profiles', 'Enroll Box', 'Enroll Form', 'Price', 'Rating', 'Rating Summary', 'Reviews', 'Review Form', 'Wishlist Button', 'Featured Badge', 'Button'],
	},
	{
		group: __('Catalog', 'academy'),
		icon: 'grid',
		blocks: ['Course Filters', 'Course Search', 'Course Sort'],
	},
	{
		group: __('Learn page', 'academy'),
		icon: 'video',
		blocks: ['Learn Page', 'Top Bar', 'Curriculum', 'Content', 'Footer', 'PDF Viewer'],
	},
	{
		group: __('Dashboard', 'academy'),
		icon: 'layout',
		blocks: ['Dashboard', 'Menu', 'Top Bar', 'Welcome', 'Numbers', 'Pages', 'Continue Learning', 'Enrolled Courses', 'Teaching Courses', 'Student Dashboard'],
	},
	{
		group: __('Forms & account', 'academy'),
		icon: 'form',
		blocks: ['Registration Form', 'Form Field', 'Student Registration', 'Instructor Registration', 'Login Form', 'Password Reset', 'Social Login Buttons', 'Certificate Verification'],
	},
];

const Design = () => (
	<Chapter
		id="awn-blocks"
		tone="wash"
		head={{
			eyebrow: __('Blocks & templates', 'academy'),
			title: __('47 blocks.', 'academy'),
			accent: __('Every page, editable.', 'academy'),
			desc: __(
				'Course pages, the catalog, the learn page and the dashboard are all made of blocks now, with patterns and style presets. Classic themes get the block templates too.',
				'academy'
			),
		}}
	>
		<div className="awn-wall">
			{WALL.map((g) => (
				<div className="awn-wall__group" key={g.group}>
					<div className="awn-wall__head">
						<Icon name={g.icon} size={16} />
						{g.group}
						<small>{g.blocks.length}</small>
					</div>
					<div className="awn-wall__blocks">
						{g.blocks.map((b, i) => (
							<span key={`${g.group}-${b}-${i}`}>{b}</span>
						))}
					</div>
				</div>
			))}
		</div>

		<Row
			kicker={__('Block templates', 'academy')}
			title={__('Course, archive and category templates', 'academy')}
			body={__(
				'Open any Academy page in the Site Editor and change it like the rest of your site. Sites with published courses keep the legacy layout until you opt in, and you can switch back.',
				'academy'
			)}
			bullets={[
				__('Course Grid block built on the Query Loop', 'academy'),
				__('Patterns and style presets', 'academy'),
				__('Works in classic themes too', 'academy'),
				__('New [academy_enrolled_courses] shortcode', 'academy'),
			]}
			media={
				<Shot
					file="site-editor-course.webp"
					url="Site Editor › Single Courses"
					alt={__('Site Editor with the single course template and the Course Enroll Box block selected', 'academy')}
				/>
			}
		/>

		<Row
			flip
			kicker={__('Registration Form block', 'academy')}
			title={__('Sign-up forms you build like a page', 'academy')}
			body={__(
				'One block for student and instructor registration, with eleven field types. An existing form converts in one click.',
				'academy'
			)}
			bullets={[
				__('Student and instructor forms', 'academy'),
				__('Eleven field types, each a block', 'academy'),
				__('One-click convert from the old Form Builder', 'academy'),
			]}
			media={
				<Shot
					file="registration-block.webp"
					url="Pages › Add New"
					alt={__('Block editor with the Registration Form block and a First name field selected', 'academy')}
				/>
			}
		/>
	</Chapter>
);

export default Design;
