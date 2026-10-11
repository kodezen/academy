import { __ } from '@wordpress/i18n';

/**
 * The lesson's subtitle file as KodezenPlayer caption tracks. A lesson has at
 * most one `.vtt`, shown as soon as it loads — the learner can turn it off with
 * the player's CC button. Shared by the SPA and PHP-rendered learn pages.
 *
 * @param {string} url WebVTT file URL ('' for none).
 * @return {Array|undefined} Tracks, or undefined when there's no file.
 */
export default function subtitleTracks(url) {
	if (!url) {
		return undefined;
	}
	return [
		{
			src: url,
			label: __('Subtitles', 'academy'),
			srclang: document.documentElement.lang || undefined,
			default: true,
		},
	];
}
