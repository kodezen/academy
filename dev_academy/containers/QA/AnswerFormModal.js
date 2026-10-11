import React, { useEffect, useState } from 'react';
import ReactModal from '@Components/Modal/ReactModal';
import { current_user_id, API, namespace, makeRequest } from '@Utils/helper';
import moment from 'moment';
import { Field, Form, Formik } from 'formik';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import Preloader from '@Components/Loader/Preloader';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { updateQA } from '@Redux/Slices/questionAndAnswerSlice/questionAndAnswerSlice';

export default function AnswerFormModal({ question, closeModal }) {
	const [isLoading, setIsLoading] = useState(false);
	const [answers, setAnswers] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		API.get(`${namespace}question_answer`, {
			params: {
				status: 'any',
				per_page: 100,
				parent: parseInt(question?.id),
			},
		}).then((res) => {
			setAnswers(res?.data);
		});
	}, [question?.id]);

	const onSubmit = (values, { resetForm }) => {
		setIsLoading(true);
		if (values.content === '') {
			setIsLoading(false);
			dispatch(
				showNotification({
					message: __('Answer can not be empty', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
		} else {
			const args = {
				post: question.post,
				status: 'answered',
				author_user_agent: 'AcademyLMS',
				parent: question.id,
				...values,
			};
			makeRequest({
				action: 'academy/insert_qa',
				...args,
			}).then((res) => {
				setIsLoading(false);
				dispatch(
					updateQA({
						id: res.data?.data?.parent,
						status: 'answered',
					})
				);
				setAnswers([res.data?.data, ...answers]);
				dispatch(
					showNotification({
						message: __('Question Answered', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
			});
			resetForm();
		}
	};
	const adminAvatorStyle = question.avatar_url
		? {
				background: `url(${question.avatar_url})`,
				backgroundPosition: 'center top',
				backgroundRepeat: 'no-repeat',
				backgroundSize: 'cover',
			}
		: false;
	return (
		<React.Fragment>
			<ReactModal
				title={
					question?.meta?.question_title
						? question?.meta?.question_title
						: ' '
				}
				isOpen={true}
				onRequestClose={closeModal}
				suffix="qa"
				size="medium"
				isSmallAvailable={false}
			>
				{!answers ? (
					<Preloader />
				) : (
					<div
						className={`academy-backend-qa academy-backend-qa-wrapper `}
					>
						<div className="academy-qa-wrapper max-h-[500px] overflow-y-scroll">
							{/* qA body */}
							<div className="flex flex-col items-end">
								<div className="mt-5 flex w-[85%] flex-row-reverse items-start justify-end gap-[15px]">
									<div className="relative -mb-2.5 mr-[15px] flex w-[70px] flex-col items-center">
										<div
											className="h-[50px] w-[50px] rounded-full bg-[#007cc387] text-center text-[25px] uppercase leading-[50px]"
											style={
												adminAvatorStyle
													? adminAvatorStyle
													: {}
											}
										>
											{!adminAvatorStyle &&
												question.author_name.substring(
													0,
													1
												)}
										</div>
										<div className="text-center">
											<span className="academy-tooltip__admin-text">
												{question.author_name}
											</span>
											<p className="m-0 text-xs font-normal text-academy-secondary-gray-color">
												{moment(
													question.date
												).fromNow()}
											</p>
										</div>
									</div>
									<div className="w-[calc(100%-70px)] rounded border border-academy-border bg-academy-gray py-1 px-5">
										<h3 className="academy-qa-title text-academy-text-black">
											{question?.meta?.question_title}
										</h3>
										<div
											dangerouslySetInnerHTML={{
												__html: question.content
													?.rendered,
											}}
										></div>
									</div>
								</div>
							</div>
							{answers &&
								answers
									.reverse()
									.filter(
										(item) =>
											parseInt(item.parent) ===
											parseInt(question.id)
									)
									.map((answer, answerItem) => {
										const avatorStyle = answer.avatar_url
											? {
													background: `url(${answer.avatar_url})`,
													backgroundPosition:
														'center top',
													backgroundRepeat:
														'no-repeat',
													backgroundSize: 'cover',
												}
											: false;
										return (
											<div
												className={
													parseInt(
														current_user_id
													) ===
													parseInt(answer.author)
														? 'flex flex-col items-start'
														: 'flex flex-col items-end'
												}
												key={answerItem}
											>
												<div
													className={
														parseInt(
															current_user_id
														) ===
														parseInt(answer.author)
															? 'mt-5 flex w-[85%] items-center'
															: 'mt-5 flex w-[85%] flex-row-reverse items-start justify-end gap-[15px]'
													}
													key={answerItem}
												>
													<div className="relative -mb-2.5 mr-[15px] flex w-[70px] flex-col items-center">
														<div
															className="h-[50px] w-[50px] rounded-full bg-[#007cc387] text-center text-[25px] uppercase leading-[50px]"
															style={
																avatorStyle
																	? avatorStyle
																	: {}
															}
														>
															{!avatorStyle &&
																answer.author_name.substring(
																	0,
																	1
																)}
														</div>
														<div className="text-center">
															<span className="academy-tooltip__admin-text">
																{
																	answer.author_name
																}
															</span>
															<p className="m-0 text-xs font-normal text-academy-secondary-gray-color">
																{moment(
																	answer.date
																).fromNow()}
															</p>
														</div>
													</div>
													<div className="w-[calc(100%-70px)] rounded border border-academy-border bg-academy-gray py-1 px-5">
														{answer.meta
															.question_title && (
															<h3 className="academy-qa-title text-academy-text-black">
																{
																	answer.meta
																		.question_title
																}
															</h3>
														)}
														<div
															dangerouslySetInnerHTML={{
																__html: answer
																	.content
																	.rendered,
															}}
														></div>
													</div>
												</div>
											</div>
										);
									})}
						</div>
						<Formik
							initialValues={{
								content: '',
							}}
							onSubmit={onSubmit}
						>
							<Form className="pt-[5px] text-right">
								<p className="m-0">
									<Field
										id="content"
										name="content"
										as="textarea"
										className="m-0 w-full rounded-lg border border-academy-border bg-academy-surface py-[17px] px-[22px] text-academy-text transition-all duration-300"
										placeholder={__('Answer', 'academy')}
									/>
								</p>
								<p className="m-0 mt-2.5">
									<Button
										label={__('Submit', 'academy')}
										preset="light-purple"
										type="submit"
										isLoading={isLoading}
									/>
								</p>
							</Form>
						</Formik>
					</div>
				)}
			</ReactModal>
		</React.Fragment>
	);
}
