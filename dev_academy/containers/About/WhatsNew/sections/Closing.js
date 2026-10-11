import React from 'react';
import { __ } from '@wordpress/i18n';
import { Link } from 'react-router-dom';
import { route_path } from '@Utils/helper';
import Icon from '../Icons';

const HEADS_UP = [
	{
		title: __('Notes is now an addon', 'academy'),
		body: __('If students used the lesson notebook, switch on Notes under Add-ons to bring it back.', 'academy'),
	},
	{
		title: __('Registration forms moved to a block', 'academy'),
		body: __('Forms made with the old Form Builder keep working. To edit one, convert it to the Registration Form block.', 'academy'),
	},
	{
		title: __('A new video player', 'academy'),
		body: __('The Kodezen Player replaces the old player setting. Check a video lesson after updating.', 'academy'),
	},
	{
		title: __('Social Login moved to GemSecurity', 'academy'),
		body: __('The Social Login addon is deprecated. GemSecurity handles social login, 2FA and captcha.', 'academy'),
	},
	{
		title: __('Block templates are opt-in', 'academy'),
		body: __('Sites with published courses stay on the classic layout. Switch from the notice or from Customize, and switch back any time.', 'academy'),
	},
	{
		title: __('Fewer settings to think about', 'academy'),
		body: __('The editor type and web font settings are gone; icons now always load.', 'academy'),
	},
];

export const HeadsUp = () => (
	<section className="awn-heads" aria-labelledby="awn-heads-title">
		<div className="awn-heads__intro">
			<span className="awn-heads__icon">
				<Icon name="bell" size={22} />
			</span>
			<h2 id="awn-heads-title">{__('Updating an existing site?', 'academy')}</h2>
			<p>{__('A few things work differently in 4.0. Here is what to check after you update.', 'academy')}</p>
		</div>
		<ul className="awn-heads__list">
			{HEADS_UP.map((h) => (
				<li key={h.title}>
					<b>{h.title}</b>
					<p>{h.body}</p>
				</li>
			))}
		</ul>
	</section>
);

export const Closing = () => (
	<section className="awn-close" aria-labelledby="awn-close-title">
		<ul className="awn-close__stats">
			<li>
				<b>47</b>
				{__('blocks', 'academy')}
			</li>
			<li>
				<b>6</b>
				{__('design presets', 'academy')}
			</li>
			<li>
				<b>5</b>
				{__('Customize panels', 'academy')}
			</li>
			<li>
				<b>3</b>
				{__('dashboard areas', 'academy')}
			</li>
		</ul>
		<h2 id="awn-close-title">{__('That’s 4.0. Go build something.', 'academy')}</h2>
		<div className="awn-close__actions">
			{/* In-app route, so Customize opens without a full page reload. */}
			<Link className="awn-btn awn-btn--light" to={`${route_path}admin.php?page=academy-design`}>
				{__('Open Customize', 'academy')}
				<Icon name="arrow" size={16} />
			</Link>
			<a
				className="awn-btn awn-btn--outline-light"
				href="https://wordpress.org/support/plugin/academy/reviews/#new-post"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon name="star" size={16} />
				{__('Leave a review', 'academy')}
			</a>
		</div>
		<button
			type="button"
			className="awn-close__top"
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			aria-label={__('Back to top', 'academy')}
		>
			<Icon name="chevronDown" size={18} />
		</button>
	</section>
);
