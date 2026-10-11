import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { API, plugin_root_url, runUploader } from '@Utils/helper';
import Button from '@Components/Button';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';
import UploadDropzone, { DropzonePreview } from '@Components/UploadImage/Dropzone';

import './styles.scss';

const propTypes = {
	name: PropTypes.string,
	value: PropTypes.number,
	saveValueHandler: PropTypes.func,
	imageSize: PropTypes.string,
	supportedFile: PropTypes.string,
	vertical: PropTypes.bool,
	variant: PropTypes.oneOf(['default', 'dropzone']),
	compact: PropTypes.bool,
};

export default function Attachment({
	name = '',
	value = 0,
	saveValueHandler = () => {},
	imageSize = '700x430 pixels',
	supportedFile = '.jpg, .jpeg, .gif, .png, .pdf, or .docx',
	// Stacks the preview above the info/button for narrow containers (sidebar).
	vertical = false,
	// `dropzone`: the upload card shared with the category and featured
	// images (UploadImage/Dropzone.js). An image then shows in the card with
	// Replace / Remove on hover; any other file is a row with its name.
	variant = 'default',
	// With `dropzone`: the smaller card for sidebars (Dropzone.js).
	compact = false,
}) {
	const [attachment, setAttachment] = useState({});
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		if (value) {
			setLoading(true);
			API.get(`wp/v2/media/${value}`).then((res) => {
				const sourceURLArray = res.data?.source_url?.split('.');
				setAttachment({
					url: res.data?.source_url,
					media_type: res.data?.media_type,
					title: res.data?.slug + '.' + sourceURLArray[1],
				});
				setLoading(false);
			});
		}
	}, [value]);

	const attachmentUploadHandler = (event) => {
		event.preventDefault();
		runUploader({
			library: {
				type: 'application/pdf',
			},
			uploader: {
				type: 'application/pdf',
			},
		}).then((res) => {
			setAttachment({
				url: res?.url,
				media_type: res?.type,
				title: res?.filename,
			});
			saveValueHandler(name, res.id);
		});
	};

	const removeAttachment = () => {
		saveValueHandler(name, 0);
		setAttachment({});
	};

	const defaultImageURL =
		plugin_root_url + 'assets/images/primary-upload.svg';
	let uploadedAttachment = attachment.url;

	if (
		attachment?.media_type === 'file' ||
		attachment?.media_type === 'application'
	) {
		uploadedAttachment = plugin_root_url + 'assets/images/importFile.svg';
	}

	const getAttachmentClass = () => {
		const fileExtension = attachment?.title?.split('.').pop();
		if (fileExtension === 'pdf' || fileExtension === 'docx') {
			return 'academy-upload-attachment--left__uploaded__small';
		}
		return 'academy-upload-attachment--left__uploaded__large';
	};

	if ('dropzone' === variant) {
		const hasAttachment = Object.keys(attachment).length > 0;
		const isImage =
			'image' === attachment?.media_type ||
			/^image\//.test(attachment?.media_type || '');
		let content;
		if (isLoading) {
			content = <Preloader />;
		} else if (!hasAttachment) {
			content = (
				<UploadDropzone
					supportedFile={supportedFile}
					imageSize={imageSize}
					onUpload={attachmentUploadHandler}
					compact={compact}
				/>
			);
		} else if (isImage) {
			content = (
				<DropzonePreview
					src={attachment.url}
					onReplace={attachmentUploadHandler}
					onRemove={removeAttachment}
					compact={compact}
				/>
			);
		} else {
			content = (
				<div className="academy-upload-dropzone__file">
					<span
						className="academy-upload-dropzone__file-name"
						title={attachment.title}
					>
						{attachment.title}
					</span>
					<Button
						type="button"
						preset="light-purple"
						size="sm"
						onClick={attachmentUploadHandler}
						label={__('Replace', 'academy')}
					/>
					<button
						type="button"
						className="academy-upload-dropzone__file-remove"
						onClick={removeAttachment}
						aria-label={__('Remove', 'academy')}
					>
						<span className="academy-icon academy-icon--delete" />
					</button>
				</div>
			);
		}
		return <div className="academy-upload-dropzone">{content}</div>;
	}

	return (
		<React.Fragment>
			<div
				className={`academy-upload-attachment${
					vertical ? ' academy-upload-attachment--vertical' : ''
				}`}
			>
				<div className="academy-upload-attachment--left">
					{isLoading ? (
						<Preloader />
					) : (
						<>
							{uploadedAttachment ? (
								<div className={getAttachmentClass()}>
									<img
										src={uploadedAttachment}
										alt="image"
										aria-hidden="true"
									/>
								</div>
							) : (
								<div className="academy-upload-attachment--left__linear">
									<div className="academy-upload-attachment--left__linear--img">
										<img
											src={defaultImageURL}
											alt="image"
											aria-hidden="true"
										/>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				<div className="academy-upload-attachment--right">
					<div className="academy-upload-attachment--right--items">
						{attachment?.title ? (
							<h3
								className="academy-title"
								dangerouslySetInnerHTML={{
									__html: attachment.title,
								}}
							></h3>
						) : (
							<p className="academy-upload-label">
								<strong>
									{__('File Support:', 'academy')}
								</strong>{' '}
								{supportedFile}
							</p>
						)}
						<p className="academy-upload-label">
							<strong>{__('Size:', 'academy')}</strong>{' '}
							{imageSize}
						</p>
						<Button
							type="button"
							onClick={attachmentUploadHandler}
							label={
								Object.keys(attachment).length > 0
									? __('Replace Attachment', 'academy')
									: __('Upload Attachment', 'academy')
							}
							size="sm"
							preset="light-purple"
							icon={
								<span className="academy-icon academy-icon--upload" />
							}
						/>
					</div>

					{uploadedAttachment && (
						<Button
							onClick={removeAttachment}
							type="button"
							icon={
								<span className="academy-icon academy-icon--delete" />
							}
							className="academy-btn-delete"
						/>
					)}
				</div>
			</div>
		</React.Fragment>
	);
}

Attachment.propTypes = propTypes;
