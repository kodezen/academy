import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row, FeatureGrid } from '../parts';
import { Shot } from '../media';

const ITEMS = [
	{
		icon: 'users',
		title: __('Guardian role', 'academy'),
		body: __('A new role for parents, linked to one or more students in the same account.', 'academy'),
	},
	{
		icon: 'book',
		title: __('Assign courses', 'academy'),
		body: __('Guardians can put their children into courses directly from the dashboard.', 'academy'),
	},
	{
		icon: 'checkCircle',
		title: __('Approvals', 'academy'),
		body: __('Guardian requests wait for approval before they take effect on the student.', 'academy'),
	},
	{
		icon: 'gift',
		title: __('Gift a course', 'academy'),
		body: __('Buy a course for a child as a gift.', 'academy'),
		pro: true,
	},
	{
		icon: 'message',
		title: __('Parent–teacher messages', 'academy'),
		body: __('A thread per student and teacher, with unread counts on both sides.', 'academy'),
		pro: true,
	},
	{
		icon: 'mail',
		title: __('Teacher inbox', 'academy'),
		body: __('Teachers read and answer family messages inside the Academy dashboard.', 'academy'),
		pro: true,
	},
];

const Family = () => (
	<Chapter
		id="awn-family"
		head={{
			eyebrow: __('Family', 'academy'),
			title: __('Bring parents into', 'academy'),
			accent: __('the classroom.', 'academy'),
			desc: __(
				'The Guardian addon links families to students. Guardian Pro adds gifts and a real conversation between home and school.',
				'academy'
			),
		}}
	>
		<Row
			kicker={__('My Family', 'academy')}
			title={__('Every child’s progress, on one page', 'academy')}
			body={__(
				'Guardians get their own Family area in the dashboard, with each child’s courses and progress, and a way to assign new ones.',
				'academy'
			)}
			media={
				<Shot
					file="family-art.webp"
					alt={__('A guardian linked to two children, each with course progress, and two new messages from teachers', 'academy')}
				/>
			}
		/>
		<Row
			flip
			kicker={__('Real screen', 'academy')}
			title={__('The Family area, as it ships', 'academy')}
			body={__(
				'Guardians get their own Family area in the dashboard, with each child’s courses and progress, and a way to assign new ones.',
				'academy'
			)}
			media={
				<Shot
					file="family.webp"
					url="Dashboard › My Family"
					alt={__('My Family in the dashboard: children, their courses, assigning a course and parental controls', 'academy')}
				/>
			}
		/>
		<FeatureGrid items={ITEMS} cols={3} />
	</Chapter>
);

export default Family;
