import React, { createContext, useContext, useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import Icon from './Icons';

/*
 * About page images live in github.com/imrantushar/kodezen-assets under
 * images/academy/, so they don't ship inside the plugin zip. They load from
 * raw.githubusercontent.com, the direct-file form of that folder: a
 * github.com/.../tree/... URL is an HTML page, not an image, and jsDelivr
 * refuses this repo because it is over its 50 MB package limit.
 * A Shot with a `file` renders the image in a browser frame; a Shot with
 * `todo` renders a dashed placeholder that names the file still to capture.
 */
const ASSET_BASE =
	'https://raw.githubusercontent.com/imrantushar/kodezen-assets/master/images/academy/';

export const shotUrl = (file) => `${ASSET_BASE}${file}`;

const ZoomContext = createContext(() => {});

export const ZoomProvider = ({ children }) => {
	const [zoom, setZoom] = useState(null);

	useEffect(() => {
		if (!zoom) {
			return undefined;
		}
		const onKey = (e) => e.key === 'Escape' && setZoom(null);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [zoom]);

	return (
		<ZoomContext.Provider value={setZoom}>
			{children}
			{zoom ? (
				<div
					className="awn-zoom"
					role="dialog"
					aria-modal="true"
					aria-label={zoom.alt}
					onClick={() => setZoom(null)}
				>
					<button
						type="button"
						className="awn-zoom__close"
						aria-label={__('Close', 'academy')}
						onClick={() => setZoom(null)}
					>
						<Icon name="close" size={20} />
					</button>
					<img src={zoom.src} alt={zoom.alt} />
				</div>
			) : null}
		</ZoomContext.Provider>
	);
};

export const Placeholder = ({ todo, ratio = '16 / 10' }) => (
	<div className="awn-todo" style={{ aspectRatio: ratio }}>
		<span className="awn-todo__icon">
			<Icon name="camera" size={22} />
		</span>
		<b>{__('Screenshot needed', 'academy')}</b>
		<code>{todo.file}</code>
		<p>{todo.note}</p>
	</div>
);

export const Shot = ({ file, alt, url, todo, ratio, className = '' }) => {
	const setZoom = useContext(ZoomContext);

	return (
		<figure className={`awn-shot ${className}`}>
			<div className="awn-shot__bar" aria-hidden="true">
				<i />
				<i />
				<i />
				{url ? <span>{url}</span> : null}
			</div>
			{file ? (
				<button
					type="button"
					className="awn-shot__img"
					onClick={() => setZoom({ src: shotUrl(file), alt })}
					aria-label={`${alt}. ${__('Open larger', 'academy')}`}
				>
					<img src={shotUrl(file)} alt={alt} loading="lazy" decoding="async" />
					<span className="awn-shot__zoom" aria-hidden="true">
						<Icon name="zoom" size={16} />
					</span>
				</button>
			) : (
				<Placeholder todo={todo} ratio={ratio} />
			)}
		</figure>
	);
};

/* Before / after slider over two screenshots of the same screen. */
export const CompareShots = ({ left, right, label, leftIcon = 'sun', rightIcon = 'moon' }) => {
	const [pos, setPos] = useState(50);

	return (
		<div className="awn-compare">
			<div className="awn-compare__stage">
				<img src={shotUrl(left.file)} alt={left.alt} loading="lazy" />
				<div
					className="awn-compare__dark"
					style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
				>
					<img src={shotUrl(right.file)} alt={right.alt} loading="lazy" />
				</div>
				<input
					className="awn-compare__range"
					type="range"
					min="0"
					max="100"
					value={pos}
					onChange={(e) => setPos(Number(e.target.value))}
					aria-label={label}
				/>
				<span
					className="awn-compare__handle"
					style={{ left: `${pos}%` }}
					aria-hidden="true"
				>
					<span className="awn-compare__knob">
						<Icon name={leftIcon} size={13} />
						<Icon name={rightIcon} size={13} />
					</span>
				</span>
			</div>
		</div>
	);
};

/*
 * One screenshot at a time in a white frame, with round prev/next buttons on
 * the edges and dots below (the design's showcase for Customize and
 * Certificates). Each slide is a Shot's props plus an optional caption.
 */
export const Carousel = ({ label, slides, autoPlay = 0 }) => {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const count = slides.length;
	const go = (n) => setIndex((n + count) % count);
	const slide = slides[index];

	// `autoPlay` is the delay in ms. It pauses while the pointer or keyboard
	// focus is inside, and never runs for people who prefer reduced motion.
	useEffect(() => {
		const reduce =
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!autoPlay || paused || reduce || count < 2) {
			return undefined;
		}
		const timer = window.setTimeout(
			() => setIndex((i) => (i + 1) % count),
			autoPlay
		);
		return () => window.clearTimeout(timer);
	}, [autoPlay, paused, index, count]);

	return (
		<div
			className="awn-carousel"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			role="region"
			aria-roledescription="carousel"
			aria-label={label}
		>
			<div className="awn-carousel__frame">
				<button
					type="button"
					className="awn-carousel__arrow awn-carousel__arrow--prev"
					onClick={() => go(index - 1)}
					aria-label={__('Previous screenshot', 'academy')}
				>
					<Icon name="chevronDown" size={18} />
				</button>
				<div
					className="awn-carousel__slide"
					/* Only announce slides the viewer moved to, not each automatic change. */
					aria-live={autoPlay && !paused ? 'off' : 'polite'}
					aria-label={`${index + 1} / ${count}`}
					key={index}
				>
					<Shot {...slide} />
				</div>
				<button
					type="button"
					className="awn-carousel__arrow awn-carousel__arrow--next"
					onClick={() => go(index + 1)}
					aria-label={__('Next screenshot', 'academy')}
				>
					<Icon name="chevronDown" size={18} />
				</button>
			</div>
			{slide.caption ? (
				<p className="awn-carousel__caption">
					<b>{slide.caption.title}</b> {slide.caption.body}
				</p>
			) : null}
			<div className="awn-carousel__dots">
				{slides.map((s, i) => (
					<button
						type="button"
						key={s.file || s.todo?.file}
						className={i === index ? 'is-active' : ''}
						onClick={() => go(i)}
						aria-label={`${i + 1} / ${count}`}
						aria-current={i === index ? 'true' : undefined}
					/>
				))}
			</div>
		</div>
	);
};
