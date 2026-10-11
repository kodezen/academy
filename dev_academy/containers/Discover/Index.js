import React, { useMemo, useState } from 'react';
import { __, sprintf, _n } from '@wordpress/i18n';
import TopBar from '@Components/TopBar';
import Search from '@Components/Search';
import { plugin_root_url } from '@Utils/helper';

import './styles.scss';

/*
 * "Discover" — a curated, interactive showcase of the Kodezen ecosystem: the
 * family of plugins that pair with Academy LMS. Products live in a flat list so
 * they can be searched and filtered by category on the client. To add one, drop
 * an entry in PRODUCTS; `logo` is an optional file in assets/images/addons/
 * (falls back to a colored initial when omitted).
 */
const PRODUCTS = [
	{
		name: 'StoreEngine',
		group: __('Sell & Monetize', 'academy'),
		color: '#2271b1',
		logo: 'storeengine.svg',
		url: 'https://storeengine.pro/',
		details: __(
			'A full commerce engine — carts, checkout, orders, subscriptions and payments for your courses.',
			'academy'
		),
	},
	{
		name: 'GemBooking',
		group: __('Sell & Monetize', 'academy'),
		color: '#006BFF',
		logo: 'gembooking.svg',
		url: 'https://gembooking.net/',
		details: __(
			'Appointment and session booking — perfect for tutoring, mentoring and consultations.',
			'academy'
		),
	},
	{
		name: 'GameEngine',
		group: __('Engage & Grow', 'academy'),
		color: '#006BFF',
		logo: 'gameengine.svg',
		url: 'https://gameengine.pro/',
		details: __(
			'Gamify learning with points, badges, ranks and leaderboards to keep students motivated.',
			'academy'
		),
	},
	{
		name: 'ZenCommunity',
		group: __('Engage & Grow', 'academy'),
		color: '#2A3BEE',
		logo: 'zencommunity.svg',
		url: 'https://zencommunity.pro/',
		details: __(
			'Community spaces, discussions and social learning around your courses.',
			'academy'
		),
	},
	{
		name: 'GemCRM',
		group: __('Engage & Grow', 'academy'),
		color: '#006BFF',
		logo: 'gemcrm.svg',
		url: 'https://gemcrm.net/',
		details: __(
			'CRM, email automation and contact management to nurture leads and students.',
			'academy'
		),
	},
	{
		name: 'Zaplane',
		group: __('Engage & Grow', 'academy'),
		color: '#006BFF',
		logo: 'zaplane.svg',
		url: 'https://zaplane.app/',
		details: __(
			'Connect your stack and automate workflows across your favourite tools.',
			'academy'
		),
	},
	{
		name: 'TruePlayer',
		group: __('Teach & Deliver', 'academy'),
		color: '#6366f1',
		url: 'https://kodezen.com/',
		details: __(
			'A modern video player with watch-verification and quiz-gating for lesson videos.',
			'academy'
		),
	},
	{
		name: 'Academy Digital Campus',
		group: __('Teach & Deliver', 'academy'),
		color: '#7B68EE',
		logo: 'academy-digital-campus.svg',
		url: 'https://academylms.net/',
		details: __(
			'Turn Academy into a full school system — admissions, parents, exams, fees and report cards.',
			'academy'
		),
	},
	{
		name: 'aBlocks',
		group: __('Build & Design', 'academy'),
		color: '#1D1D1F',
		logo: 'aBlocks.svg',
		url: 'https://ablocks.pro/',
		details: __(
			'A powerful Gutenberg block library to design pages without code.',
			'academy'
		),
	},
	{
		name: 'WP Map Block',
		group: __('Build & Design', 'academy'),
		color: '#006BFF',
		logo: 'mapblock.svg',
		url: 'https://mapblock.com',
		details: __(
			'Beautiful, fast interactive maps you can drop into any page or lesson.',
			'academy'
		),
	},
	{
		name: 'ZenAppBuilder',
		group: __('Build & Design', 'academy'),
		color: '#1474FF',
		logo: 'zenappbuilder.svg',
		url: 'https://zenappbuilder.com/',
		details: __(
			'Turn your site into a native mobile app without writing code.',
			'academy'
		),
	},
	{
		name: 'GemSecurity',
		group: __('Optimize & Protect', 'academy'),
		color: '#006BFF',
		url: 'https://kodezen.com/',
		details: __(
			'Harden your site with firewall, malware scanning and login protection.',
			'academy'
		),
	},
	{
		name: 'Easy Content Manager',
		group: __('Content Management', 'academy'),
		color: '#111827',
		logo: 'ecm.svg',
		url: 'https://easycontentmanager.pro/',
		details: __(
			'Manage enterprise-level course content and documents efficiently.',
			'academy'
		),
	},
	{
		name: 'GemBoards',
		group: __('Task Management', 'academy'),
		color: '#006BFF',
		logo: 'gemboards.svg',
		url: 'https://gemboards.com/',
		details: __(
			'Plan, track and manage work with Kanban boards built for teams.',
			'academy'
		),
	},
];

