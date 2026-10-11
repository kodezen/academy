import React, { useEffect, useRef, useState } from 'react';
import { useFormikContext, Field } from 'formik';
import { Link } from 'react-router-dom';
import Button from '@Components/Button';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import ReactModal from '@Components/Modal/ReactModal';
import Search from '@Components/Search';
import Pagination from '@Components/Pagination';
import Alert from '@Components/ui/Alert';
import { __ } from '@wordpress/i18n';
import {
	getAddonActiveStatus,
	API,
	route_path,
} from '@Utils/helper';
import { useSelector, useDispatch } from 'react-redux';
import {
	fetchAllCertificates,
	updateCurrentPage,
} from '@Redux/Slices/certificateSlice/certificateSlice';
import PrimaryCertificate from './PrimaryCertificate';
import Preloader from '@Components/Loader/Preloader';
import CertificatePreview from '@Components/CertificatePreview';
import { setLoadedFieldValue } from '../../helper';
import './styles.scss';

const Certificate = ({ data }) => {
	const { values } = useFormikContext();

	return (
		<li className="academy-radio-control">
			<label
				htmlFor={`meta.academy_course_certificate_id-${data.id}`}
				className={`academy-radio-control__label ${
					parseInt(data.id) ===
						parseInt(values.meta.academy_course_certificate_id) &&
					'academy-radio-control--is-active'
				}`}
			>
				<div className="academy-certificate-preview-wrap">
					<CertificatePreview
						certificateId={data.id}
						className="academy-certificate-image"
					/>
					<div className="academy-certificate-use-overlay">
						<span className="academy-icon academy-icon--filled-checkmark" />
						{__('Use this certificate', 'academy')}
					</div>
				</div>
				<Field
					id={`meta.academy_course_certificate_id-${data.id}`}
					name="meta.academy_course_certificate_id"
					className="academy-radio-control__input"
					type="radio"
					checked={
						parseInt(data.id) ===
						parseInt(values.meta.academy_course_certificate_id)
					}
					value={data.id}
				/>
				<div className="academy-certificate-title">
					{data.title.rendered}
				</div>
			</label>
		</li>
	);
};

