import Button from '@Components/Button';
import { ajaxurl, academy_nonce, certificates } from '@Utils/helper';
import { __ } from '@wordpress/i18n';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import ProgressModal from '../../components/ProgressModal';
import './styles.scss';

const CertificateFontsDownload = () => {
	const addonsSavedData = useSelector((state) => state.addons);
	const isActiveCertificates = addonsSavedData?.certificates;
	const dispatch = useDispatch();
	const hasDownloadedFonts = certificates?.fonts_downloaded;
	const [showProgressModal, setShowProgressModal] = useState(false);
	const eventSourceRef = useRef(null);
	const [downloadProgress, setDownloadProgress] = useState({
		message: null,
		percentage: 0,
		isComplete: false,
	});

	const startFontsDownload = () => {
		setShowProgressModal(true);

		const url = `${ajaxurl}?action=academy_certificates/download_fonts&security=${academy_nonce}`;
		eventSourceRef.current = new EventSource(url, {
			withCredentials: true,
		});

		eventSourceRef.current.onmessage = (event) => {
			const message = JSON.parse(event.data);

			setDownloadProgress((prev) => {
				if (prev.isComplete) {
					setShowProgressModal(false);
					return prev;
				}
				if (message.type === 'percentage') {
					return {
						...prev,
						message: `${message.message}% completed`,
						percentage: parseInt(message.message),
					};
				}
				if (message.type === 'message') {
					return {
						...prev,
						message: message.message,
					};
				}
				if (message.type === 'complete') {
					eventSourceRef.current?.close();
					dispatch(
						showNotification({
							message: message?.message,
							isShow: true,
							type: 'info',
						})
					);
					return {
						message: message.message,
						percentage: 100,
						isComplete: true,
					};
				}
				return prev;
			});
		};
		eventSourceRef.current.onerror = (error) => {
			eventSourceRef.current?.close();
			setShowProgressModal(false);

			dispatch(
				showNotification({
					message: __('Download failed!', 'academy'),
					isShow: true,
					type: 'error',
				})
			);

			setDownloadProgress((prev) => ({
				...prev,
				message: 'An error occurred during font download.',
			}));
		};
	};

	return (
		isActiveCertificates &&
		!hasDownloadedFonts && (
			<div className="max-w-[1250px] w-full mx-auto mb-6 p-4 flex items-center justify-between box-border bg-academy-surface max-lg:flex-col max-lg:gap-6">
				<div className="academy-fonts-download-content-content__warning flex items-center gap-4 justify-start">
					<span className="academy-icon academy-icon--info-circle"></span>
					<div>
						<h2 className="text-academy-text-black text-xl font-semibold leading-[140%] m-0 p-0">
							{__('Action Required: Download Fonts', 'academy')}
						</h2>
						<span className="block text-academy-gray-2 text-sm font-normal leading-[140%] max-w-[80%] w-full mt-1">
							{__(
								'You need to download the required font to generate certificates. Without this font, the certificates PDF cannot be created. Please download it now to continue.',
								'academy'
							)}
						</span>
					</div>
				</div>
				<div>
					<Button
						label={__('Download fonts', 'academy')}
						presets="purple"
						onClick={startFontsDownload}
						suffix="font-download"
					/>
				</div>
				<ProgressModal
					show={showProgressModal}
					progress={downloadProgress?.percentage ?? 0}
					isComplete={downloadProgress?.isComplete ?? false}
					title={__('Download in Progress!', 'academy')}
					progressMessage={downloadProgress?.message}
					successTitle={__(
						'Fonts Download completed successfully!',
						'academy'
					)}
					successMessage={__(
						'Your Fonts Download is successfully done—and you’re good to go now, take a moment to test it now!',
						'academy'
					)}
					close={() => {
						if (eventSourceRef.current) {
							eventSourceRef.current.close();
						}
						setShowProgressModal(false);
						window.location.reload();
					}}
				/>
			</div>
		)
	);
};

export default CertificateFontsDownload;
