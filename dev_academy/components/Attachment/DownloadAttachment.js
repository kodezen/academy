import React, { useEffect, useState } from 'react';
import { API, plugin_root_url, academy_nonce, ajaxurl } from '@Utils/helper';

import Preloader from '@Components/Loader/Preloader';
import './download-attachment.scss';

// When `type`/`objectId`/`courseId` are provided, the link is routed through
// Academy\Ajax\AttachmentDownload (action `academy/download_attachment`)
// instead of the direct media URL, so instructors can see who downloaded
// this attachment and how many times. Callers that don't pass them (if any)
// fall back to the direct media URL, unchanged from before.
const DownloadAttachment = ({ id, type, objectId, courseId }) => {
	const [attachment, setAttachment] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (id) {
			setLoading(true);
			API.get(`wp/v2/media/${id}`).then((res) => {
				setAttachment({
					title: res?.data?.title.rendered,
					url: res?.data?.source_url,
				});
				setLoading(false);
			});
		}
	}, [id]);

	const downloadUrl =
		type && objectId && courseId
			? `${ajaxurl}?action=academy/download_attachment&type=${type}&course_id=${courseId}&object_id=${objectId}&attachment_id=${id}&_wpnonce=${academy_nonce}`
			: attachment?.url;

	return (
		<a
			href={downloadUrl}
			className="academy-download-attachment"
			target="_blank"
			download
			rel="noreferrer"
		>
			{loading ? (
				<div className="academy-preloader">
					<Preloader />
				</div>
			) : (
				<>
					<p className="academy-download-attachment__name">
						{attachment?.title}
					</p>
					<img
						src={`${plugin_root_url}assets/images/downloadAttachment.png`}
						alt=""
					/>
				</>
			)}
		</a>
	);
};

export default DownloadAttachment;