// Category order for the filter bar; derived from PRODUCTS but kept explicit so
// the pills read in a deliberate order.
const GROUPS = [
	__('Sell & Monetize', 'academy'),
	__('Engage & Grow', 'academy'),
	__('Teach & Deliver', 'academy'),
	__('Build & Design', 'academy'),
	__('Optimize & Protect', 'academy'),
	__('Content Management', 'academy'),
	__('Task Management', 'academy'),
];

// StoreEngine's brand mark uses two colors split diagonally across the
// badge border rather than the single accent color every other card uses.
const isStoreEngine = (item) => item.name === 'StoreEngine';

const badgeStyle = (item) =>
	isStoreEngine(item)
		? {
				borderTopColor: '#FF5000',
				borderRightColor: '#FF5000',
				borderBottomColor: '#008DFF',
				borderLeftColor: '#008DFF',
				color: item.color,
			}
		: { borderColor: item.color, color: item.color };

const ProductCard = ({ item }) => (
	<a
		className={`academy-discover__card${
			isStoreEngine(item) ? ' academy-discover__card--storeengine' : ''
		}`}
		key={item.name}
		href={item.url}
		target="_blank"
		rel="noopener noreferrer"
		style={{ '--card-accent': item.color }}
	>
		<span className="academy-discover__card-top" />
		<span
			className="academy-discover__card-badge"
			style={badgeStyle(item)}
		>
			{item.logo ? (
				<img
					src={`${plugin_root_url}assets/images/addons/${item.logo}`}
					alt=""
					aria-hidden="true"
				/>
			) : (
				item.name.charAt(0)
			)}
		</span>
		<h4 className="academy-discover__card-title">{item.name}</h4>
		<p className="academy-discover__card-details">{item.details}</p>
		<span className="academy-discover__card-link">
			{__('Learn more', 'academy')}
			<span className="academy-discover__card-arrow" aria-hidden="true">
				→
			</span>
		</span>
	</a>
);