export default function CourseCertificate({ saveValueHandler }) {
	const allAddons = useSelector((state) => state.addons);
	const certificates = useSelector((state) => state.certificates.data);
	const settings = useSelector((state) => state.settings.data);
	const currentPage = useSelector((state) => state.certificates.currentPage);
	const totalItems = useSelector((state) => state.certificates.totalItems);
	const dispatch = useDispatch();
	const formik = useFormikContext();
	const { values } = formik;
	// Read by the default-certificate effect, which runs after an async load.
	const formikRef = useRef(formik);
	formikRef.current = formik;
	const [data, setData] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [certificatesWithImages, setCertificatesWithImages] = useState([]);

	// const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(false);

	const fetchCertificates = (page = 1) => {
		setLoading(true);
		dispatch(
			fetchAllCertificates({ status: 'publish', page, per_page: 10 })
		).then(({ payload: res }) => {
			dispatch(updateCurrentPage(page));
			if (res.data.length > 0) {
				fetchCertificateImages(res.data);
			}
			setLoading(false);
		});
	};

	const fetchCertificateImages = async (itemData) => {
		if (itemData.length > 0) {
			const certificatesWithImage = await Promise.all(
				itemData.map(async (certificate) => {
					if (certificate.featured_media) {
						try {
							const response = await API.get(
								`wp/v2/media/${certificate.featured_media}`
							);
							return {
								...certificate,
								image_url: response.data.source_url,
							};
						} catch (error) {
							console.error('Error fetching image:', error);
							return certificate;
						}
					}
					return certificate;
				})
			);
			setCertificatesWithImages(certificatesWithImage);
		}
	};

	useEffect(() => {
		if (getAddonActiveStatus(allAddons, 'certificates')) {
			fetchCertificates(currentPage);
		}
	}, [currentPage]);

	useEffect(() => {
		if (certificatesWithImages.length > 0) {
			setData(
				certificatesWithImages.find(
					(item) =>
						parseInt(item.id) ===
						parseInt(values.meta.academy_course_certificate_id)
				)
			);
		}
	}, [values.meta.academy_course_certificate_id, certificatesWithImages]);

	useEffect(() => {
		if (
			certificates.length > 0 &&
			!values.meta.academy_course_certificate_id &&
			settings?.academy_primary_certificate_id
		) {
			// Shows the site's primary certificate as selected. Not an edit:
			// with no course certificate the backend already falls back to it.
			setLoadedFieldValue(
				formikRef.current,
				'meta.academy_course_certificate_id',
				parseInt(settings?.academy_primary_certificate_id)
			);
			setData(
				certificatesWithImages?.find(
					(item) =>
						parseInt(item.id) ===
						parseInt(settings?.academy_primary_certificate_id)
				)
			);
		}
	}, [certificatesWithImages]);

	// Picking a certificate in the modal is done — close it instead of
	// leaving the author to notice the selection took and close it
	// themselves. Skips the very first render so loading the page's
	// already-saved certificate doesn't also try to close a modal that was
	// never open.
	const isFirstIdRender = useRef(true);
	useEffect(() => {
		if (isFirstIdRender.current) {
			isFirstIdRender.current = false;
			return;
		}
		closeModal();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values.meta.academy_course_certificate_id]);

	const searchHandler = (value) => {
		setSearchText(value);
		dispatch(
			fetchAllCertificates({
				status: 'all',
				page: 1,
				per_page: 10,
				search: value,
			})
		);
	};

	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	const removeCertificateHandler = () => {
		setData(false);
		saveValueHandler('meta.academy_course_certificate_id', 0);
	};

	return (
		<React.Fragment>
			{getAddonActiveStatus(allAddons, 'certificates') && (
				<div className="academy-postbox academy-postbox--course-certificate">
					<div className="academy-heading">
						<h2>{__('Certificates', 'academy')}</h2>
					</div>
					<div className="academy-certificate">
						<div
							id="multiInstructor"
							className="academy-postbox__body"
						>
							{data && (
								<PrimaryCertificate
									data={data}
									openModal={openModal}
									removeCertificateHandler={
										removeCertificateHandler
									}
								/>
							)}
							{!data && (
								<div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-academy-border bg-academy-gray p-8 text-center">
									<span
										className="academy-icon academy-icon--certificate text-primary"
										style={{ fontSize: 32 }}
									/>
									<p className="m-0 text-sm text-academy-gray-2">
										{__(
											'No certificate selected for this course yet.',
											'academy'
										)}
									</p>
									<Button
										type="button"
										onClick={openModal}
										preset="purple"
										suffix="select-certificate"
										icon={
											<span className="academy-icon academy-icon--plus" />
										}
										label={__(
											'Select certificate',
											'academy'
										)}
									/>
								</div>
							)}
							{!data &&
								!settings?.academy_primary_certificate_id && (
									<Alert tone="info" className="text-xs">
										<div className="flex items-start gap-2">
											<span
												className="academy-icon academy-icon--certificate mt-0.5"
												style={{ fontSize: 16 }}
											/>
											<span className="text-academy-text">
												{__(
													'You can pick a certificate for this course anytime. Marking one Primary just makes new courses default to it -',
													'academy'
												)}{' '}
												<Link
													className="font-semibold text-primary underline"
													to={`${route_path}admin.php?page=academy-certificates`}
												>
													{__(
														'set a primary certificate.',
														'academy'
													)}
												</Link>
											</span>
										</div>
									</Alert>
								)}
							<ReactModal
								title={__('Add Certificate', 'academy')}
								isOpen={isOpen}
								onRequestClose={closeModal}
								size="medium"
								suffix="add-certificate"
							>
								<Search
									placeholder={__(
										'Search Certificate',
										'academy'
									)}
									onSearchHandler={searchHandler}
									defaultValue={searchText ? searchText : ''}
								/>

								{loading ? (
									<Preloader />
								) : certificatesWithImages.length > 0 ? (
									<>
										<ul className="academy-choose-certificate">
											{certificatesWithImages.map(
												(item) => (
													<Certificate
														key={item.id}
														data={item}
													/>
												)
											)}
										</ul>
									</>
								) : (
									<div className="academy-info">
										<CustomTableMessage
											title={__(
												'No Certificates Available',
												'academy'
											)}
										/>
									</div>
								)}

								{certificatesWithImages.length > 0 && (
									<Pagination
										fetchHandler={fetchCertificates}
										totalItems={totalItems}
									/>
								)}
							</ReactModal>
						</div>
					</div>
				</div>
			)}
		</React.Fragment>
	);
}
