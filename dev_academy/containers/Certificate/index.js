import React, { useState } from 'react';

import Button from '@Components/Button';
import TopBar from '@Components/TopBar';
import CourseTabs from '@Containers/Courses/CourseTabs';
import SubTopBar from '@Components/SubTopBar';
import WarningNotice from '@Components/WarningNotice/WarningNotice';
import { __ } from '@wordpress/i18n';
import GetHelp from '@Components/GetHelp';
import CertificateTable from './CertificateTable';
import CreateWizard from './CertificateBuilder/CreateWizard';
import { createCertificate } from './CertificateBuilder/createCertificate';
import {
	admin_url,
	route_path,
	can,
	is_staff,
	permissionDeniedMessage,
} from '@Utils/helper';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

/**
 * Certificates list.
 *
 * "Add New Certificate" opens the create wizard here rather than on a blank
 * editor: the certificate does not exist until the wizard is finished, so
 * there is nothing for an editor to show until then. Finishing creates it and
 * redirects to that certificate's editor. `action=new` in the URL is what
 * holds the wizard open, so the flow survives a reload and can be linked to.
 */
const Certificate = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { search } = useLocation();
	const [creating, setCreating] = useState(false);
	const certificates = useSelector((state) => state.certificates);
	const settings = useSelector((state) => state.settings.data);
	const hasNoPrimaryCertificate =
		certificates?.data?.length > 0 &&
		!settings?.academy_primary_certificate_id;

	const canCreateCertificate = can('academy.certificates.create');
	// Reset Certificate runs through the Tools ajax surface, which
	// AjaxGuard denies to every staff member outright — there's no
	// certificates.* slug that unlocks it.
	const canResetCertificate = !is_staff;

	const listUrl = `${route_path}admin.php?page=academy-certificates`;
	const isCreating = 'new' === new URLSearchParams(search).get('action');

	const guard = (allowed, slug) => (e) => {
		if (allowed) {
			return;
		}
		e.preventDefault();
		dispatch(
			showNotification({
				message: permissionDeniedMessage(slug),
				isShow: true,
				type: 'error',
			})
		);
	};

	const onCreate = (title, config, isBlank) => {
		setCreating(true);
		return createCertificate(title, config, isBlank)
			.then((id) => navigate(`${listUrl}&id=${id}`))
			.catch((err) =>
				dispatch(
					showNotification({
						message:
							err?.response?.data?.message ||
							__('Failed to create the certificate.', 'academy'),
						isShow: true,
						type: 'error',
					})
				)
			)
			.finally(() => setCreating(false));
	};

	return (
		<>
			<TopBar
				render={() => (
					<>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{__('All Certificates', 'academy')}
						</h3>
						<GetHelp filterText={['certificate', 'builder']} />
					</>
				)}
				label={__('All Certificates', 'academy')}
				centerContent={() => (
					<CourseTabs navigate={navigate} value="certificates" />
				)}
			/>
			<SubTopBar heading={__('All Certificates', 'academy')}>
				<Button
					type="link"
					target="__blank"
					// Secondary: "Add New Certificate" is the page's main action.
					// Light-red: this is destructive (wipes certificate data).
					preset="light-red"
					icon={
						<span className="academy-icon academy-icon--reset" />
					}
					link={`${admin_url}admin.php?page=academy-tools&path=reset_certificate`}
					label={__('Reset Certificate', 'academy')}
					isDisabled={!canResetCertificate}
					title={
						!canResetCertificate
							? permissionDeniedMessage('')
							: undefined
					}
					onClick={guard(canResetCertificate, '')}
				/>
				<Button
					type="button"
					onClick={() => navigate(`${listUrl}&action=new`)}
					label={__('Add New Certificate', 'academy')}
					isDisabled={!canCreateCertificate}
					title={
						!canCreateCertificate
							? permissionDeniedMessage(
									'academy.certificates.create'
								)
							: undefined
					}
				/>
			</SubTopBar>
			<div className="academy-page-content academy-page-content--certificate">
				{hasNoPrimaryCertificate && (
					<WarningNotice
						title={__('No primary certificate set', 'academy')}
						description={__(
							'Students won’t get a certificate until one is marked Primary. Open a certificate’s ⋯ menu and choose “Make Primary”.',
							'academy'
						)}
					/>
				)}
				<CertificateTable />
			</div>

			<CreateWizard
				// A deep link to `action=new` must not open the wizard for a
				// user who cannot create certificates.
				isOpen={isCreating && canCreateCertificate}
				isCreating={creating}
				onClose={() => navigate(listUrl)}
				onCreate={onCreate}
			/>
		</>
	);
};

export default Certificate;
