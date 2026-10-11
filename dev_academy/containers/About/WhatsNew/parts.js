import React from 'react';
import { __ } from '@wordpress/i18n';
import Icon from './Icons';

export const Eyebrow = ({ children, tone = 'light' }) => (
	<span className={`awn-eyebrow awn-eyebrow--${tone}`}>
		<Icon name="wand" size={14} />
		{children}
	</span>
);

export const ProBadge = () => (
	<span className="awn-pro">
		<Icon name="sparkle" size={12} />
		{__('Pro', 'academy')}
	</span>
);

/*
 * The split section header from the marketing site: eyebrow + big title on
 * the left, a short paragraph pinned to the right. `center` stacks them.
 */
export const SectionHead = ({
	eyebrow,
	title,
	accent,
	accentBreak = false,
	plainAccent = false,
	desc,
	center = false,
	solo = false,
	tone = 'light',
	id,
}) => (
	<header
		className={`awn-head${center ? ' awn-head--center' : ''}${
			solo ? ' awn-head--solo' : ''
		}`}
	>
		<div className="awn-head__main">
			{eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
			<h2 className="awn-head__title" id={id}>
				{title}
				{accent ? (
					<>
						{' '}
						<span
							className={`awn-head__accent${
								accentBreak ? ' awn-head__accent--break' : ''
							}${plainAccent ? ' awn-head__accent--plain' : ''}`}
						>
							{accent}
						</span>
					</>
				) : null}
			</h2>
		</div>
		{desc ? <p className="awn-head__desc">{desc}</p> : null}
	</header>
);

/* The Academy mark: a graduation cap on a gradient tile. */
export const LogoMark = ({ size = 96 }) => (
	<span
		className="awn-logo"
		style={{ width: size, height: size, borderRadius: size * 0.28 }}
		aria-hidden="true"
	>
		<svg viewBox="0 0 48 48" width={size * 0.56} height={size * 0.56}>
			<path d="M4 18L24 8l20 10-20 10z" fill="#fff" />
			<path
				d="M11 22.5v9.5c0 3 5.8 6 13 6s13-3 13-6v-9.5L24 29z"
				fill="#fff"
				opacity=".72"
			/>
			<path d="M21 14.5v7l6-3.5z" fill="#7b5cfa" />
		</svg>
	</span>
);

export const Bullet = ({ children }) => (
	<li className="awn-bullet">
		<Icon name="checkCircle" size={18} />
		<span>{children}</span>
	</li>
);

/* A chapter of the page: anchor id for the jump nav, a head, then content. */
export const Chapter = ({ id, tone, head, children }) => (
	<section
		id={id}
		className={`awn-section${tone ? ` awn-section--${tone}` : ''}`}
		aria-labelledby={`${id}-title`}
	>
		<SectionHead id={`${id}-title`} tone={tone === 'dark' ? 'dark' : 'light'} {...head} />
		{children}
	</section>
);

/*
 * Text beside media. `flip` puts the media on the left. `pro` adds the badge
 * next to the title. `media` is any node (a Shot, a mock, an illustration).
 */
export const Row = ({ kicker, title, body, bullets = [], media, flip, pro, wide }) => (
	<div className={`awn-row${flip ? ' awn-row--flip' : ''}${wide ? ' awn-row--wide' : ''}`}>
		<div className="awn-row__text">
			{kicker ? <span className="awn-row__kicker">{kicker}</span> : null}
			<h3>
				{title}
				{pro ? (
					<>
						{' '}
						<ProBadge />
					</>
				) : null}
			</h3>
			{body ? <p>{body}</p> : null}
			{bullets.length ? (
				<ul className={`awn-bullets${bullets.length > 6 ? ' awn-bullets--dense' : ''}`}>
					{bullets.map((b) => (
						<Bullet key={b}>{b}</Bullet>
					))}
				</ul>
			) : null}
		</div>
		<div className="awn-row__media">{media}</div>
	</div>
);

/* Small icon + title + line cards, for features that need no picture. */
export const FeatureGrid = ({ items, cols = 3 }) => (
	<div className={`awn-fgrid awn-fgrid--${cols}`}>
		{items.map((it) => (
			<div className="awn-fcard" key={it.title}>
				<div className="awn-fcard__top">
					<span className="awn-icon-tile">
						<Icon name={it.icon} size={20} />
					</span>
					{it.pro ? <ProBadge /> : null}
				</div>
				<h4>{it.title}</h4>
				<p>{it.body}</p>
			</div>
		))}
	</div>
);

/*
 * Pill tabs that swap one panel. The design uses them where a chapter shows
 * one of several closely related screens (course steps, Customize panels).
 */
export const Tabs = ({ label, items, active, onChange }) => (
	<div className="awn-tabs" role="tablist" aria-label={label}>
		{items.map((t) => (
			<button
				type="button"
				role="tab"
				key={t.key}
				id={`awn-tab-${t.key}`}
				aria-selected={active === t.key}
				aria-controls={`awn-panel-${t.key}`}
				className={`awn-tabs__btn${active === t.key ? ' is-active' : ''}`}
				onClick={() => onChange(t.key)}
			>
				{t.icon ? <Icon name={t.icon} size={18} /> : null}
				{t.label}
			</button>
		))}
	</div>
);

/*
 * Every tab's panel stays mounted, stacked in one grid cell, and only the
 * active one shows. The stack is as tall as its tallest panel, so switching
 * tabs never collapses the page while a screenshot loads, and the other
 * screenshots are already loaded when their tab is picked.
 */
export const TabPanels = ({ items, active, children }) => (
	<div className="awn-tabpanels">
		{items.map((item) => {
			const isActive = item.key === active;
			return (
				<div
					key={item.key}
					className={`awn-tabpanel${isActive ? ' is-active' : ''}`}
					role="tabpanel"
					id={`awn-panel-${item.key}`}
					aria-labelledby={`awn-tab-${item.key}`}
					aria-hidden={isActive ? undefined : true}
				>
					{children(item)}
				</div>
			);
		})}
	</div>
);
