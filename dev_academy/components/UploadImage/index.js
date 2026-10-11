import React, { useEffect, useState } from 'react';
import { API, runUploader, plugin_root_url } from '@Utils/helper';
import Button from '@Components/Button';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import UploadDropzone, { DropzonePreview } from './Dropzone';
import './styles.scss';

const propTypes = {
	name: PropTypes.string,
	label: PropTypes.string,
	value: PropTypes.number,
	saveValueHandler: PropTypes.func,
	imageSize: PropTypes.string,
	supportedFile: PropTypes.string,
	variant: PropTypes.oneOf(['default', 'dropzone']),
	compact: PropTypes.bool,
};

export default function UploadImage(props) {
	const {
		name = '',
		value = 0,
		label = __('Upload Image', 'academy'),
		saveValueHandler = () => {},
		imageSize = '700x430 pixels',
		supportedFile = '.jpg, .jpeg, .gif, .png',
		// `dropzone`: a full-width upload card that turns into the image
		// itself once one is picked, with Replace / Remove on hover (Figma
		// node 13955:15184, the category image). `default` is the older
		// thumbnail-plus-details row the lesson and quiz forms use.
		variant = 'default',
		// With `dropzone`: the smaller card for sidebars (Dropzone.js).
		compact = false,
	} = props;

	const [attachment, setAttachment] = useState({});
	const [fileType, setFileType] = useState('');
	const [fileName, setFileName] = useState('');

	const uploadedAttachment = plugin_root_url + 'assets/images/importFile.svg';

	useEffect(() => {
		if (value) {
			API.get(`wp/v2/media/${value}`).then((res) => {
				setAttachment({ url: res.data.source_url });
				setFileType(res.data.mime_type);
				setFileName(
					(res.data.source_url || '').split('/').pop() || ''
				);
			});
		} else {
			setAttachment({});
			setFileType('');
			setFileName('');
		}
	}, [value]);

	const uploadImageHandler = (e) => {
		e.preventDefault();
		runUploader().then((res) => {
			saveValueHandler(name, res.id);
			setAttachment(res);
			setFileType(res.mime_type);
			setFileName(res.filename || (res.url || '').split('/').pop() || '');
		});
	};

	const removeFeaturedImage = () => {
		saveValueHandler(name, 0);
		setAttachment({});
		setFileType('');
		setFileName('');
	};

	const attachmentUrl = () => {
		if (
			fileType === 'application/pdf' ||
			fileType === 'application/docs' ||
			fileType === 'application/zip'
		) {
			return `${uploadedAttachment}`;
		}
		return attachment.url;
	};

	const hasAttachment = Object.keys(attachment).length > 0;

	if ('dropzone' === variant) {
		// A picked file that is not an image (PDF, ZIP, DOCX): its name,
		// Replace and a delete icon, like Attachment's dropzone.
		if (hasAttachment && fileType && !/^image\//.test(fileType)) {
			return (
				<div className="academy-upload-dropzone">
					<div className="academy-upload-dropzone__file">
						<span
							className="academy-upload-dropzone__file-name"
							title={fileName}
						>
							{fileName}
						</span>
						<Button
							type="button"
							preset="light-purple"
							size="sm"
							onClick={(e) => uploadImageHandler(e)}
							label={__('Replace', 'academy')}
						/>
						<button
							type="button"
							className="academy-upload-dropzone__file-remove"
							onClick={removeFeaturedImage}
							aria-label={__('Remove', 'academy')}
						>
							<span className="academy-icon academy-icon--delete" />
						</button>
					</div>
				</div>
			);
		}
		return (
			<div className="academy-upload-dropzone">
				{hasAttachment ? (
					<DropzonePreview
						src={attachmentUrl()}
						onReplace={(e) => uploadImageHandler(e)}
						onRemove={removeFeaturedImage}
						compact={compact}
					/>
				) : (
					<UploadDropzone
						supportedFile={supportedFile}
						imageSize={imageSize}
						onUpload={(e) => uploadImageHandler(e)}
						compact={compact}
					/>
				)}
			</div>
		);
	}

	return (
		<React.Fragment>
			<div className="academy-upload-image">
				<div className="academy-upload-image-container">
					<div className="academy-upload-image-container--wrap">
						{Object.keys(attachment).length === 0 ? (
							<div className="academy-upload-image-container--wrap--img">
								<div className="academy-upload-image-container--wrap--img--linear">
									<span className="academy-icon academy-icon--image" />
								</div>
								<span className="academy-title">
									{__('Upload Image', 'academy')}
								</span>
							</div>
						) : (
							<>
								{Object.keys(attachment).length > 0 && (
									<div
										className="academy-upload-image-container--wrap--img--uploaded"
										style={{
											backgroundImage: `url(${attachmentUrl()})`,
											backgroundRepeat: 'no-repeat',
											backgroundSize: 'contain',
											backgroundPosition: 'center center',
										}}
									/>
								)}
							</>
						)}
					</div>

					<div className="academy-upload-image-container--details">
						<span className="academy-upload-image-container--details--label">
							{label}
						</span>
						<div className="academy-upload-image-container--details--info">
							<p className="academy-upload-image-container--details--info--support">
								<span>{__('File Support:', 'academy')}</span>{' '}
								{supportedFile}.
							</p>
							<p className="academy-upload-image-container--details--info--size">
								<span>
									{__('Recommended size:', 'academy')}
								</span>{' '}
								{imageSize}
							</p>
						</div>
						<Button
							type="button"
							onClick={(e) => uploadImageHandler(e)}
							preset="clear"
							size="sm"
							icon={
								<span className="academy-icon academy-icon--upload" />
							}
							label={
								Object.keys(attachment).length > 0
									? __('Change', 'academy')
									: __('Upload', 'academy')
							}
						/>
					</div>
				</div>

				{Object.keys(attachment).length > 0 && (
					<Button
						onClick={removeFeaturedImage}
						type="button"
						icon={
							<span className="academy-icon academy-icon--delete"></span>
						}
						className="academy-btn-delete"
						suffix="delete"
						preset="transparent"
					/>
				)}
			</div>
		</React.Fragment>
	);
}

UploadImage.propTypes = propTypes;
