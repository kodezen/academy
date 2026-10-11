import React from 'react';
import { useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import Video from '@Components/Video';
import WarningNoticeV2 from '@Components/WarningNotice/WarningNoticeV2';

// How far each video source plays in the Academy lesson player, which is what
// shows the subtitle file as captions. Everything else (Shortcode, Gumlet,
// other players' embeds) plays outside it, where captions can't be drawn.
const subtitleSupport = (type, serverLearnPage) => {
	if (['youtube', 'vimeo', 'html5'].includes(type)) {
		return 'full';
	}
	if (type === 'external') {
		return 'partial';
	}
	// The PHP and block learn pages keep embed codes in a plain iframe.
	if (type === 'embedded' && !serverLearnPage) {
		return 'partial';
	}
	return 'none';
};

/**
 * The lesson's .vtt subtitle upload and a notice of which video sources can
 * show subtitles. Rendered only for a source that can; for any other source
 * (Shortcode, Gumlet, …) nothing is shown. An attached file is always used.
 *
 * @param {Object}   props
 * @param {Object}   props.values           Lesson meta values.
 * @param {Function} props.saveValueHandler Formik setFieldValue.
 */
export default function LessonSubtitles({ values, saveValueHandler }) {
	const settings = useSelector((state) => state.settings?.data);
	// Which learn page renders lessons decides what Embedded/External can do.
	// Settings aren't loaded everywhere the editor opens; the React learn page
	// (Academy's default) is assumed then.
	const serverLearnPage =
		settings?.learn_page_engine === 'blocks' ||
		!!settings?.is_enabled_lessons_php_render;
	const { type, subtitle } = values.video_source;
	const support = subtitleSupport(type, serverLearnPage);

	if (support === 'none') {
		return null;
	}

	let title = __('Subtitles work with this video source', 'academy');
	let lead = '';
	if (support === 'partial') {
		title = __('Subtitles work with some links only', 'academy');
		if (type === 'embedded') {
			lead = __(
				'Embedded: only YouTube or Vimeo embed code. Other embeds play in their own player, without subtitles.',
				'academy'
			);
		} else if (serverLearnPage) {
			lead = __(
				'External URL: only a direct video file link (.mp4, .webm, .m3u8). Other links play in their own player, without subtitles.',
				'academy'
			);
		} else {
			lead = __(
				'External URL: only a YouTube or Vimeo link, or a direct video file link (.mp4, .webm, .m3u8). Other links play in their own player, without subtitles.',
				'academy'
			);
		}
	}

	const supported = serverLearnPage
		? __(
				'YouTube, Vimeo, HTML 5 (mp4), and External URL with a direct video file link.',
				'academy'
			)
		: __(
				'YouTube, Vimeo, HTML 5 (mp4), External URL with a YouTube, Vimeo or direct video file link, and Embedded with YouTube or Vimeo embed code.',
				'academy'
			);
	const unsupported = serverLearnPage
		? __(
				'Embedded, Shortcode, Gumlet, Online, Offline, and External URL links to other players (e.g. Wistia).',
				'academy'
			)
		: __(
				'Shortcode, Gumlet, Online, Offline, and External URL or Embedded from other players (e.g. Wistia, Canva).',
				'academy'
			);

	return (
		<div className="flex flex-col gap-3 pt-1">
			<div className="min-w-0">
				<h3 className="m-0 text-sm font-medium text-academy-text">
					{__('Subtitles', 'academy')}
				</h3>
				<p className="m-0 mt-1 text-xs text-academy-gray-dark">
					{__(
						'Upload a WebVTT (.vtt) file to show as captions in the lesson player. Learners can turn them off with the CC button.',
						'academy'
					)}
				</p>
			</div>
			<Video
				name="meta.video_source.subtitle"
				value={subtitle}
				saveValueHandler={saveValueHandler}
				libraryType="text/vtt"
				allowedMime="text/vtt"
				invalidMessage={__(
					'Please choose a WebVTT (.vtt) subtitle file.',
					'academy'
				)}
			/>
			{/* The notice's message sits in a <span>, so its lines are block
			    spans rather than <p>s; !mb-0 drops its built-in bottom margin,
			    which this column's gap already spaces. */}
			<WarningNoticeV2
				className="!mb-0"
				message={
					<>
						<strong className="block font-semibold">{title}</strong>
						{lead && <span className="mt-1 block">{lead}</span>}
						<span className="mt-2 block">
							<strong className="font-semibold">
								{__('Supported:', 'academy')}
							</strong>{' '}
							{supported}
						</span>
						<span className="mt-1 block">
							<strong className="font-semibold">
								{__('Not supported:', 'academy')}
							</strong>{' '}
							{unsupported}
						</span>
					</>
				}
			/>
		</div>
	);
}
