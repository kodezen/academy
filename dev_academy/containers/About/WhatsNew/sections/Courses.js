import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row, FeatureGrid, Tabs, TabPanels } from '../parts';
import { Shot } from '../media';
import { MockCourseBuilder } from '../mocks/Builders';

const STEPS = [
	{
		key: 'overview',
		label: __('Overview', 'academy'),
		title: __('Everything about the course on one page', 'academy'),
		body: __(
			'Title, description, price, media and taxonomy sit side by side. Leave the price at 0 for a free course, or set one and it becomes paid.',
			'academy'
		),
		bullets: [
			__('Overview, Builder and Settings as three clear steps', 'academy'),
			__('Save, or Save & Continue to the next step', 'academy'),
			__('Set the status from the same button', 'academy'),
		],
		media: (
			<div className="awn-frame awn-frame--shot">
				<Shot
					file="course-overview.webp"
					url="Edit Course · Overview"
					alt={__('Course editor on the Overview step', 'academy')}
				/>
			</div>
		),
	},
	{
		key: 'builder',
		label: __('Builder', 'academy'),
		title: __('Drag the curriculum into shape', 'academy'),
		body: __(
			'Add topics, then lessons, quizzes and assignments inside them. Reuse content you already made instead of building it again.',
			'academy'
		),
		bullets: [
			__('Reuse Content picker for existing lessons and quizzes', 'academy'),
			__('Lessons, quizzes and announcements open as full-page editors', 'academy'),
			__('Duplicate and edit topics in place', 'academy'),
		],
		media: (
			<div className="awn-frame">
				<MockCourseBuilder />
			</div>
		),
	},
	{
		key: 'settings',
		label: __('Settings', 'academy'),
		title: __('Every course setting, grouped', 'academy'),
		body: __(
			'General, additional info, prerequisites, content drip, course timer, seat validity and volume pricing each get their own tab, so nothing gets buried.',
			'academy'
		),
		bullets: [
			__('Duration, level, language and student limit', 'academy'),
			__('Enrolment start date', 'academy'),
			__('Turn Q&A, announcements and reviews on per course', 'academy'),
		],
		media: (
			<div className="awn-frame awn-frame--shot">
				<Shot
					file="course-settings.webp"
					url="Edit Course · Settings"
					alt={__('Course settings with tabs for drip, timer and pricing', 'academy')}
				/>
			</div>
		),
	},
];

const SMALL = [
	{
		icon: 'star',
		title: __('Featured courses', 'academy'),
		body: __('Mark courses as featured and choose the order they appear in for visitors.', 'academy'),
	},
	{
		icon: 'image',
		title: __('Category images', 'academy'),
		body: __('Give each course category its own featured image for a polished look.', 'academy'),
	},
	{
		icon: 'eye',
		title: __('Preview while you build', 'academy'),
		body: __('Every editor has a preview link so you can check changes before publishing.', 'academy'),
	},
	{
		icon: 'bell',
		title: __('Unsaved changes warning', 'academy'),
		body: __('Leaving an editor with unsaved changes asks first, so no work is lost.', 'academy'),
	},
	{
		icon: 'list',
		title: __('A tidy curriculum', 'academy'),
		body: __('Deleting a lesson, quiz or assignment also removes it from every curriculum.', 'academy'),
	},
	{
		icon: 'layers',
		title: __('Sub-curriculum', 'academy'),
		body: __('Nest topics inside topics to organize longer, module-based courses.', 'academy'),
	},
];

const Courses = () => {
	const [active, setActive] = useState('builder');

	return (
		<Chapter
			id="awn-courses"
			tone="glow"
			head={{
				eyebrow: __('Course building', 'academy'),
				title: __('Build a course one clear step at a time', 'academy'),
				desc: __(
					'Courses, lessons, quizzes and announcements now open as full pages instead of cramped pop-ups.',
					'academy'
				),
			}}
		>
			<Tabs
				label={__('Course builder steps', 'academy')}
				items={STEPS}
				active={active}
				onChange={setActive}
			/>
			<TabPanels items={STEPS} active={active}>
				{(step) => (
					<Row
						title={step.title}
						body={step.body}
						bullets={step.bullets}
						media={step.media}
					/>
				)}
			</TabPanels>

			<FeatureGrid items={SMALL} cols={3} />
		</Chapter>
	);
};

export default Courses;
