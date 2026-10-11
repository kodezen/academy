import React, { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { shotUrl } from '../media';

const asset = (name) => shotUrl(`integrations/${name}`);

// Geometry from the Figma frame (15181:2837): a 1270 × 641.6 stage. Each
// node's left/top/width is its box inside that stage.
const STAGE_W = 1270;
const STAGE_H = 641.6;

const NODES = [
	{ side: 'l', name: 'QuizPress', body: __('Attach an existing QuizPress quiz to a course', 'academy'), icon: 'icon-quizpress.svg', left: -11, top: 223, width: 336 },
	{ side: 'l', name: 'GameEngine', body: __('Points, badges and unlocks', 'academy'), icon: 'icon-gameengine.svg', left: 226, top: 342, width: 263 },
	{ side: 'l', name: 'GemSecurity', body: __('2FA, captcha and social login', 'academy'), icon: 'icon-gemsecurity.svg', left: 161, top: 465, width: 265 },
	{ side: 'l', name: 'StoreEngine', body: __('Checkout, and the new licence SDK', 'academy'), icon: 'icon-storeengine.svg', left: -18, top: 566, width: 304 },
	{ side: 'r', name: 'Easy Content Manager', body: __('Now supported alongside Academy', 'academy'), icon: 'icon-ecm.svg', left: 912, top: 218, width: 347 },
	{ side: 'r', name: __('Board & App Builder', 'academy'), body: __('New entries in Extensions', 'academy'), icon: 'icon-board.svg', left: 753, top: 328, width: 289 },
	{ side: 'r', name: 'BuddyPress & Astra', body: __('Compatibility fixes', 'academy'), icon: 'icon-buddypress.svg', left: 826, top: 454, width: 272 },
	{ side: 'r', name: 'EDD & MemberPress', body: __('Compatibility fixes', 'academy'), icon: 'icon-edd.svg', left: 946, top: 556, width: 277 },
];

// Scales the fixed stage to the column width, like the hero orbit.
const useStageScale = () => {
	const ref = useRef(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || !('ResizeObserver' in window)) {
			return undefined;
		}
		const ro = new window.ResizeObserver(([entry]) => {
			const scale = Math.min(1, entry.contentRect.width / STAGE_W);
			el.style.setProperty('--awn-int-scale', scale.toFixed(4));
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	return ref;
};

const Integrations = () => {
	const ref = useStageScale();

	return (
		<section
			id="awn-integrations"
			className="awn-section awn-int"
			aria-labelledby="awn-integrations-title"
		>
			<div className="awn-int__fit" ref={ref}>
				<div className="awn-int__stage">
					<header className="awn-int__head">
						<span className="awn-int__eyebrow">
							<span>
								<img src={asset('eyebrow-sparkle.svg')} alt="" width="22" height="22" />
								<b>{__('Integration', 'academy')}</b>
							</span>
						</span>
						<h2 className="awn-int__title" id="awn-integrations-title">
							{__('Plays nicely with the tools you run', 'academy')}
						</h2>
						<p className="awn-int__desc">
							{__(
								'New connections across the Kodezen family, and fixes for popular plugins. Social Login now lives in GemSecurity.',
								'academy'
							)}
						</p>
					</header>

					<img
						className="awn-int__lines"
						src={asset('lines.svg')}
						alt=""
						width="1200"
						height="556"
						aria-hidden="true"
					/>
					<span className="awn-int__hub" aria-hidden="true">
						<img src={asset('hub-cap.svg')} alt="" width="61" height="56" />
					</span>

					<ul className="awn-int__nodes">
						{NODES.map((n) => (
							<li
								key={n.name}
								className={`awn-int__node awn-int__node--${n.side}`}
								style={{ left: n.left, top: n.top, width: n.width }}
							>
								<span className="awn-int__icon">
									<img src={asset(n.icon)} alt="" width="18" height="18" />
								</span>
								<span className="awn-int__text">
									<b>{n.name}</b>
									<small>{n.body}</small>
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
};

export default Integrations;
