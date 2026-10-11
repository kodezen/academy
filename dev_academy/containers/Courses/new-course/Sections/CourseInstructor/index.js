import React, { useEffect, useRef, useState } from 'react';
import { useFormikContext, Field } from 'formik';
import Button from '@Components/Button';
import { CheckboxControl } from '@wordpress/components';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import OptionMenu from '@Components/OptionMenu';
import ReactModal from '@Components/Modal/ReactModal';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import { makeRequest, getAddonActiveStatus } from '@Utils/helper';
import CourseAuthor from './courseAuthor';
import { setLoadedFieldValue } from '../../helper';
import './styles.scss';
import { useSelector } from 'react-redux';

const Instructor = ({ data, toggleInstructorsHandler }) => {
	const [isChecked, setChecked] = useState(false);
	const onChangeHandler = (isRemove) => {
		setChecked(!isChecked);
		toggleInstructorsHandler(data, isRemove);
	};
	return (
		<li>
			<CheckboxControl
				className="academy-checkbox-control"
				label={data.display_name}
				checked={isChecked}
				onChange={() => onChangeHandler(isChecked)}
			/>
			<span className="academy-choose-instructor__email">
				{data.user_email}
			</span>
		</li>
	);
};

export default function CourseInstructors({ course_id, saveValueHandler }) {
	const allAddons = useSelector((state) => state.addons);
	const formik = useFormikContext();
	const { values } = formik;
	const { author } = values;
	// The request below resolves after mount; read Formik through a ref so
	// it sees the form as it is then, not as it was on the first render.
	const formikRef = useRef(formik);
	formikRef.current = formik;
	const [data, setData] = useState([]);
	const [currentInstructor, setCurrentInstructor] = useState([]);
	const [instructors, setInstructors] = useState([]);
	const [isOpen, setOpen] = useState(false);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (getAddonActiveStatus(allAddons, 'multi_instructor')) {
			makeRequest({
				action: 'academy_multi_instructor/get_instructors_by_course_id',
				course_id,
			}).then((res) => {
				if (res.data.data) {
					setData(res.data.data);
				}
				if (res.data.data && res.data.data.length > 0) {
					const instructorIDs = res.data.data?.reduce((acc, item) => {
						acc.push(item.ID);
						return acc;
					}, []);
					setCurrentInstructor(instructorIDs);
					// The course's saved instructors (the REST response
					// doesn't include them), not an edit.
					setLoadedFieldValue(
						formikRef.current,
						'instructors',
						instructorIDs
					);
				}
			});
		}
	}, [course_id]);

	const openModal = () => {
		makeRequest({
			action: 'academy_multi_instructor/get_active_instructors',
		}).then((res) => {
			if (res.status === 200) {
				setInstructors(
					res.data.data?.reduce((acc, item) => {
						if (currentInstructor?.includes(item.ID) === false) {
							acc.push(item);
						}
						return acc;
					}, [])
				);
			}
			setOpen(true);
		});
	};
	const closeModal = () => setOpen(false);
	const toggleInstructorsHandler = (item, isRemove = false) => {
		let tempData;
		let instructorIDs;
		if (isRemove) {
			tempData = data.filter(
				(dataItem) => parseInt(dataItem.ID) !== parseInt(item.ID)
			);
			if (tempData.length > 0) {
				instructorIDs = tempData?.reduce((acc, instructor) => {
					acc.push(instructor.ID);
					return acc;
				}, []);
			}
		} else {
			tempData = [...data, item];
			if (tempData.length > 0) {
				instructorIDs = tempData?.reduce((acc, instructor) => {
					acc.push(instructor.ID);
					return acc;
				}, []);
			}
		}
		saveValueHandler('instructors', instructorIDs);
		setCurrentInstructor(instructorIDs);
		setData(tempData);
	};
	const removeInstructorHandler = (ID) => {
		makeRequest({
			action: 'academy_multi_instructor/remove_instructor_from_course',
			course_id,
			instructor_id: ID,
		}).then(() => {
			const modifyData = data.filter(
				(dataItem) => parseInt(dataItem.ID) !== parseInt(ID)
			);
			const instructorIDs = modifyData?.reduce((acc, instructor) => {
				acc.push(instructor.ID);
				return acc;
			}, []);
			setCurrentInstructor(instructorIDs);
			setData(modifyData);
			saveValueHandler('instructors', instructorIDs);
		});
	};
	const isShowAuthorSelect = !getAddonActiveStatus(
		allAddons,
		'multi_instructor'
	);

	const filterInstructor = instructors.filter((instructor) =>
		instructor.display_name.toLowerCase().includes(searchText)
	);

	return (
		<React.Fragment>
			<div className="academy-inner academy-postbox--course-instructors">
				<h2 className="academy-heading">
					{__('Instructor', 'academy')}
				</h2>
				{isShowAuthorSelect && <CourseAuthor />}
				{getAddonActiveStatus(allAddons, 'multi_instructor') && (
					<div className="academy-instructors">
						<div
							id="multiInstructor"
							className="academy-postbox__body"
						>
							{data &&
								data.map((item, index) => {
									return (
										<div
											className={`academy-course-instructor${
												parseInt(item.ID) ===
												parseInt(author)
													? ' academy-course-instructor--active'
													: ''
											}`}
											key={index}
										>
											<div className="academy-course-instructor__entry-left">
												<span className="academy-course-instructor__name">
													{item.display_name}
												</span>
											</div>
											<div className="academy-course-instructor__entry-right">
												<div className="academy-course-instructor__info-wrap">
													<label
														htmlFor={`multiInstructor${item.ID}`}
														className="academy-course-instructor__info"
													>
														<span className="academy-course-instructor__designation">
															{
																item.academy_profile_designation
															}
														</span>
													</label>
													<Field
														id={`multiInstructor${item.ID}`}
														name="author"
														type="radio"
														checked={
															parseInt(
																item.ID
															) ===
															parseInt(author)
														}
														value={item.ID}
													/>
												</div>
												<OptionMenu
													icon="three-dots-menu"
													options={[
														{
															type: 'button',
															label: __(
																'Remove',
																'academy'
															),
															suffix: 'trash',
															icon: (
																<span className="academy-icon academy-icon--trash-delete"></span>
															),
															onClick: () => {
																removeInstructorHandler(
																	item.ID
																);
															},
														},
													]}
												/>
											</div>
										</div>
									);
								})}
							<div>
								<Button
									type="button"
									onClick={openModal}
									icon={
										<span className="academy-icon academy-icon--group-profile"></span>
									}
									iconPosition="left"
									label={__('Add Instructor', 'academy')}
								/>
								<p className="academy-deactivate-message">
									<span className="academy-icon academy-icon--information"></span>
									<span>
										{__(
											'Only Default Instructors Get Shared Revenue.',
											'academy'
										)}
									</span>
								</p>
								<ReactModal
									title={__('Add instructors', 'academy')}
									isOpen={isOpen}
									onRequestClose={closeModal}
									size="small"
									suffix="add-instructors"
								>
									{instructors.length > 0 ? (
										<>
											<Search
												placeholder={__(
													'Search Instructor',
													'academy'
												)}
												onSearchHandler={(value) =>
													setSearchText(
														value.toLowerCase()
													)
												}
											/>
											<ul className="academy-choose-instructor">
												{filterInstructor.length !==
												0 ? (
													<>
														{filterInstructor.map(
															(item, index) => (
																<Instructor
																	data={item}
																	key={index}
																	toggleInstructorsHandler={
																		toggleInstructorsHandler
																	}
																/>
															)
														)}
													</>
												) : (
													<div className="academy-info">
														<CustomTableMessage
															title={__(
																'No Instructor Available',
																'academy'
															)}
														/>
													</div>
												)}
											</ul>
										</>
									) : (
										<div className="academy-info">
											<CustomTableMessage
												title={__(
													'No Instructor Available',
													'academy'
												)}
											/>
										</div>
									)}
								</ReactModal>
							</div>
						</div>
					</div>
				)}
			</div>
		</React.Fragment>
	);
}
