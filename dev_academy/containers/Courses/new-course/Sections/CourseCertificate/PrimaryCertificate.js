import React from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import OptionMenu from '@Components/OptionMenu';
import { API, namespace, plugin_root_url } from '@Utils/helper';
import Button from '@Components/Button';
import CertificatePreview from '@Components/CertificatePreview';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { convertFlowTreeToCanvas } from '@kodezen/editor';
import { normalizeTree } from '@Containers/Certificate/CertificateBuilder/pageSetup';

const PrimaryCertificate = ({
	data,
	openModal,
	removeCertificateHandler,
}) => {
	const { values, setFieldValue } = useFormikContext();
	const dispatch = useDispatch();

	const previewAsPdf = async () => {
		const previewWindow = window.open( '', '_blank' );
		try {
			const { data: previewData } = await API.get(
				`${ namespace }certificate-builder/${ data.id }/preview-tree`
			);
			// Mirrors the builder's own load step (CertificateBuilder/index.js):
			// a stored flow (`version !== 3`) tree only renders correctly on
			// the server when its `_academy_certificate_html` cache is
			// populated — which isn't guaranteed (e.g. certificates seeded
			// outside the builder never had it written). Upgrading to canvas
			// here, the same way opening the certificate in the builder does
			// in memory, makes the PDF always render straight from the tree
			// instead of silently falling back to unrelated legacy content.
			const loaded = previewData.tree
				? normalizeTree( previewData.tree )
				: undefined;
			const tree =
				loaded && loaded.version !== 3
					? convertFlowTreeToCanvas( loaded )
					: loaded;
			if ( ! tree ) {
				throw new Error( 'no-design' );
			}
			const response = await API.post(
				`${ namespace }certificate-builder/${ data.id }/preview`,
				{ tree },
				{ responseType: 'blob' }
			);
			const previewUrl = URL.createObjectURL( response.data );

			if ( previewWindow ) {
				previewWindow.location = previewUrl;
			} else {
				window.open( previewUrl, '_blank' );
			}
		} catch ( err ) {
			previewWindow?.close();
			dispatch(
				showNotification({
					message:
						err?.response?.data?.message ||
						__(
							'Failed to generate the PDF preview.',
							'academy'
						),
					isShow: true,
					type: 'error',
				})
			);
		}
	};

	const proBtn = [
				{
					type: 'button',
					label: __('Remove', 'academy'),
					suffix: 'trash',
					icon: (
						<span className="academy-icon academy-icon--trash-delete"></span>
					),
					onClick: () => {
						if (
							// eslint-disable-next-line
                    window.confirm(
								__(
									'Are you sure you want to remove certificate?',
									'academy'
								)
							)
						) {
							removeCertificateHandler();
						}
					},
				},
			];

	return (
		<div
			className={`academy-course-certificate${
				parseInt(data.id) ===
				parseInt(values.meta.academy_course_certificate_id)
					? ' academy-course-certificate--active'
					: ''
			}`}
		>
			<div className="academy-course-certificate__entry-left">
				<div className="academy-course-certificate__name">
					<CertificatePreview
						certificateId={data.id}
						className="academy-certificate-image"
					/>
					{data?.title?.rendered}
				</div>
			</div>
			<div className="academy-course-certificate__entry-right">
				{values.meta.academy_course_enable_certificate ? (
					<>
						<div className="academy-button-wrapper">
							<Button
								label={__('Change Certificate', 'academy')}
								preset="purple"
								suffix="change-certificate"
								onClick={openModal}
							/>
						</div>
						<OptionMenu
							icon="three-dots-menu"
							suffix="course-certificate"
							options={[
								{
									type: 'button',
									label: __('Preview', 'academy'),
									suffix: '',
									icon: (
										<span className="academy-icon academy-icon--eye"></span>
									),
									onClick: previewAsPdf,
								},
								{
									type: 'button',
									label: __('Deactivate', 'academy'),
									suffix: '',
									icon: (
										<img
											className="academy-icon-slash"
											src={
												plugin_root_url +
												'assets/images/slash.svg'
											}
											alt={__('disable', 'academy')}
										/>
									),
									onClick: () =>
										setFieldValue(
											'meta.academy_course_enable_certificate',
											false
										),
								},
								...proBtn,
							]}
						/>
					</>
				) : (
					<Button
						label={__('Activate', 'academy')}
						preset="light-purple"
						suffix="change-certificate"
						onClick={() => {
							setFieldValue(
								'meta.academy_course_enable_certificate',
								true
							);
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default PrimaryCertificate;
