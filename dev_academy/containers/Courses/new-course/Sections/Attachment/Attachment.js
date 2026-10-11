import React from 'react';
import { can_manage_addons, getAddonActiveStatus } from '@Utils/helper';
import { useSelector } from 'react-redux';
import MultiUploader from '@Components/Attachment/MultiUploader';
import ProLockedContent from '@Components/ProTag/ProLockedContent';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';

const Attachment = () => {
	const allAddons = useSelector((state) => state.addons);
	const { values, setFieldValue } = useFormikContext();
	const isAttachmentActive = getAddonActiveStatus(
		allAddons,
		'multimedia-attachment'
	);

	// Off, and not an admin who could turn it on: leave the section out.
	if (!isAttachmentActive && !can_manage_addons) {
		return null;
	}

	const uploader = (
		<MultiUploader
			name="meta.academy_course_attachments"
			value={values.meta.academy_course_attachments}
			saveValueHandler={setFieldValue}
			imageSize=""
			supportedFile="JPG, JPEG, GIF, PNG, PDF, DOCX"
			multiple={true}
			multiSelect={true}
		/>
	);

	// Only an admin can turn the addon on; hide the locked preview otherwise.
	if (!isAttachmentActive && !can_manage_addons) {
		return null;
	}

	return (
		<div className="academy-inner">
			<h3 className="academy-heading">{__('Attachment', 'academy')}</h3>
			{isAttachmentActive ? (
				uploader
			) : (
				// Multimedia Attachment is a free addon (`is_pro: false` in
				// the Add-ons list) — it just needs enabling, not buying, so
				// this stays isProFeature={false} regardless of whether
				// Academy Pro is active, matching the same "addon is off"
				// preview pattern used elsewhere (see GameEngineSection).
				<ProLockedContent
					isProFeature={false}
					addonName={__('Multimedia Attachment', 'academy')}
					addonIcon="academy-icon--attachment"
					addonSlug="multimedia-attachment"
				>
					{uploader}
				</ProLockedContent>
			)}
		</div>
	);
};

export default Attachment;
