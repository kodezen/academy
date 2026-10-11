/**
 * The tree a new certificate opens with.
 *
 * The page itself — size, orientation, background — comes from the create
 * wizard's page setup and is written onto the root by `rootAttributes`. This
 * module only decides what sits *on* that page: a centered starter layout
 * (title, recipient, course, date) inset within the background's border, or
 * nothing at all when the author asked for a blank page.
 */
import { ROOT_TYPE, rootAttributes } from './pageSetup';

const nid = () => 'n_' + Math.random().toString(36).slice(2, 10);

const node = (type, attributes, children = []) => ({
	id: nid(),
	type,
	attributes,
	children,
});

/** The default centered starter blocks. */
const starterChildren = () => [
	node('heading', {
		text: 'Certificate of Completion',
		tag: 'h1',
		alignment: 'center',
		typography: {
			fontFamily: 'inherit',
			fontSize: 34,
			fontWeight: '700',
			lineHeight: 1.2,
			color: '#1F2937',
		},
	}),
	node('text', {
		text: 'This is proudly presented to',
		alignment: 'center',
		typography: {
			fontFamily: 'inherit',
			fontSize: 15,
			lineHeight: 1.5,
			color: '#6B7280',
		},
	}),
	node('heading', {
		text: '{{learner}}',
		tag: 'h2',
		alignment: 'center',
		typography: {
			fontFamily: 'inherit',
			fontSize: 30,
			fontWeight: '700',
			lineHeight: 1.3,
			color: '#111827',
		},
	}),
	node('divider', {
		color: '#C9A24B',
		thickness: 2,
		width: 30,
		alignment: 'center',
		padding: [12, 0, 16, 0],
	}),
	node('text', {
		text: 'for completing {{course_title}}',
		alignment: 'center',
		typography: {
			fontFamily: 'inherit',
			fontSize: 14,
			lineHeight: 1.5,
			color: '#6B7280',
		},
	}),
	node('spacer', { height: 14 }),
	node('text', {
		text: '{{completion_date}}',
		alignment: 'center',
		typography: {
			fontFamily: 'inherit',
			fontSize: 13,
			fontWeight: '600',
			lineHeight: 1.5,
			color: '#374151',
		},
	}),
];

/**
 * @param {Object}  pageConfig  Page setup from the create wizard.
 * @param {boolean} withStarter false for a blank page — an empty, correctly
 *                              sized page rather than the editor's own
 *                              email defaults.
 * @return {Object} certificate tree.
 */
export const buildInitialTree = (pageConfig, withStarter = true) => ({
	version: 2,
	root: {
		id: 'root',
		type: ROOT_TYPE,
		attributes: rootAttributes(pageConfig),
		children: withStarter ? starterChildren() : [],
	},
});

export default buildInitialTree;
