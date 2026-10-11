import React, { useEffect, useState } from 'react';
import { API, runUploader, sliceString } from '@Utils/helper';
import UploadDropzone from '@Components/UploadImage/Dropzone';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';

import './multiuploader.scss';

export default function MultiUploader({
	name = '',
	value = 0,
	saveValueHandler = () => {},
	imageSize = '700x430 pixels',
	supportedFile = '.jpg, .jpeg, .gif, .png, .pdf, or .docx',
	multiple = false,
	multiSelect = false,
}) {
	const [attachments, setAttachments] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const isMultiple = multiple || multiSelect || Array.isArray(value);

	useEffect(() => {
		if (isMultiple && Array.isArray(value) && value.length > 0) {
			setLoading(true);
			Promise.all(
				value.map((id) =>
					API.get(`wp/v2/media/${id}`).then((res) => {
						const sourceURLArray = res.data?.source_url?.split('.');
						return {
							id,
							url: res.data?.source_url,
							media_type: res.data?.media_type,
							title: res.data?.slug + '.' + sourceURLArray[1],
						};
					})
				)
			).then((loadedAttachments) => {
				setAttachments(loadedAttachments);
				setLoading(false);
			});
		} else if (!isMultiple && value) {
			setLoading(true);
			API.get(`wp/v2/media/${value}`).then((res) => {
				const sourceURLArray = res.data?.source_url?.split('.');
				setAttachments([
					{
						id: value,
						url: res.data?.source_url,
						media_type: res.data?.media_type,
						title: res.data?.slug + '.' + sourceURLArray[1],
					},
				]);
				setLoading(false);
			});
		} else {
			setAttachments([]);
		}
	}, [value, isMultiple]);

	const attachmentUploadHandler = (event) => {
		event.preventDefault();
		const uploaderConfig = {
			library: {
				type: 'application/pdf',
			},
			uploader: {
				type: 'application/pdf',
			},
		};

		runUploader(uploaderConfig).then((res) => {
			if (isMultiple) {
				const newAttachments = Array.isArray(res) ? res : [res];
				const uploadedAttachments = newAttachments.map((item) => ({
					id: item.id,
					url: item?.url,
					media_type: item?.type,
					title: item?.filename,
				}));
				const updatedAttachments = [
					...attachments,
					...uploadedAttachments,
				];
				setAttachments(updatedAttachments);
				const ids = updatedAttachments.map((a) => a.id);
				// Use Formik's setFieldValue with dot notation
				saveValueHandler(name, ids);
			} else {
				const attachment = Array.isArray(res) ? res[0] : res;
				setAttachments([
					{
						id: attachment.id,
						url: attachment?.url,
						media_type: attachment?.type,
						title: attachment?.filename,
					},
				]);
				saveValueHandler(name, attachment.id);
			}
		});
	};

	const removeAttachment = (indexToRemove) => {
		if (isMultiple) {
			const updatedAttachments = attachments.filter(
				(_, index) => index !== indexToRemove
			);
			setAttachments(updatedAttachments);
			const ids = updatedAttachments.map((a) => a.id);
			saveValueHandler(name, ids);
		} else {
			saveValueHandler(name, 0);
			setAttachments([]);
		}
	};

	// The same upload card as the category image, with what was uploaded
	// listed below it.
	return (
		<div className="academy-upload-dropzone academy-multi-attachment">
			{isLoading ? (
				<Preloader />
			) : (
				<>
					<UploadDropzone
						supportedFile={supportedFile}
						imageSize={imageSize}
						label={
							attachments.length > 0
								? __('Upload another', 'academy')
								: __('Upload', 'academy')
						}
						onUpload={attachmentUploadHandler}
						compact
					/>

					{attachments.map((attachment, index) => (
						<div
							key={attachment.id || index}
							className="academy-multi-attachment__uploaded"
						>
							<h3
								className="academy-title"
								title={attachment.title}
								dangerouslySetInnerHTML={{
									__html: sliceString(
										attachment.title,
										25,
										'...'
									),
								}}
							></h3>
							<button
								onClick={() => removeAttachment(index)}
								type="button"
								className="academy-multi-attachment__delete"
								aria-label={__('Remove', 'academy')}
							>
								<span className="academy-icon academy-icon--delete" />
							</button>
						</div>
					))}
				</>
			)}
		</div>
	);
}
