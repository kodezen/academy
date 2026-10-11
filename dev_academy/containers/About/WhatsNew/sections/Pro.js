import React from 'react';
import { __ } from '@wordpress/i18n';
import { is_pro } from '@Utils/helper';
import Icon from '../Icons';
import { Chapter } from '../parts';
import { Shot } from '../media';

/* ---------- Mini illustrations ---------- */
const TimerArt = () => (
	<div className="awn-pa-timer">
		<div className="awn-pa-timer__digits">
			<span>02</span>:<span>47</span>:<span>13</span>
		</div>
		<small>{__('left on this course', 'academy')}</small>
		<span className="awn-pa-timer__lock">
			<Icon name="lock" size={13} />
			{__('Locks when time runs out', 'academy')}
		</span>
	</div>
);

const BookingArt = () => (
	<div className="awn-pa-book">
		<div className="awn-pa-book__slot">
			<Icon name="calendar" size={15} />
			<span>
				<b>{__('Thu, 10:30 – 11:00', 'academy')}</b>
				<small>{__('1:1 portfolio review', 'academy')}</small>
			</span>
			<em>{__('Confirmed', 'academy')}</em>
		</div>
		<div className="awn-pa-book__meet">
			<Icon name="video" size={15} />
			meet.google.com/abc-defg-hij
		</div>
		<div className="awn-pa-book__actions">
			<span>{__('Reschedule', 'academy')}</span>
			<span>{__('Cancel', 'academy')}</span>
		</div>
	</div>
);

const SeatsArt = () => (
	<div className="awn-pa-seats">
		<div className="awn-pa-seats__row">
			<b>{__('Acme Corp · 25 seats', 'academy')}</b>
			<small>{__('18 used', 'academy')}</small>
		</div>
		<span className="awn-pa-seats__bar">
			<i style={{ width: '72%' }} />
		</span>
		<div className="awn-pa-seats__dates">
			<span>{__('Starts 1 Oct', 'academy')}</span>
			<span className="is-warn">{__('Expires 31 Dec', 'academy')}</span>
		</div>
	</div>
);

const BIG = [
	{
		title: __('Course Active Timer', 'academy'),
		body: __('A server-side timer per student and course. When time runs out, the course locks. Admins watch it all from a monitor screen.', 'academy'),
		Art: TimerArt,
	},
	{
		title: __('Tutor Booking with meetings', 'academy'),
		body: __('Confirming a booking creates the Zoom or Google Meet link automatically. Students can reschedule or cancel, one live booking at a time.', 'academy'),
		Art: BookingArt,
	},
	{
		title: __('Group Plus seat terms', 'academy'),
		body: __('Seats get a start and end date, expire on schedule with a notice, and take course-level defaults. Price by the number of seats.', 'academy'),
		Art: SeatsArt,
	},
];

const SMALL = [
	{ icon: 'key', title: __('Manage Roles', 'academy'), body: __('Staff permissions by area, plus a new Academy Manager role.', 'academy') },
	{ icon: 'award', title: __('Grade Book', 'academy'), body: __('An overall grade comment and a color-coded report.', 'academy') },
	{ icon: 'layers', title: __('Content Drip', 'academy'), body: __('Release content by module, not only lesson by lesson.', 'academy') },
	{ icon: 'grid', title: __('Course Bundle', 'academy'), body: __('A full-page editor, a block template and a shortcode.', 'academy') },
	{ icon: 'webhook', title: __('Incoming webhooks', 'academy'), body: __('Enroll students, complete courses and create users from outside, signed with HMAC and logged.', 'academy') },
	{ icon: 'school', title: __('Digital Campus', 'academy'), body: __('Exams, report cards, fees on StoreEngine, attendance, timetables, notices and more. Needs the free Academy Digital Campus plugin.', 'academy') },
];

const Pro = () => (
	<Chapter
		id="awn-pro"
		tone="dark"
		head={{
			eyebrow: __('Academy Pro', 'academy'),
			title: __('New in Pro.', 'academy'),
			accent: __('For schools that run on it.', 'academy'),
			desc: __(
				'Timed access, bookings that set up their own meetings, seats that expire on schedule, and a whole school module.',
				'academy'
			),
		}}
	>
		<div className="awn-bento">
			{BIG.map(({ title, body, Art }) => (
				<article className="awn-dcard awn-dcard--third" key={title}>
					<div className="awn-dcard__art">
						<Art />
					</div>
					<h3>{title}</h3>
					<p>{body}</p>
				</article>
			))}
		</div>

		<div className="awn-pro-grid">
			{SMALL.map((s) => (
				<div className="awn-pro-card" key={s.title}>
					<Icon name={s.icon} size={20} />
					<h4>{s.title}</h4>
					<p>{s.body}</p>
				</div>
			))}
		</div>

		<div className="awn-duo awn-duo--dark">
			<Shot
				file="course-timer.webp"
				url="Academy LMS › Course Active Timer"
				alt={__('Course Active Timer monitor listing a course with its allowed time and expiry action', 'academy')}
			/>
			<Shot
				file="tutor-booking.webp"
				url="Dashboard › My Tutor Bookings"
				alt={__('My Tutor Bookings with a booked 1:1 session, its schedule and the tutor’s Google Meet details', 'academy')}
			/>
		</div>

		<div className="awn-pro-cta">
			{is_pro ? (
				<span className="awn-pro-cta__on">
					<Icon name="checkCircle" size={18} />
					{__('Academy Pro is active on this site. Switch these on under Add-ons.', 'academy')}
				</span>
			) : (
				<>
					<p>{__('Every feature on this page marked Pro comes with Academy Pro.', 'academy')}</p>
					<a
						className="awn-btn awn-btn--light"
						href="https://academylms.net/pricing/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Get Academy Pro', 'academy')}
						<Icon name="arrow" size={16} />
					</a>
				</>
			)}
		</div>
	</Chapter>
);

export default Pro;
