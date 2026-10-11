/**
 * Certificate page settings.
 *
 * The editor's `certificate` mode owns the page: its canvas draws a fixed sheet
 * from the root's `pageSize`/`orientation` and paints `bgColor`/`bgImage`/
 * `bgSize` behind the content. The same attributes are the contract with the
 * server — AcademyCertificates\Render\Renderer reads them for the mPDF @page
 * and body shell — so this module exists only to name them in one place and to
 * translate Academy's create wizard into them.
 */
import { __ } from '@wordpress/i18n';

/**
 * Long/short edge in CSS pixels at 96dpi, matching the millimetre sizes
 * Renderer::PAGE_SIZES hands to mPDF (A4 297×210mm, Letter 279.4×215.9mm).
 * Keep this list in sync with that constant — a size the server cannot set
 * silently falls back to A4 in the PDF.
 */
export const PAGE_SIZES = {
	A4: { label: 'A4 — 297 × 210 mm', long: 1123, short: 794 },
	Letter: { label: 'Letter — 11 × 8.5 in', long: 1056, short: 816 },
};

export const DEFAULT_PAGE_CONFIG = {
	pageSize: 'A4',
	orientation: 'landscape',
	fontFamily: 'Poppins',
	bgColor: '#FFFFFF',
	bgImage: '',
	bgSize: 'cover',
};

/** Matches the editor's `bgSize` options and Renderer's mPDF resize mapping. */
export const bgSizeOptions = () => [
	{ value: 'cover', label: __('Cover — fill the page', 'academy') },
	{ value: 'contain', label: __('Contain — fit inside', 'academy') },
	{ value: 'stretch', label: __('Stretch to the page', 'academy') },
];

export const pageSizeOptions = () =>
	Object.entries(PAGE_SIZES).map(([value, size]) => ({
		value,
		label: size.label,
	}));

export const orientationOptions = () => [
	{ value: 'landscape', label: __('Landscape', 'academy') },
	{ value: 'portrait', label: __('Portrait', 'academy') },
];

export const isLandscape = (config) =>
	(config?.orientation ?? DEFAULT_PAGE_CONFIG.orientation) !== 'portrait';

/**
 * Page box in CSS pixels — drives both the canvas frame and its thumbnails.
 */
export const pageMetrics = (config) => {
	const size = PAGE_SIZES[config?.pageSize] || PAGE_SIZES.A4;
	const landscape = isLandscape(config);
	return {
		width: landscape ? size.long : size.short,
		height: landscape ? size.short : size.long,
	};
};

/**
 * Inset the content so it sits inside a decorative background's border.
 * Portrait pages get a taller, narrower frame than landscape ones.
 */
const contentPadding = (landscape) =>
	landscape ? [64, 96, 64, 96] : [80, 72, 80, 72];

/**
 * Page config → `certificate` tree root attributes.
 *
 * Every one of these is a real attribute of the editor's certificate root, so
 * the create wizard, the Page Setup panel and the editor's own settings panel
 * all write the same fields, and the renderer reads them back unchanged.
 */
export const rootAttributes = (config) => {
	const merged = { ...DEFAULT_PAGE_CONFIG, ...config };
	const landscape = isLandscape(merged);

	return {
		pageSize: merged.pageSize,
		orientation: landscape ? 'landscape' : 'portrait',
		fontFamily: merged.fontFamily,
		bgColor: merged.bgColor,
		bgImage: merged.bgImage || '',
		bgSize: merged.bgSize || 'cover',
		contentBg: 'transparent',
		padding: contentPadding(landscape),
	};
};

/** Do two page configs describe the same page? */
export const samePageConfig = (a, b) =>
	!!a &&
	!!b &&
	a.pageSize === b.pageSize &&
	a.orientation === b.orientation &&
	a.fontFamily === b.fontFamily &&
	a.bgColor === b.bgColor &&
	a.bgImage === b.bgImage &&
	a.bgSize === b.bgSize;

/**
 * Read a saved design's root attributes back into a page config.
 */
export const configFromRoot = (attributes) => {
	if (!attributes || typeof attributes !== 'object') {
		return { ...DEFAULT_PAGE_CONFIG };
	}
	return {
		pageSize: PAGE_SIZES[attributes.pageSize]
			? attributes.pageSize
			: DEFAULT_PAGE_CONFIG.pageSize,
		orientation:
			attributes.orientation === 'portrait' ? 'portrait' : 'landscape',
		fontFamily: attributes.fontFamily || DEFAULT_PAGE_CONFIG.fontFamily,
		bgColor: attributes.bgColor || DEFAULT_PAGE_CONFIG.bgColor,
		bgImage: attributes.bgImage || '',
		bgSize: attributes.bgSize || DEFAULT_PAGE_CONFIG.bgSize,
	};
};

/** Bundled background designs, as localized by AcademyCertificates\Assets. */
export const getPresets = () =>
	window.AcademyGlobal?.certificates?.presets ?? [];

/**
 * The fonts the PDF can actually embed (AcademyCertificates\Assets::BUILDER_FONTS).
 * Falls back to the default so the control is never empty on an install that
 * predates the localized list.
 */
export const getFonts = () => {
	const fonts = window.AcademyGlobal?.certificates?.fonts;
	return Array.isArray(fonts) && fonts.length
		? fonts
		: [DEFAULT_PAGE_CONFIG.fontFamily];
};

/**
 * True when the font's TTF is not downloaded yet, so the canvas would fall
 * back to a plain serif. Unknown list (older install) counts as available.
 */
export const isFontMissing = (font) => {
	const available = window.AcademyGlobal?.certificates?.fonts_available;
	return Array.isArray(available) && !available.includes(font);
};

/**
 * The editor's certificate root. Its manifest swaps the email root for this
 * one, adds a QR block and hides the print-meaningless blocks (video, timer).
 */
export const ROOT_TYPE = 'certificate';

/**
 * Bring a tree up to the current contract before it reaches the editor or the
 * server. Designs written while the builder was borrowing the email root (or
 * by any earlier shape) adopt the certificate root the first time they open.
 *
 * `version: 3` (canvas) trees have their own root type (`certificate-canvas`)
 * and contract entirely — this migration predates that format and must never
 * touch it, or it would silently rewrite a canvas tree's root type to the
 * flow builder's and break rendering.
 */
export const normalizeTree = (tree) => {
	if (!tree?.root) {
		return tree;
	}
	if (tree.version === 3) {
		return tree;
	}
	if (tree.root.type === ROOT_TYPE) {
		return tree;
	}
	return { ...tree, root: { ...tree.root, type: ROOT_TYPE } };
};

export default rootAttributes;
