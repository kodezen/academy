import { admin_url, getFieldName } from '@Utils/helper';
import { __ } from '@wordpress/i18n';

export const uploadBase64ImageToMediaLibrary = async (
	base64Data,
	filename,
	setFieldValue
) => {
	// Step 1: Convert base64 to a File object
	const { file, fileType } = base64ToBinary(base64Data);
	const newFileName = getFieldName(filename);

	// Step 2: Create a FormData and upload file via REST API
	const formData = new FormData();
	formData.append('name', `${newFileName}.${fileType}`);
	formData.append('action', 'upload-attachment');
	formData.append(
		'_wpnonce',
		_wpPluploadSettings.defaults.multipart_params._wpnonce
	);
	formData.append('async-upload', file, `${newFileName}.${fileType}`);

	const uploadedMedia = await fetch(`${admin_url}async-upload.php`, {
		method: 'POST',
		headers: {
			'X-WP-Nonce':
				_wpPluploadSettings.defaults.multipart_params._wpnonce,
		},
		body: formData,
	}).then((res) => res.json());

	// Step 3: Open the Media Library and pre-select the uploaded file
	const frame = wp.media({
		title: __('Use Uploaded Media', 'academy'),
		button: {
			text: __('Use this media', 'academy'),
		},
		library: {
			type: 'image',
		},
		multiple: false,
	});

	frame.on('open', () => {
		const selection = frame.state().get('selection');
		const attachment = wp.media.attachment(uploadedMedia.data.id);
		attachment.fetch();
		selection.add(attachment);
	});

	frame.on('select', function () {
		const selected = frame.state().get('selection').first().toJSON();
		setFieldValue('featured_media', selected.id);
	});

	frame.open();
};

const parseBase64 = (base64) => {
	const info = base64.match(/^data:(.+?);base64,(.+)/);
	const mimeType = info[1];
	const data = atob(info[2].replace(' ', '+'));
	return { mimeType, data };
};
export function base64ToPngFile(base64Data, filename = 'image.png') {
	const arr = base64Data.split(',');
	const mime = arr[0].match(/:(.*?);/)[1]; // "image/png"
	const bstr = atob(arr[1]); // binary string
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type: mime });
}

const convertToByteArray = (data) => {
	const byteArray = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		byteArray[i] = data.charCodeAt(i);
	}
	return byteArray;
};

const base64ToBinary = (base64) => {
	const { mimeType, data } = parseBase64(base64);
	const byteArray = convertToByteArray(data);
	return {
		file: new Blob([byteArray], { type: mimeType }),
		fileType: mimeType.split('/')[1],
	};
};
