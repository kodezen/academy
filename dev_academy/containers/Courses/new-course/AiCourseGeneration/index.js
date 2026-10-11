import React, { useState, useRef, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import Preloader from '@Components/Loader/Preloader';
import ReactModal from '@Components/Modal/ReactModal';
import ResponseContainer from './ResponseContainer';
import { aiGenerateCourse } from '../helper';
import {
	route_path,
	makeRequest,
	getAddonActiveStatus,
	is_admin,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { getCourse } from '@Redux/Slices/courseSlice/courseSlice';

import './styles.scss';

const AiCourseGeneration = ({ ID, setLoading, isFrontend }) => {
	const allAddons = useSelector((state) => state.addons);
	const settings = useSelector((state) => state.settings);
	const heightRef = useRef(null);
	const [modalOpen, isModalOpen] = useState(false);
	const [loading, isLoading] = useState(false);
	const [prompts, setPrompts] = useState([]);
	const [resData, setResponseData] = useState(false);
	const [course, setCourse] = useState(false);
	const [inputPrompt, setInputPrompt] = useState('');
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const onRequestClose = () => {
		isModalOpen(false);
	};

	const handlerSubmit = async () => {
		isLoading(true);
		try {
			setPrompts([...prompts, inputPrompt]);
			const response = await aiGenerateCourse(inputPrompt);
			if (response) {
				setResponseData(response);
				setInputPrompt('');
			}
			isLoading(false);
		} catch (error) {
			console.error(error);
			dispatch(
				showNotification({
					message:
						error?.response?.data?.data ||
						error?.message ||
						__('Something went wrong.', 'academy'),
					type: 'error',
					isShow: true,
				})
			);
			isLoading(false);
		}
	};

	const containerHeight = useMemo(() => {
		if (resData && heightRef.current) {
			return heightRef.current?.clientHeight - 20;
		}
	}, [resData, heightRef]);

	const handlerAppend = () => {
		const courseData = !course ? resData : course;
		let params = {};
		if (ID) params = { course_id: ID };
		setLoading(true);
		makeRequest({
			action: 'academy/course_importer',
			...params,
			data: JSON.stringify(courseData),
		}).then(async ({ data: { data } }) => {
			await dispatch(getCourse(data.course_id)).then((res) => {
				setLoading(false);
			});
			if (!isFrontend) {
				navigate(
					`${route_path}admin.php?page=academy-courses&id=${data.course_id}&action=edit`
				);
			}
			dispatch(
				showNotification({
					message: data.message,
					isShow: true,
					type: 'success',
				})
			);
			onRequestClose();
		});
	};

	const showContent =
		getAddonActiveStatus(allAddons, 'chatgpt') &&
		(is_admin || settings.data?.allow_instructor_to_use_chatgpt);
	const canCreateCourse = can('academy.courses.create');

	return (
		<>
			{showContent && (
				<Button
					label={__('AI Course', 'academy')}
					// Same secondary style as the other extra course buttons.
					preset="transparent"
					border="purple"
					icon={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="19"
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
					isDisabled={!canCreateCourse}
					title={
						!canCreateCourse
							? permissionDeniedMessage('academy.courses.create')
							: undefined
					}
					onClick={() => {
						if (!canCreateCourse) {
							dispatch(
								showNotification({
									message: permissionDeniedMessage(
										'academy.courses.create'
									),
									isShow: true,
									type: 'error',
								})
							);
							return;
						}
						isModalOpen(true);
					}}
					suffix="ai-course"
				/>
			)}

			<ReactModal
				isOpen={modalOpen}
				title={__('Generate Full Course', 'academy')}
				onRequestClose={onRequestClose}
				suffix="generate-course"
				size={'medium'}
				isEnabledHeader={true}
				isSmallAvailable={false}
			>
				<div
					className={`academy-course-generate ${
						!resData ? '' : 'academy-flex academy-flex-g-3'
					}`}
				>
					{resData && (
						<>
							{loading ? (
								<Preloader />
							) : (
								<div
									className="academy-course-generate__response w-[70%] border-r border-b border-academy-border pr-3 rounded"
									ref={heightRef}
								>
									<ResponseContainer
										data={resData}
										setCourse={setCourse}
									/>
								</div>
							)}
						</>
					)}

					<div
						className={`academy-course-generate__input relative ${
							resData ? 'academy-w-30' : 'academy-w-100'
						}`}
					>
						{prompts.length > 0 && (
							<div className="academy-course-generate__input-container--list academy-column-items">
								{loading ? (
									<Preloader />
								) : (
									<>
										{prompts.map(
											(promptItem, promptIndex) => {
												return (
													<div
														className="academy-course-generate__prompt p-3 border border-academy-border rounded mb-3"
														key={promptIndex}
													>
														{promptItem}
													</div>
												);
											}
										)}
									</>
								)}
							</div>
						)}

						<textarea
							type="text"
							rows="6"
							value={inputPrompt}
							className="academy-input h-[100px] p-3"
							onChange={(e) => setInputPrompt(e.target.value)}
							placeholder={__(
								'Enter a brief description of the course',
								'academy'
							)}
						/>

						<div className="academy-bdr-t-4">
							<Button
								label={`${
									resData
										? __('Generate Again', 'academy')
										: __('Generate Now', 'academy')
								}`}
								isDisabled={!inputPrompt}
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
								isLoading={loading}
								onClick={handlerSubmit}
								preset="purple"
								border="purple"
								suffix="course-ai-generate"
							/>
						</div>

						{resData && (
							<div className="academy-course-generate__actions academy-bdr-t-4 flex items-end gap-2.5 absolute bottom-0">
								<Button
									label={__('Cancel', 'academy')}
									onClick={onRequestClose}
									preset="white"
									border="gray"
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

export default AiCourseGeneration;