const Discover = () => {
	const [active, setActive] = useState('all');
	const [query, setQuery] = useState('');

	const q = query.trim().toLowerCase();

	const matches = useMemo(
		() =>
			PRODUCTS.filter((p) => {
				// A search spans every category — the active pill only scopes
				// the plain (unsearched) browse.
				if (q) {
					return (
						p.name.toLowerCase().includes(q) ||
						p.details.toLowerCase().includes(q) ||
						p.group.toLowerCase().includes(q)
					);
				}
				return active === 'all' || p.group === active;
			}),
		[active, q]
	);

	// Grouped view only when browsing everything with no search; otherwise a
	// single flat result grid reads better.
	const isBrowsing = active === 'all' && ! q;

	const countFor = (group) =>
		group === 'all'
			? PRODUCTS.length
			: PRODUCTS.filter((p) => p.group === group).length;

	return (
		<>
			<TopBar
				render={() => (
					<h3 className="academy-topbar-heading">
						<span className="academy-icon academy-icon--angle-right" />
						{__('Discover', 'academy')}
					</h3>
				)}
			/>
			<div className="academy-page-content">
				<div className="academy-discover">
					<div className="academy-discover__hero">
						<div
							className="academy-discover__hero-orbs"
							aria-hidden="true"
						>
							<span className="academy-discover__orb academy-discover__orb--1" />
							<span className="academy-discover__orb academy-discover__orb--2" />
							<span className="academy-discover__orb academy-discover__orb--3" />
						</div>
						<div className="academy-discover__hero-inner">
							<span className="academy-discover__eyebrow">
								{__('The Kodezen Ecosystem', 'academy')}
							</span>
							<h2 className="academy-discover__title">
								{__(
									'Everything you need to build, sell and grow your learning business.',
									'academy'
								)}
							</h2>
							<p className="academy-discover__subtitle">
								{__(
									'Academy LMS is part of a family of plugins built by the Kodezen team — each one designed to work beautifully together.',
									'academy'
								)}
							</p>
							<a
								className="academy-discover__cta"
								href="https://kodezen.com/"
								target="_blank"
								rel="noopener noreferrer"
							>
								{__('Explore all products', 'academy')}
								<span aria-hidden="true"> →</span>
							</a>
						</div>
					</div>

					{/* Interactive filter bar: category pills + live search, all
					    wrapping together in one row with search pinned to the end. */}
					<div className="academy-discover__toolbar">
						<button
							type="button"
							className={`academy-discover__pill${
								active === 'all' ? ' is-active' : ''
							}`}
							onClick={() => setActive('all')}
						>
							{__('All', 'academy')}
							<span className="academy-discover__pill-count">
								{countFor('all')}
							</span>
						</button>
						{GROUPS.map((group) => (
							<button
								type="button"
								key={group}
								className={`academy-discover__pill${
									active === group ? ' is-active' : ''
								}`}
								onClick={() => setActive(group)}
							>
								{group}
								<span className="academy-discover__pill-count">
									{countFor(group)}
								</span>
							</button>
						))}
						<div className="academy-discover__search">
							<Search
								placeholder={__(
									'Search products…',
									'academy'
								)}
								defaultValue={query}
								onSearchHandler={setQuery}
							/>
						</div>
					</div>

					{/* Results */}
					{matches.length === 0 && (
						<div className="academy-discover__empty">
							<h3>{__('No products found', 'academy')}</h3>
							<p>
								{__(
									'Try a different search or clear the filters.',
									'academy'
								)}
							</p>
							<button
								type="button"
								className="academy-discover__reset"
								onClick={() => {
									setActive('all');
									setQuery('');
								}}
							>
								{__('Clear filters', 'academy')}
							</button>
						</div>
					)}

					{matches.length > 0 && isBrowsing && (
						<>
							{GROUPS.slice(0, -3).map((group) => (
								<div
									className="academy-discover__section"
									key={group}
								>
									<h3 className="academy-discover__group">
										{group}
									</h3>
									<div className="academy-discover__grid">
										{PRODUCTS.filter(
											(p) => p.group === group
										).map((item) => (
											<ProductCard
												item={item}
												key={item.name}
											/>
										))}
									</div>
								</div>
							))}

							{/* Optimize & Protect / Content Management / Task
							    Management each hold a single product — share
							    one row instead of each claiming a full-width
							    section. */}
							<div className="academy-discover__section academy-discover__section--row">
								{GROUPS.slice(-3).map((group) => (
									<div
										className="academy-discover__section-col"
										key={group}
									>
										<h3 className="academy-discover__group">
											{group}
										</h3>
										<div className="academy-discover__grid">
											{PRODUCTS.filter(
												(p) => p.group === group
											).map((item) => (
												<ProductCard
													item={item}
													key={item.name}
												/>
											))}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{matches.length > 0 && ! isBrowsing && (
						<div className="academy-discover__section">
							<h3 className="academy-discover__group">
								{sprintf(
									/* translators: %d: number of matching products. */
									_n(
										'%d product',
										'%d products',
										matches.length,
										'academy'
									),
									matches.length
								)}
							</h3>
							<div className="academy-discover__grid">
								{matches.map((item) => (
									<ProductCard item={item} key={item.name} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Discover;
