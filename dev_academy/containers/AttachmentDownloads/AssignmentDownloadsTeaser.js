import React from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import Button from '@Components/Button';
import ProTag from '@Components/ProTag';
import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';

/**
 * Shown in place of the real Assignment Downloads table when academy-pro's
 * assignments addon isn't active.
 *
 * This is the *default value* of the `academy.attachment-downloads.assignment-tab`
 * filter: the assignments addon replaces it with the real table, so free
 * never has to know whether that addon is active — if nothing overrides the
 * filter, this teaser is what the instructor sees (mirrors Webhooks'
 * IncomingTeaser for the same free/pro shape). The "Assignment Downloads"
 * heading itself lives in the parent (CourseDetailsModal/AttachmentDownloads),
 * shared with the real table, so it isn't repeated here.
 */
const AssignmentDownloadsTeaser = () => {
	const dispatch = useDispatch();

	return (
		<div className="academy-incoming-teaser">
			<div className="academy-incoming-teaser__icon">
				<span className="academy-icon academy-icon--assignment" />
			</div>

			<div className="academy-incoming-teaser__head">
				<ProTag suffix="academy-pro-badge-gradient" />
				<p className="academy-sub-title">
					{__(
						'See which student downloaded which assignment resource file, and how many times, once the Assignments feature is active.',
						'academy'
					)}
				</p>
			</div>

			<div className="flex items-center justify-center">
				<Button
					onClick={() => dispatch(upgradeProModal(true))}
					type="button"
					label={__('Upgrade to Pro', 'academy')}
					preset="purple"
				/>
			</div>
		</div>
	);
};

export default AssignmentDownloadsTeaser;
