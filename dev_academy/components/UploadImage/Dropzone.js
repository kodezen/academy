import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import { plugin_root_url } from '@Utils/helper';

import './dropzone.scss';

const propTypes = {
	supportedFile: PropTypes.string,
	imageSize: PropTypes.string,
	label: PropTypes.string,
	onUpload: PropTypes.func,
	compact: PropTypes.bool,
	hint: PropTypes.string,
};

/**
 * The upload card (Figma node 13955:15184): icon, what can be uploaded and
 * at what size, and an Upload button. Shared by the category image
 * (`UploadImage variant="dropzone"`) and the course attachments
 * (`MultiUploader`).
 */
export default function UploadDropzone({
	supportedFile = '',
	imageSize = '',
	label = __('Upload', 'academy'),
	onUpload = () => {},
	// `compact`: a light dashed box that is itself the upload button, for
	// narrow sidebars where the full card and its Upload button crowd in.
	compact = false,
	// Compact card's secondary line; defaults to the Media Library wording.
	hint = '',
}) {
	if (compact) {
		return (
			<button
				type="button"
				className="academy-upload-dropzone__compact"
				onClick={onUpload}
			>
				<span className="academy-upload-dropzone__compact-icon" aria-hidden="true">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 16V4M7 9l5-5 5 5" />
						<path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
					</svg>
				</span>
				<span className="academy-upload-dropzone__compact-text">
					<strong>{__('Click to upload', 'academy')}</strong>{' '}
					{hint || __('or choose from Media Library', 'academy')}
				</span>
				{(supportedFile || imageSize) && (
					<span className="academy-upload-dropzone__compact-meta">
						{[supportedFile, imageSize].filter(Boolean).join(' · ')}
					</span>
				)}
			</button>
		);
	}

	return (
		<div className="academy-upload-dropzone__empty">
			<span className="academy-upload-dropzone__icon">
				<img
					src={`${plugin_root_url}assets/images/primary-upload.svg`}
					width="20"
					height="20"
					alt=""
				/>
			</span>
			<div className="academy-upload-dropzone__body">
				<p className="academy-upload-dropzone__meta">
					{supportedFile && <span>{supportedFile}</span>}
					{imageSize && (
						<span className="academy-upload-dropzone__meta-size">
							{supportedFile && (
								<img
									src={`${plugin_root_url}assets/images/upload-meta-dot.svg`}
									width="20"
									height="20"
									alt=""
								/>
							)}
							{imageSize}
						</span>
					)}
				</p>
				<Button
					type="button"
					preset="purple"
					suffix="dropzone-upload"
					onClick={onUpload}
					label={label}
				/>
			</div>
		</div>
	);
}

UploadDropzone.propTypes = propTypes;

/**
 * A picked image filling the same box as the upload card, with Replace and
 * Remove over it on hover (or keyboard focus).
 */
export function DropzonePreview({ src = '', onReplace = () => {}, onRemove = () => {}, compact = false }) {
	return (
		<div className={`academy-upload-dropzone__preview${compact ? ' is-compact' : ''}`}>
			<img src={src} alt="" />
			<div className="academy-upload-dropzone__actions">
				<Button
					type="button"
					preset="purple"
					suffix="dropzone-replace"
					onClick={onReplace}
					label={__('Replace', 'academy')}
				/>
				<Button
					type="button"
					preset="transparent"
					suffix="dropzone-remove"
					onClick={onRemove}
					label={__('Remove', 'academy')}
				/>
			</div>
		</div>
	);
}

DropzonePreview.propTypes = {
	src: PropTypes.string,
	onReplace: PropTypes.func,
	onRemove: PropTypes.func,
	compact: PropTypes.bool,
};
