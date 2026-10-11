import React, { useEffect, useRef } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Link } from 'react-router-dom';
import { route_path } from '@Utils/helper';
import { shotUrl } from '../media';

const asset = (name) => shotUrl(`hero/${name}`);

// Chips around the core. dx/dy are the chip centre's offset (px) from the
// centre of the 551 × 400 art box, straight from the Figma frame.
const ORBIT = [
	{
		icon: 'chip2-learn.svg',
		label: __('Learn Page', 'academy'),
		bg: '#e9f3ff',
		dx: 5,
		dy: -189,
	},
	{
		icon: 'chip2-dark.svg',
		label: __('Dark Mode', 'academy'),
		bg: '#fff3e3',
		dx: 183,
		dy: -113,
	},
	{
		icon: 'chip2-player.svg',
		label: __('Kodezen Player', 'academy'),
		bg: '#f1ebff',
		dx: -185,
		dy: -131,
	},
	{
		icon: 'chip2-resume.svg',
		label: __('Resume & Quiz', 'academy'),
		bg: '#eaf0ff',
		dx: -221,
		dy: -1,
	},
	{
		icon: 'chip2-questions.svg',
		label: __('Question Bank', 'academy'),
		bg: '#ffefef',
		dx: 222,
		dy: 7,
	},
	{
		icon: 'chip2-family.svg',
		label: __('Family', 'academy'),
		bg: '#eaf8ef',
		dx: -174,
		dy: 103,
	},
	{
		icon: 'chip2-certificates.svg',
		label: __('Certificates', 'academy'),
		bg: '#f1ebff',
		dx: 154,
		dy: 127,
	},
	{
		icon: 'chip2-blocks.svg',
		label: __('47+ Blocks', 'academy'),
		bg: '#fffbfb',
		dx: -28,
		dy: 193,
	},
];

const PROOF = [
	{ icon: 'stat-user.svg', text: __('904 commits since 3.8', 'academy') },
	{ icon: 'stat-user.svg', text: __('47 new blocks', 'academy') },
	{ icon: 'stat-globe.svg', text: __('20+ New Features', 'academy') },
];

// Chips reach about 300px either side of the centre, so the stage needs a
// 600px-wide column to show at full size; below that it scales down.
const STAGE_WIDTH = 600;

const useArtScale = () => {
	const ref = useRef(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || !('ResizeObserver' in window)) {
			return undefined;
		}
		const ro = new window.ResizeObserver(([entry]) => {
			const scale = Math.min(1, entry.contentRect.width / STAGE_WIDTH);
			el.style.setProperty('--awn-art-scale', scale.toFixed(3));
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	return ref;
};

const Hero = ({ version }) => {
	const artRef = useArtScale();

	return (
		<section className="awn-hero" aria-labelledby="awn-hero-title">
			<div
				className="awn-hero__bg"
				style={{ backgroundImage: `url(${asset('bg-stripes.webp')})` }}
				aria-hidden="true"
			/>
			<div className="awn-hero__inner">
				<div className="awn-hero__text">
					<span className="awn-hero__eyebrow">
						<img
							src={asset('eyebrow-wand.svg')}
							alt=""
							width="16"
							height="16"
						/>
						{sprintf(
							/* translators: %s: version number. */
							__(
								'Academy LMS %s · The biggest release yet',
								'academy'
							),
							version
						)}
					</span>
					<h1 className="awn-hero__title" id="awn-hero-title">
						<span>{__('Every screen, rebuilt.', 'academy')}</span>
						<span className="awn-hero__title-accent">
							{__('Built around how you teach.', 'academy')}
						</span>
					</h1>
					<p className="awn-hero__lead">
						{__(
							'A new admin in light and dark, a learn page students want to stay on, a question bank, a real certificate designer and a dashboard for every role. Here is everything that changed.',
							'academy'
						)}
					</p>
					<div className="awn-hero__actions">
						<a
							className="awn-btn awn-btn--primary"
							href="#awn-admin"
						>
							{__('Explore What’s New', 'academy')}
							<img
								src={asset('chevron.svg')}
								alt=""
								width="20"
								height="20"
							/>
						</a>
						<Link
							className="awn-btn awn-btn--outline"
							to={`${route_path}admin.php?page=academy-discover`}
						>
							{__('See ecosystem', 'academy')}
						</Link>
					</div>
					<ul className="awn-hero__proof">
						{PROOF.map((p, i) => (
							<React.Fragment key={p.text}>
								{i ? (
									<li
										className="awn-hero__proof-sep"
										aria-hidden="true"
									/>
								) : null}
								<li>
									<img
										src={asset(p.icon)}
										alt=""
										width="16"
										height="16"
									/>
									{p.text}
								</li>
							</React.Fragment>
						))}
					</ul>
				</div>

				<div className="awn-hero__art-wrap" ref={artRef}>
					<div className="awn-hero__art" aria-hidden="true">
						<img
							className="awn-hero__glow"
							src={asset('core-glow.svg')}
							alt=""
							width="617"
							height="617"
						/>
						<span className="awn-hero__ring awn-hero__ring--inner" />
						<span className="awn-hero__ring awn-hero__ring--outer" />
						<span className="awn-hero__core">
							<img
								src={asset('core-cap.svg')}
								alt=""
								width="88"
								height="77"
							/>
						</span>
						<span className="awn-hero__halo">
							<span className="awn-hero__version-pill">
							<span className="awn-hero__version">{version}</span>
						</span>
						</span>
						{ORBIT.map((c, i) => (
							<span
								key={c.label}
								className="awn-chip"
								style={{
									left: `calc(50% + ${c.dx}px)`,
									top: `calc(50% + ${c.dy}px)`,
									animationDelay: `${i * -0.7}s`,
								}}
							>
								<span
									className="awn-chip__icon"
									style={{ background: c.bg }}
								>
									<img
										src={asset(c.icon)}
										alt=""
										width="12"
										height="12"
									/>
								</span>
								{c.label}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
