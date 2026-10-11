import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { makeRequest, fireNotify } from '@Utils/helper';
import { useFormikContext } from 'formik';
import ScormDropzone, { isZipFile } from '@Components/ScormDropzone';

const FIELD = 'meta._academy_course_builder_scorm_file';

// `uploadFiles` is lifted to the builder, which hides the curriculum while a
// package is uploading or attached (a SCORM course has no topics).
const ScormUpload = ({ uploadFiles, setUploadFiles }) => {
	const { values, setFieldValue } = useFormikContext();
	const [loading, isLoading] = useState(false);
	const fileName = values?.meta?._academy_course_builder_scorm_file || '';

	const handleSelect = (file) => {
		if (!isZipFile(file)) {
			fireNotify(__('Please upload a SCORM package (.zip).', 'academy'), 'error');
			return;
		}
		setUploadFiles(file);
		isLoading(true);
		makeRequest(
			{
				action: `academy_pro_scorm/admin/scorm_file_upload`,
				upload_file: file,
			},
			true
		)
			.then((res) => {
				if (res.data.success) {
					setFieldValue(FIELD, res.data.data);
				} else {
					fireNotify(res.data.data, 'error');
					setUploadFiles(false);
				}
			})
			.catch((error) => {
				fireNotify(
					error?.message || __('SCORM upload failed.', 'academy'),
					'error'
				);
				setUploadFiles(false);
			})
			.finally(() => isLoading(false));
	};

	const handleDelete = () => {
		isLoading(true);
		makeRequest({
			action: `academy_pro_scorm/admin/delete_upload_scorm_file`,
			file_name: fileName,
		})
			.then(() => {
				setFieldValue(FIELD, '');
				setUploadFiles(false);
			})
			.finally(() => isLoading(false));
	};

	return (
		// No postbox chrome: it already sits inside the Course Builder card,
		// so a second framed box around the dropzone was just an extra border.
		<div className="academy-course-builder-scorm mb-5">
			<ScormDropzone
				title={__('Upload SCORM Package', 'academy')}
				description={__(
					'Uploading a package replaces this course’s curriculum.',
					'academy'
				)}
				fileName={fileName}
				isUploading={loading || (!!uploadFiles && !fileName)}
				onSelect={handleSelect}
				onRemove={handleDelete}
			/>
		</div>
	);
};

export default ScormUpload;
