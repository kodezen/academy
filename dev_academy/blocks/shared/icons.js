import { SVG, Path, Circle } from '@wordpress/primitives';

const stroke = {
	xmlns: 'http://www.w3.org/2000/svg',
	viewBox: '0 0 24 24',
	width: '1em',
	height: '1em',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	'aria-hidden': true,
	focusable: false,
	className: 'academy-course-meta__icon',
};

/** Icons matching Academy\Blocks\CourseData::icon(). */
export const metaIcons = {
	lessons: (
		<SVG { ...stroke }>
			<Path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
		</SVG>
	),
	duration: (
		<SVG { ...stroke }>
			<Circle cx="12" cy="12" r="9" />
			<Path d="M12 7v5l3 2" />
		</SVG>
	),
	level: (
		<SVG { ...stroke }>
			<Path d="M6 20v-6M12 20V9M18 20V4" />
		</SVG>
	),
	enrolled: (
		<SVG { ...stroke }>
			<Path d="M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
			<Circle cx="9" cy="8" r="3.5" />
			<Path d="M22 20v-1a4 4 0 0 0-3-3.87M16 4.13a3.5 3.5 0 0 1 0 6.75" />
		</SVG>
	),
};
