import React, { useState } from 'react';
import Button from '@Components/Button';
import { admin_notices, makeRequest } from '@Utils/helper';
import Offer from '@Components/Offer';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';
import './styles.scss';

const Notice = () => {
	const dispatch = useDispatch();
	// admin_notices (localized from Notices::get_notices()) already excludes
	// anything this user previously dismissed — see
	// includes/admin/notices.php — so there's nothing dismissed to filter out
	// or flash on mount here; this state is purely for the current session's
	// open/closed toggle.
	const [visibleNotices, setVisibleNotices] = useState(
		Object.keys(admin_notices).reduce(
			(acc, key) => ({ ...acc, [key]: true }),
			{}
		)
	);

	const handleClose = (key) => {
		// Hide immediately for responsive UX...
		setVisibleNotices((prev) => ({ ...prev, [key]: false }));

		// ...then persist per-user so it stays hidden after reload/navigation
		// (PHP filters it out server-side on every future request once saved).
		makeRequest({
			action: 'academy/dismiss_admin_notice',
			notice_key: key,
		}).catch(() => {
			// Don't silently assume it saved. Left hidden for this session
			// (bringing it back mid-session would be jarring) but the admin
			// is told it may return, rather than persistence failing silently.
			dispatch(
				showNotification({
					message: __(
						"Couldn't save this dismissal — the notice may reappear after your next reload.",
						'academy'
					),
					isShow: true,
					type: 'error',
				})
			);
		});
	};

	return (
		<>
			{Object.entries(admin_notices).map(([key, notice]) => {
				if ('discount_offer' === notice?.type) {
					return <Offer {...notice} key={key} />;
				}
				return (
					visibleNotices[key] && (
						<div
							key={key}
							className={`academy-notice academy-notice--${key} notice notice-${notice?.type}`}
						>
							<div className="academy-notice__icon">
								<span className="academy-icon academy-icon--information" />
							</div>
							<div
								className="academy-notice__content"
								dangerouslySetInnerHTML={{
									__html: notice?.message,
								}}
							></div>
							<div className="academy-notice__control">
								<a
									className="academy-btn academy-btn--bg-purple"
									href={notice.button_action.replace(
										/&#038;/g,
										'&'
									)}
								>
									{notice.button_text}
								</a>
								{notice.dismissible && (
									<Button
										icon={
											<span className="academy-icon academy-icon--close" />
										}
										onClick={() => handleClose(key)}
										suffix="close"
									/>
								)}
							</div>
						</div>
					)
				);
			})}
		</>
	);
};

export default Notice;
