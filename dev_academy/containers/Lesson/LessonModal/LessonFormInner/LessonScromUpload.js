import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { API, rest_url, nonce } from '@Utils/helper';
import { useFormikContext } from 'formik';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import ScormDropzone, {
	isZipFile,
	titleFromFileName,
} from '@Components/ScormDropzone';

/**
 * The upload endpoint is per lesson (`lesson/{id}/scorm-upload`), so a new
 * lesson is saved first: picking a package with no title fills one in from
 * the file name (instead of the save failing with "Title Missing"), the host
 * editor's own submit creates the lesson, and once `values.ID` arrives the
 * held file is uploaded.
 */
const LessonScormUpload = () => {
	const { values, setFieldValue, submitForm } = useFormikContext();
	const dispatch = useDispatch();
	const [loading, isLoading] = useState(false);
	// A picked file waiting for the lesson to exist.
	const [pendingFile, setPendingFile] = useState(null);
	// submitForm for the pending file has been fired (only once per pick).
	const createRequestedRef = useRef(false);
	// Latest ID, readable after the async save settles.
	const idRef = useRef(values?.ID);
	idRef.current = values?.ID;

	const notifyError = (message) =>
		dispatch(
			showNotification({
				message: message || __('SCORM upload failed.', 'academy'),
				isShow: true,
				type: 'error',
			})
		);

	const upload = (lessonId, file) => {
		isLoading(true);
		const formData = new FormData();
		formData.append('file', file);
		axios
			.post(
				rest_url + `academy-pro/v1/lesson/${lessonId}/scorm-upload`,
				formData,
				{
					headers: {
						'X-WP-Nonce': nonce,
						'Cache-Control': 'no-cache',
						'Content-Type': 'multipart/form-data',
					},
				}
			)
			.then((res) => {
				// Only take the package from the response — resetting the
				// whole form from it would wipe unsaved edits in other fields.
				setFieldValue('meta.scorm_data', res.data?.meta?.scorm_data);
				dispatch(
					showNotification({
						message: __('SCORM package uploaded', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
			})
			.catch((error) => notifyError(error?.response?.data?.message))
			.finally(() => isLoading(false));
	};

	// New lesson: once the title is in the form, save it; once it has an
	// ID, upload the held package.
	useEffect(() => {
		if (!pendingFile) {
			return;
		}
		if (values?.ID) {
			const file = pendingFile;
			setPendingFile(null);
			createRequestedRef.current = false;
			upload(values.ID, file);
			return;
		}
		if (!createRequestedRef.current && values?.lesson_title?.trim()) {
			createRequestedRef.current = true;
			// The host's submit resolves once its save settles. No ID by
			// then means the create failed (the editor already showed why),
			// so drop the held file instead of spinning forever.
			Promise.resolve(submitForm())
				.catch(() => {})
				.then(() => {
					setTimeout(() => {
						if (!idRef.current) {
							createRequestedRef.current = false;
							setPendingFile(null);
						}
					}, 0);
				});
		}
	}, [pendingFile, values?.ID, values?.lesson_title]);

	const handleSelect = (file) => {
		if (!isZipFile(file)) {
			notifyError(__('Please upload a SCORM package (.zip).', 'academy'));
			return;
		}
		if (values?.ID) {
			upload(values.ID, file);
			return;
		}
		if (!values?.lesson_title?.trim()) {
			const title = titleFromFileName(file.name);
			if (!title) {
				notifyError(__('Add a lesson title first.', 'academy'));
				return;
			}
			setFieldValue('lesson_title', title);
		}
		createRequestedRef.current = false;
		setPendingFile(file);
	};

	const handleDelete = () => {
		isLoading(true);
		API.delete(rest_url + `academy-pro/v1/lesson/${values?.ID}/scorm-upload`)
			.then(() => setFieldValue('meta.scorm_data', null))
			.catch((error) => notifyError(error?.response?.data?.message))
			.finally(() => isLoading(false));
	};

	return (
		<ScormDropzone
			title={__('SCORM Package', 'academy')}
			description={__(
				'Upload a SCORM (.zip) package to use as this lesson’s content.',
				'academy'
			)}
			fileName={
				values?.meta?.scorm_data
					? values.meta.scorm_data.filename ||
						__('SCORM package', 'academy')
					: ''
			}
			isUploading={loading || !!pendingFile}
			onSelect={handleSelect}
			onRemove={handleDelete}
		/>
	);
};

export default LessonScormUpload;
