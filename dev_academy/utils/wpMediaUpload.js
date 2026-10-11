import { __ } from '@wordpress/i18n';

/**
 * `mediaUpload` implementation for @kodezen/editor's image pickers, backed by
 * the real WP media library instead of the package's built-in fallback.
 *
 * Without a `mediaUpload` prop, @kodezen/editor's editors resolve every
 * picked image through `FileReader.readAsDataURL()`, saving it as a base64
 * `data:` URI. That looks fine in the browser, but breaks anywhere the saved
 * content is later processed server-side and expects a real URL — e.g. the
 * certificate PDF renderer's `esc_url()` call, which strips the `data:`
 * scheme and silently empties the field. Resolving through `wp.media`
 * instead always yields a real attachment URL.
 *
 * @param {Object}   [options]              Options.
 * @param {string[]} [options.allowedTypes] WP media types to restrict the picker to.
 * @return {Promise<{url: string, width: number, height: number}>} The selected attachment.
 */
export const wpMediaUpload = ({ allowedTypes } = {}) =>
	new Promise((resolve, reject) => {
		if (!window.wp?.media) {
			reject(new Error('Media library unavailable.'));
			return;
		}
		const frame = window.wp.media({
			title: __('Select or Upload Media', 'academy'),
			button: { text: __('Use this media', 'academy') },
			multiple: false,
			library: allowedTypes?.length ? { type: allowedTypes } : undefined,
		});
		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			resolve({
				url: attachment.url,
				width: attachment.width,
				height: attachment.height,
			});
		});
		frame.open();
	});

export default wpMediaUpload;
