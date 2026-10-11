import React, { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Field, Form, Formik } from 'formik';
import { getFieldName } from '@Utils/helper';
import AcademySeparator from '@Components/AcademySeparator';
import AcademyAccordion from '@Components/AcademyAccordion';

const CourseContent = ({ data = false, setCourse = false }) => {
	const [activeIndex, setActiveIndex] = useState(0);

	const getInitialValues = () => {
		return data?.modules?.reduce((acc, module, index) => {
			module.lessons?.forEach((lesson) => {
				const key = getFieldName(lesson.lessonTitle);
				acc[key] = true;
			});
			module.assignments?.forEach((assignment) => {
				const key = getFieldName(assignment.title);
				acc[key] = true;
			});
			module.quiz?.forEach((q) => {
				const key = getFieldName(q.question);
				acc[key] = true;
			});
			const quizKey = getFieldName(
				sprintf('Quiz: Module %s Quiz', index + 1)
			);
			acc[quizKey] = true;

			return acc;
		}, {});
	};

	return (
		<div className="academy-course-generate--builder academy-column-items academy-separator-wrap academy-mb-3">
			<h3>{__('Course Content', 'academy')}</h3>
			<AcademySeparator />
			{data?.modules.length && (
				<div className="academy-column-items">
					<Formik
						enableReinitialize={true}
						initialValues={getInitialValues()}
						onSubmit={(values) => {
							const newModules = [...data.modules];
							const modifiedModules = newModules.map(
								(module, index) => {
									const filteredLessons =
										module.lessons.filter((lesson) => {
											const fieldName = getFieldName(
												lesson.lessonTitle
											);
											return values[fieldName];
										});
									const filteredAssignments =
										module.assignments.filter(
											(assignment) => {
												const fieldName = getFieldName(
													assignment.title
												);
												return values[fieldName];
											}
										);

									const quizFieldKey = getFieldName(
										`Quiz: Module ${index + 1} Quiz`
									);
									const shouldIncludeQuiz =
										values[quizFieldKey];

									const updatedModule = {
										...module,
										lessons: filteredLessons,
										assignments: filteredAssignments,
									};

									if (shouldIncludeQuiz) {
										const filteredQuizes =
											module.quiz.filter((q) => {
												const fieldName = getFieldName(
													q.question
												);
												return values[fieldName];
											});
										updatedModule.quiz = filteredQuizes;
									} else {
										delete updatedModule.quiz;
									}

									return updatedModule;
								}
							);

							const newCourse = {
								...data,
								modules: modifiedModules,
							};
							setCourse(newCourse);
						}}
					>
						{({ handleSubmit, handleChange }) => (
							<Form className="academy-column-items">
								{data?.modules.map((item, moduleIndex) => (
									<AcademyAccordion
										index={moduleIndex}
										activeIndex={activeIndex}
										setActiveIndex={setActiveIndex}
										renderTitle={() => (
											<h4 className="academy-title">
												{item?.moduleTitle}
											</h4>
										)}
										renderContent={() => (
											<>
												<p className="academy-course-grnerate-container__content-item-description py-2 m-0 border-b border-academy-border">
													{item?.moduleDescription}
												</p>
												<div className="academy-course-grnerate-container__content-lessons mt-2">
													{item?.lessons?.map(
														(
															lessonItems,
															index
														) => {
															const fieldName =
																getFieldName(
																	lessonItems.lessonTitle
																);
															return (
																<div
																	key={index}
																	className="academy-checkbox"
																>
																	<label
																		htmlFor={`lesson-${
																			index +
																			1
																		}`}
																	>
																		<Field
																			id={`lesson-${
																				index +
																				1
																			}`}
																			type="checkbox"
																			name={
																				fieldName
																			}
																			onChange={(
																				e
																			) => {
																				handleChange(
																					e
																				);
																				handleSubmit();
																			}}
																		/>
																		<span>
																			{
																				lessonItems?.lessonTitle
																			}
																		</span>
																	</label>
																</div>
															);
														}
													)}
													{item?.assignments?.map(
														(
															assignmentItems,
															index
														) => {
															const fieldName =
																getFieldName(
																	assignmentItems.title
																);
															return (
																<div
																	key={index}
																	className="academy-checkbox"
																>
																	<label
																		htmlFor={`assignment-${
																			index +
																			1
																		}`}
																	>
																		<Field
																			id={`assignment-${
																				index +
																				1
																			}`}
																			type="checkbox"
																			name={
																				fieldName
																			}
																			onChange={(
																				e
																			) => {
																				handleChange(
																					e
																				);
																				handleSubmit();
																			}}
																		/>
																		<span>
																			{
																				assignmentItems?.title
																			}
																		</span>
																	</label>
																</div>
															);
														}
													)}
													{item?.quiz?.map(
														(quiz, index) => {
															const fieldName =
																getFieldName(
																	quiz.question
																);
															return (
																<div
																	key={index}
																	className="academy-checkbox"
																>
																	<label
																		htmlFor={`quiz-${
																			index +
																			1
																		}`}
																	>
																		<Field
																			id={`quiz-${
																				index +
																				1
																			}`}
																			type="checkbox"
																			name={
																				fieldName
																			}
																			onChange={(
																				e
																			) => {
																				handleChange(
																					e
																				);
																				handleSubmit();
																			}}
																		/>
																		<span>
																			Quiz
																			Qst{' '}
																			{index +
																				1}
																			:{' '}
																			{
																				quiz.question
																			}
																		</span>
																	</label>
																</div>
															);
														}
													)}
													{item?.quiz && (
														<div className="academy-checkbox">
															<label
																htmlFor={`quiz-${
																	moduleIndex +
																	3
																}`}
															>
																<Field
																	id={`quiz-${
																		moduleIndex +
																		3
																	}`}
																	type="checkbox"
																	name={getFieldName(
																		sprintf(
																			'Quiz: Module %s Quiz',
																			moduleIndex +
																				1
																		)
																	)}
																	onChange={(
																		e
																	) => {
																		handleChange(
																			e
																		);
																		handleSubmit();
																	}}
																/>
																<span>
																	{sprintf(
																		__(
																			'Quiz: Module %s Quiz',
																			'academy'
																		),
																		moduleIndex +
																			1
																	)}
																</span>
															</label>
														</div>
													)}
												</div>
											</>
										)}
									/>
								))}
							</Form>
						)}
					</Formik>
				</div>
			)}
		</div>
	);
};

export default CourseContent;
