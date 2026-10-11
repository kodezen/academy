import React from 'react';
import { __ } from '@wordpress/i18n';
import Icon from '../Icons';
import { SectionHead } from '../parts';

/* ---------- Mini illustrations ---------- */
const ResumeArt = () => (
	<div className="awn-art-resume">
		<svg viewBox="0 0 120 120" className="awn-art-resume__ring">
			<circle cx="60" cy="60" r="50" className="track" />
			<circle cx="60" cy="60" r="50" className="bar" pathLength="100" />
		</svg>
		<div className="awn-art-resume__center">
			<b>12:40</b>
			<small>{__('left', 'academy')}</small>
		</div>
		<div className="awn-art-resume__card">
			<Icon name="resume" size={16} />
			<span>
				<b>{__('Resume attempt', 'academy')}</b>
				<small>{__('Question 7 of 20 · order locked', 'academy')}</small>
			</span>
		</div>
	</div>
);

const AiArt = () => (
	<div className="awn-art-ai">
		<div className="awn-art-ai__ask">
			<div className="awn-art-ai__answer">
				<small>{__('Student answer', 'academy')}</small>
				{__('Use a wider aperture so more light reaches the sensor.', 'academy')}
			</div>
			<span className="awn-art-ai__bot">
				<Icon name="bot" size={15} />
			</span>
		</div>
		<div className="awn-art-ai__reply">
			<span className="awn-art-ai__bot">
				<Icon name="bot" size={15} />
			</span>
			<div>
				<small>{__('AI feedback', 'academy')}</small>
				{__('Right idea. Mention that a slower shutter speed works too, and what it costs you in motion blur.', 'academy')}
			</div>
		</div>
	</div>
);

const DropdownArt = () => (
	<p className="awn-art-dd">
		{__('Tungsten light looks', 'academy')}{' '}
		<span className="awn-art-dd__select">
			{__('orange', 'academy')}
			<Icon name="chevronDown" size={12} />
		</span>{' '}
		{__('on a daylight white balance.', 'academy')}
	</p>
);

const WAVE = [6, 14, 9, 20, 12, 24, 16, 8, 18, 11, 22, 7, 15, 10, 19, 6];

const Bars = ({ from, to }) => (
	<span className="awn-art-audio__wave">
		{WAVE.slice(from, to).map((h, i) => (
			<i key={i} style={{ height: h, animationDelay: `${(from + i) * 0.08}s` }} />
		))}
	</span>
);

const AudioArt = () => (
	<div className="awn-art-audio">
		<Bars from={0} to={8} />
		<span className="awn-art-audio__play">
			<Icon name="play" size={14} />
		</span>
		<Bars from={8} to={16} />
	</div>
);

const RichArt = () => (
	<div className="awn-art-rich">
		<div className="awn-art-rich__bar">
			<b>B</b>
			<i>I</i>
			<u>U</u>
			<span>
				<Icon name="image" size={12} />
			</span>
			<span>∑</span>
		</div>
		<div className="awn-art-rich__body">
			{__('Solve for', 'academy')} <em>x</em>: x² + 4x = 12
		</div>
	</div>
);

const LockArt = () => (
	<div className="awn-art-lock">
		<span className="awn-art-lock__icon">
			<Icon name="lock" size={22} />
		</span>
		<span className="awn-art-lock__toast">
			{__('Leaving the quiz tab is recorded', 'academy')}
		</span>
	</div>
);

const CARDS = [
	{
		size: 'lg',
		title: __('Resume mode', 'academy'),
		body: __(
			'Students can leave and come back to the same attempt. The timer, the attempt limit and the question order all hold.',
			'academy'
		),
		Art: ResumeArt,
	},
	{
		size: 'lg',
		title: __('AI feedback on every answer', 'academy'),
		body: __(
			'Graded answers can carry a short note that explains what was right and what to improve, not just a score.',
			'academy'
		),
		Art: AiArt,
	},
	{
		size: 'sm',
		title: __('Dropdown questions', 'academy'),
		body: __('Pick the right word inside a sentence.', 'academy'),
		Art: DropdownArt,
	},
	{
		size: 'sm',
		title: __('Audio questions', 'academy'),
		body: __('Attach a clip for listening and language tests.', 'academy'),
		Art: AudioArt,
	},
	{
		size: 'sm',
		title: __('Rich text and images', 'academy'),
		body: __('Formatting, formulas and sized, aligned images.', 'academy'),
		Art: RichArt,
	},
	{
		size: 'sm',
		title: __('Quiz protection', 'academy'),
		body: __('A browser lock for exams that need to be fair.', 'academy'),
		Art: LockArt,
	},
];

const Assess = () => (
	<section className="awn-section awn-section--dark" aria-labelledby="awn-assess-title">
		<SectionHead
			id="awn-assess-title"
			tone="dark"
			eyebrow={__('Quizzes', 'academy')}
			title={__('Assessment that is fairer,', 'academy')}
			accent={__('and more fun to take.', 'academy')}
			desc={__(
				'New question types for richer tests, and new rules that keep results honest. All of it in the free plugin.',
				'academy'
			)}
		/>
		<div className="awn-bento">
			{CARDS.map(({ size, title, body, Art }) => (
				<article className={`awn-dcard awn-dcard--${size}`} key={title}>
					<div className="awn-dcard__art">
						<Art />
					</div>
					<h3>{title}</h3>
					<p>{body}</p>
				</article>
			))}
		</div>
	</section>
);

export default Assess;
