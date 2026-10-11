import React, { useState } from 'react';
import Button from '@Components/Button';
import Preloader from '@Components/Loader/Preloader';
import { __ } from '@wordpress/i18n';
import ReactModal from '@Components/Modal/ReactModal';
import OptionMenu from '@Components/OptionMenu';
import ImageEditorCanvas from './ImageEditorCanvas';
import { base64ToPngFile, uploadBase64ImageToMediaLibrary } from './helper';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import axios from 'axios';
import {
	academy_nonce,
	getAddonActiveStatus,
	is_admin,
	ajaxurl,
} from '@Utils/helper';

import './styles.scss';

const AiImageGenerator = ({
	courseTitle,
	values,
	setFieldValue,
	title = __('Generate Image', 'academy'),
}) => {
	const allAddons = useSelector((state) => state.addons);
	const settings = useSelector((state) => state.settings);
	const [modalOpen, isModalOpen] = useState(false);
	const [loading, isLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(false);
	const [maskedImage, setMaskedImage] = useState(false);
	const [resData, setResponseData] = useState([]);
	const [inputPrompt, setInputPrompt] = useState('');
	const [loadingStates, setLoadingStates] = useState([]);
	const [promtHistory, setPromtHistory] = useState([]);

	const dispatch = useDispatch();

	const onRequestClose = () => {
		isModalOpen(false);
		setSelectedImage(false);
		setMaskedImage(false);
	};

	const handlerSubmit = async (isEdit = false) => {
		isLoading(true);
		const formData = new FormData();
		formData.append('security', academy_nonce);
		formData.append('action', 'academy/ai_integration/chatgpt/img_handler');

		if (inputPrompt) {
			setPromtHistory((prev) => [...prev, inputPrompt]);
			formData.append('prompt', inputPrompt);
		}

		try {
			if (!selectedImage && !maskedImage) {
				if (!isEdit) {
					setResponseData([]);
				}
				setLoadingStates([true, true, true, true]);

				for (let i = 0; i < 4; i++) {
					try {
						const response = await axios.post(ajaxurl, formData);

						if (response?.data?.data) {
							setResponseData((prev) => [
								...prev,
								response.data.data,
							]);
						}
					} catch (error) {
						console.error(`Error generating image ${i}:`, error);
					} finally {
						setLoadingStates((prev) => {
							const newStates = [...prev];
							newStates[i] = false;
							return newStates;
						});
					}
				}
			} else {
				const imageBlob = base64ToPngFile(selectedImage);
				const maskBlob = base64ToPngFile(maskedImage, 'mask.png');
				formData.append('image', imageBlob, 'image.png');
				formData.append('mask', maskBlob, 'mask.png');
				formData.append('action_type', 'edit');

				const response = await axios.post(ajaxurl, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});

				if (response?.data?.data) {
					setSelectedImage(response.data.data);
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading(false);
		}
	};

	const handleDownload = (imageLink) => {
		const link = document.createElement('a');
		link.href = imageLink;
		link.download = 'generated-image.png';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handlerAppend = async (base64Data) => {
		if (!courseTitle) {
			dispatch(
				showNotification({
					message: __('Create a course first', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
			return;
		}
		const imageData = maskedImage ? maskedImage : selectedImage;
		await uploadBase64ImageToMediaLibrary(
			imageData ? imageData : base64Data,
			courseTitle,
			setFieldValue
		);
		onRequestClose();
	};

	const showContent =
		getAddonActiveStatus(allAddons, 'chatgpt') &&
		(is_admin || settings.data?.allow_instructor_to_use_chatgpt);

	return (
		<>
			{showContent && (
				<Button
					preset="transparent"
					icon={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="25"
							viewBox="0 0 24 25"
							fill="none"
						>
							<path
								d="M7.15896 2.96719C7.29411 2.6776 7.70589 2.6776 7.84104 2.96719L8.35032 4.05841C8.57463 4.53904 8.96096 4.92537 9.44159 5.14968L10.5328 5.65896C10.8224 5.79411 10.8224 6.20589 10.5328 6.34104L9.44159 6.85032C8.96096 7.07463 8.57463 7.46096 8.35032 7.94159L7.84104 9.03281C7.70589 9.3224 7.29411 9.3224 7.15896 9.03281L6.64968 7.94159C6.42537 7.46096 6.03904 7.07463 5.55841 6.85032L4.46719 6.34104C4.1776 6.20589 4.1776 5.79411 4.46719 5.65896L5.55841 5.14968C6.03904 4.92537 6.42537 4.53904 6.64968 4.05841L7.15896 2.96719Z"
								fill="url(#paint0_linear_9625_3139)"
							/>
							<path
								d="M18.159 2.96719C18.2941 2.6776 18.7059 2.6776 18.841 2.96719L19.3503 4.05841C19.5746 4.53904 19.961 4.92537 20.4416 5.14968L21.5328 5.65896C21.8224 5.79411 21.8224 6.20589 21.5328 6.34104L20.4416 6.85032C19.961 7.07463 19.5746 7.46096 19.3503 7.94159L18.841 9.03281C18.7059 9.3224 18.2941 9.3224 18.159 9.03281L17.6497 7.94159C17.4254 7.46096 17.039 7.07463 16.5584 6.85032L15.4672 6.34104C15.1776 6.20589 15.1776 5.79411 15.4672 5.65896L16.5584 5.14968C17.039 4.92537 17.4254 4.53904 17.6497 4.05841L18.159 2.96719Z"
								fill="url(#paint1_linear_9625_3139)"
							/>
							<path
								d="M18.159 13.9672C18.2941 13.6776 18.7059 13.6776 18.841 13.9672L19.3503 15.0584C19.5746 15.539 19.961 15.9254 20.4416 16.1497L21.5328 16.659C21.8224 16.7941 21.8224 17.2059 21.5328 17.341L20.4416 17.8503C19.961 18.0746 19.5746 18.461 19.3503 18.9416L18.841 20.0328C18.7059 20.3224 18.2941 20.3224 18.159 20.0328L17.6497 18.9416C17.4254 18.461 17.039 18.0746 16.5584 17.8503L15.4672 17.341C15.1776 17.2059 15.1776 16.7941 15.4672 16.659L16.5584 16.1497C17.039 15.9254 17.4254 15.539 17.6497 15.0584L18.159 13.9672Z"
								fill="url(#paint2_linear_9625_3139)"
							/>
							<path
								d="M13.0303 9.46967C12.7374 9.17678 12.2626 9.17678 11.9697 9.46967L2.88388 18.5556C2.03871 19.4008 2.03871 20.7711 2.88388 21.6163C3.72906 22.4614 5.09937 22.4614 5.94455 21.6163L15.0303 12.5303C15.3232 12.2374 15.3232 11.7626 15.0303 11.4697L13.0303 9.46967Z"
								fill="url(#paint3_linear_9625_3139)"
							/>
							<defs>
								<linearGradient
									id="paint0_linear_9625_3139"
									x1="25.5"
									y1="2.75004"
									x2="25.5"
									y2="61.2509"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#9383F1" />
									<stop
										offset="0.826923"
										stopColor="#D062DC"
									/>
								</linearGradient>
								<linearGradient
									id="paint1_linear_9625_3139"
									x1="-7.5"
									y1="2.75004"
									x2="-7.5"
									y2="61.2509"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#9383F1" />
									<stop
										offset="0.826923"
										stopColor="#D062DC"
									/>
								</linearGradient>
								<linearGradient
									id="paint2_linear_9625_3139"
									x1="-7.5"
									y1="-30.2502"
									x2="-7.5"
									y2="28.2505"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#9383F1" />
									<stop
										offset="0.826923"
										stopColor="#D062DC"
									/>
								</linearGradient>
								<linearGradient
									id="paint3_linear_9625_3139"
									x1="8.74999"
									y1="9.25"
									x2="8.74999"
									y2="22.2501"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#9383F1" />
									<stop
										offset="0.826923"
										stopColor="#D062DC"
									/>
								</linearGradient>
							</defs>
						</svg>
					}
					suffix="ai-generate"
					onClick={() => isModalOpen(true)}
				/>
			)}
			<ReactModal
				isOpen={modalOpen}
				title={title}
				onRequestClose={onRequestClose}
				suffix="generate-image"
				size="medium"
				isEnabledHeader={true}
			>
				<div
					className={`academy-image-generate academy-flex academy-flex-g-3`}
				>
					{(resData.length > 0 ||
						loadingStates.some((state) => state)) && (
						<div className="academy-image-generate__response-container">
							{selectedImage ? (
								<ImageEditorCanvas
									selectedImage={selectedImage}
									setSelectedImage={setSelectedImage}
									maskedImage={maskedImage}
									setMaskedImage={setMaskedImage}
									handlerAppend={() =>
										handlerAppend(selectedImage)
									}
								/>
							) : (
								<div className="academy-image-grid">
									{Array(4)
										.fill()
										.map((_, index) => {
											const image = resData[index];
											const isLoading =
												loadingStates[index];

											return (
												<div
													key={index}
													className="academy-image-generate__response-container--image-item"
												>
													{isLoading ? (
														<div className="academy-image-loading">
															<Preloader />
														</div>
													) : image ? (
														<>
															<img
																src={image}
																alt={`generate-image-${index}`}
																onDoubleClick={() =>
																	setSelectedImage(
																		image
																	)
																}
															/>
															<OptionMenu
																options={[
																	{
																		type: 'button',
																		label: __(
																			'Masking',
																			'academy'
																		),
																		icon: (
																			<svg
																				xmlns="http://www.w3.org/2000/svg"
																				width="24"
																				height="25"
																				viewBox="0 0 24 25"
																				fill="none"
																			>
																				<path
																					d="M7.15896 2.96719C7.29411 2.6776 7.70589 2.6776 7.84104 2.96719L8.35032 4.05841C8.57463 4.53904 8.96096 4.92537 9.44159 5.14968L10.5328 5.65896C10.8224 5.79411 10.8224 6.20589 10.5328 6.34104L9.44159 6.85032C8.96096 7.07463 8.57463 7.46096 8.35032 7.94159L7.84104 9.03281C7.70589 9.3224 7.29411 9.3224 7.15896 9.03281L6.64968 7.94159C6.42537 7.46096 6.03904 7.07463 5.55841 6.85032L4.46719 6.34104C4.1776 6.20589 4.1776 5.79411 4.46719 5.65896L5.55841 5.14968C6.03904 4.92537 6.42537 4.53904 6.64968 4.05841L7.15896 2.96719Z"
																					fill="url(#paint0_linear_9625_3139)"
																				/>
																				<path
																					d="M18.159 2.96719C18.2941 2.6776 18.7059 2.6776 18.841 2.96719L19.3503 4.05841C19.5746 4.53904 19.961 4.92537 20.4416 5.14968L21.5328 5.65896C21.8224 5.79411 21.8224 6.20589 21.5328 6.34104L20.4416 6.85032C19.961 7.07463 19.5746 7.46096 19.3503 7.94159L18.841 9.03281C18.7059 9.3224 18.2941 9.3224 18.159 9.03281L17.6497 7.94159C17.4254 7.46096 17.039 7.07463 16.5584 6.85032L15.4672 6.34104C15.1776 6.20589 15.1776 5.79411 15.4672 5.65896L16.5584 5.14968C17.039 4.92537 17.4254 4.53904 17.6497 4.05841L18.159 2.96719Z"
																					fill="url(#paint1_linear_9625_3139)"
																				/>
																				<path
																					d="M18.159 13.9672C18.2941 13.6776 18.7059 13.6776 18.841 13.9672L19.3503 15.0584C19.5746 15.539 19.961 15.9254 20.4416 16.1497L21.5328 16.659C21.8224 16.7941 21.8224 17.2059 21.5328 17.341L20.4416 17.8503C19.961 18.0746 19.5746 18.461 19.3503 18.9416L18.841 20.0328C18.7059 20.3224 18.2941 20.3224 18.159 20.0328L17.6497 18.9416C17.4254 18.461 17.039 18.0746 16.5584 17.8503L15.4672 17.341C15.1776 17.2059 15.1776 16.7941 15.4672 16.659L16.5584 16.1497C17.039 15.9254 17.4254 15.539 17.6497 15.0584L18.159 13.9672Z"
																					fill="url(#paint2_linear_9625_3139)"
																				/>
																				<path
																					d="M13.0303 9.46967C12.7374 9.17678 12.2626 9.17678 11.9697 9.46967L2.88388 18.5556C2.03871 19.4008 2.03871 20.7711 2.88388 21.6163C3.72906 22.4614 5.09937 22.4614 5.94455 21.6163L15.0303 12.5303C15.3232 12.2374 15.3232 11.7626 15.0303 11.4697L13.0303 9.46967Z"
																					fill="url(#paint3_linear_9625_3139)"
																				/>
																				<defs>
																					<linearGradient
																						id="paint0_linear_9625_3139"
																						x1="25.5"
																						y1="2.75004"
																						x2="25.5"
																						y2="61.2509"
																						gradientUnits="userSpaceOnUse"
																					>
																						<stop stopColor="#9383F1" />
																						<stop
																							offset="0.826923"
																							stopColor="#D062DC"
																						/>
																					</linearGradient>
																					<linearGradient
																						id="paint1_linear_9625_3139"
																						x1="-7.5"
																						y1="2.75004"
																						x2="-7.5"
																						y2="61.2509"
																						gradientUnits="userSpaceOnUse"
																					>
																						<stop stopColor="#9383F1" />
																						<stop
																							offset="0.826923"
																							stopColor="#D062DC"
																						/>
																					</linearGradient>
																					<linearGradient
																						id="paint2_linear_9625_3139"
																						x1="-7.5"
																						y1="-30.2502"
																						x2="-7.5"
																						y2="28.2505"
																						gradientUnits="userSpaceOnUse"
																					>
																						<stop stopColor="#9383F1" />
																						<stop
																							offset="0.826923"
																							stopColor="#D062DC"
																						/>
																					</linearGradient>
																					<linearGradient
																						id="paint3_linear_9625_3139"
																						x1="8.74999"
																						y1="9.25"
																						x2="8.74999"
																						y2="22.2501"
																						gradientUnits="userSpaceOnUse"
																					>
																						<stop stopColor="#9383F1" />
																						<stop
																							offset="0.826923"
																							stopColor="#D062DC"
																						/>
																					</linearGradient>
																				</defs>
																			</svg>
																		),
																		onClick:
																			() =>
																				setSelectedImage(
																					image
																				),
																	},
																	{
																		type: 'button',
																		label: __(
																			'Download',
																			'academy'
																		),
																		onClick:
																			() =>
																				handleDownload(
																					image
																				),
																	},
																]}
															/>

															<Button
																label={__(
																	'Append Image',
																	'academy'
																)}
																suffix="select-image"
																onClick={() =>
																	handlerAppend(
																		image
																	)
																}
															/>
														</>
													) : (
														<div className="academy-image-error">
															{__(
																'Failed to generate image',
																'academy'
															)}
														</div>
													)}
												</div>
											);
										})}
								</div>
							)}
						</div>
					)}

					<div
						className={`academy-image-generate__input-container academy-column-items ${
							!resData.length && !loadingStates.length
								? 'academy-w-100'
								: 'academy-w-40'
						}`}
					>
						<div className="academy-image-generate__prompt-history">
							{promtHistory.length > 0 &&
								promtHistory.map((history, index) => (
									<span className="academy-image-generate__old-prompt">
										{history}
									</span>
								))}
						</div>
						<textarea
							type="textarea"
							rows="6"
							value={inputPrompt}
							className="academy-input"
							onChange={(e) => setInputPrompt(e.target.value)}
							placeholder={__(
								'Exp: Create a image about …..',
								'academy'
							)}
						/>
						<Button
							label={
								resData.length > 0
									? __('Re-generate Now', 'academy')
									: __('Generate Now', 'academy')
							}
							isDisabled={!inputPrompt}
							preset="transparent"
							icon={
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="25"
									viewBox="0 0 24 25"
									fill="none"
								>
									<path
										d="M7.15896 2.96719C7.29411 2.6776 7.70589 2.6776 7.84104 2.96719L8.35032 4.05841C8.57463 4.53904 8.96096 4.92537 9.44159 5.14968L10.5328 5.65896C10.8224 5.79411 10.8224 6.20589 10.5328 6.34104L9.44159 6.85032C8.96096 7.07463 8.57463 7.46096 8.35032 7.94159L7.84104 9.03281C7.70589 9.3224 7.29411 9.3224 7.15896 9.03281L6.64968 7.94159C6.42537 7.46096 6.03904 7.07463 5.55841 6.85032L4.46719 6.34104C4.1776 6.20589 4.1776 5.79411 4.46719 5.65896L5.55841 5.14968C6.03904 4.92537 6.42537 4.53904 6.64968 4.05841L7.15896 2.96719Z"
										fill="url(#paint0_linear_9625_3139)"
									/>
									<path
										d="M18.159 2.96719C18.2941 2.6776 18.7059 2.6776 18.841 2.96719L19.3503 4.05841C19.5746 4.53904 19.961 4.92537 20.4416 5.14968L21.5328 5.65896C21.8224 5.79411 21.8224 6.20589 21.5328 6.34104L20.4416 6.85032C19.961 7.07463 19.5746 7.46096 19.3503 7.94159L18.841 9.03281C18.7059 9.3224 18.2941 9.3224 18.159 9.03281L17.6497 7.94159C17.4254 7.46096 17.039 7.07463 16.5584 6.85032L15.4672 6.34104C15.1776 6.20589 15.1776 5.79411 15.4672 5.65896L16.5584 5.14968C17.039 4.92537 17.4254 4.53904 17.6497 4.05841L18.159 2.96719Z"
										fill="url(#paint1_linear_9625_3139)"
									/>
									<path
										d="M18.159 13.9672C18.2941 13.6776 18.7059 13.6776 18.841 13.9672L19.3503 15.0584C19.5746 15.539 19.961 15.9254 20.4416 16.1497L21.5328 16.659C21.8224 16.7941 21.8224 17.2059 21.5328 17.341L20.4416 17.8503C19.961 18.0746 19.5746 18.461 19.3503 18.9416L18.841 20.0328C18.7059 20.3224 18.2941 20.3224 18.159 20.0328L17.6497 18.9416C17.4254 18.461 17.039 18.0746 16.5584 17.8503L15.4672 17.341C15.1776 17.2059 15.1776 16.7941 15.4672 16.659L16.5584 16.1497C17.039 15.9254 17.4254 15.539 17.6497 15.0584L18.159 13.9672Z"
										fill="url(#paint2_linear_9625_3139)"
									/>
									<path
										d="M13.0303 9.46967C12.7374 9.17678 12.2626 9.17678 11.9697 9.46967L2.88388 18.5556C2.03871 19.4008 2.03871 20.7711 2.88388 21.6163C3.72906 22.4614 5.09937 22.4614 5.94455 21.6163L15.0303 12.5303C15.3232 12.2374 15.3232 11.7626 15.0303 11.4697L13.0303 9.46967Z"
										fill="url(#paint3_linear_9625_3139)"
									/>
									<defs>
										<linearGradient
											id="paint0_linear_9625_3139"
											x1="25.5"
											y1="2.75004"
											x2="25.5"
											y2="61.2509"
											gradientUnits="userSpaceOnUse"
										>
											<stop stopColor="#9383F1" />
											<stop
												offset="0.826923"
												stopColor="#D062DC"
											/>
										</linearGradient>
										<linearGradient
											id="paint1_linear_9625_3139"
											x1="-7.5"
											y1="2.75004"
											x2="-7.5"
											y2="61.2509"
											gradientUnits="userSpaceOnUse"
										>
											<stop stopColor="#9383F1" />
											<stop
												offset="0.826923"
												stopColor="#D062DC"
											/>
										</linearGradient>
										<linearGradient
											id="paint2_linear_9625_3139"
											x1="-7.5"
											y1="-30.2502"
											x2="-7.5"
											y2="28.2505"
											gradientUnits="userSpaceOnUse"
										>
											<stop stopColor="#9383F1" />
											<stop
												offset="0.826923"
												stopColor="#D062DC"
											/>
										</linearGradient>
										<linearGradient
											id="paint3_linear_9625_3139"
											x1="8.74999"
											y1="9.25"
											x2="8.74999"
											y2="22.2501"
											gradientUnits="userSpaceOnUse"
										>
											<stop stopColor="#9383F1" />
											<stop
												offset="0.826923"
												stopColor="#D062DC"
											/>
										</linearGradient>
									</defs>
								</svg>
							}
							border="purple"
							isLoading={loading}
							onClick={() => handlerSubmit(resData.length > 0)}
						/>
						{(selectedImage || maskedImage) && (
							<div className="academy-image-generate__input-container--actions">
								<Button
									label={__('Cancel', 'academy')}
									onClick={onRequestClose}
								/>
								<Button
									label={__('Append to Course', 'academy')}
									onClick={handlerAppend}
								/>
							</div>
						)}
					</div>
				</div>
			</ReactModal>
		</>
	);
};

export default AiImageGenerator;
