/* eslint-disable no-undef, import/no-unresolved, camelcase */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
	createNewCategory,
	deleteCategory,
	updateCategory,
} from '@Redux/Slices/categorySlice/categorySlice';
import {
	deleteBookingCategory,
	createBookingCategory,
	updateBookingCategory,
} from '@Redux/Slices/bookingSlice/bookingSlice';
import { current_user_can } from '@Utils/helper';
import GetHelp from '@Components/GetHelp';

import Button from '@Components/Button';
import CategoryTable from './CategoryTable';
import CreateCategory from './CreateCategory';
import TopBar from '@Components/TopBar';
import BookingTabs from '@Containers/TutorBooking/BookingTabs';
import SubTopBar from '@Components/SubTopBar';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import './styles.scss';

const EMPTY_CATEGORY = {
	id: 0,
	name: '',
	slug: '',
	parent: 0,
	description: '',
	meta: { academy_category_image: 0 },
};

const Category = (props) => {
	const { viewFrom } = props;
	const navigate = useNavigate();

	const dispatch = useDispatch();

	const [editSavedValue, setEditSavedValue] = useState({});
	const [selectedTermLists, setSelectedTermLists] = useState([]);
	// Bumped after a successful create/update to force CreateCategory to
	// remount — the simplest way to collapse its "Change slug" toggle back
	// to closed along with the rest of its local state, matching a fresh form.
	const [formInstanceKey, setFormInstanceKey] = useState(0);

	const notify = (message, type = 'success') =>
		dispatch(showNotification({ message, isShow: true, type }));

	const onFormSubmitHandler = (values, actions) => {
		actions.setSubmitting(true);
		if (values.name === '') {
			notify(__('Title Missing', 'academy'), 'error');
			actions.setSubmitting(false);
			return;
		}

		const isUpdate = values.id > 0;
		const isCourse = viewFrom === 'course';
		let action;
		if (isUpdate) {
			action = isCourse ? updateCategory : updateBookingCategory;
		} else {
			action = isCourse ? createNewCategory : createBookingCategory;
		}

		dispatch(action(values)).then(() => {
			notify(
				isUpdate
					? __('Category Updated', 'academy')
					: __('Category Created', 'academy')
			);
			actions.setSubmitting(false);
			setEditSavedValue({});
			actions.resetForm({ values: EMPTY_CATEGORY });
			setFormInstanceKey((prev) => prev + 1);
		});
	};

	const onCheckTermItemHandler = (status, item) => {
		if (status) {
			setSelectedTermLists((prevState) => [...prevState, item.id]);
		} else {
			setSelectedTermLists((prevState) =>
				prevState.filter(
					(oldICatId) => parseInt(oldICatId) !== parseInt(item.id)
				)
			);
		}
	};

	const onClickEditHandler = (item) => {
		setEditSavedValue({ ...item });
	};

	const deleteHandler = (ID) => {
		if (viewFrom === 'course') {
			dispatch(deleteCategory(ID));
		} else {
			dispatch(deleteBookingCategory(ID));
		}
	};

	const heading =
		viewFrom === 'course'
			? __('Course Categories', 'academy')
			: __('Booking Categories', 'academy');
	const isEditing = editSavedValue.id > 0;

	return (
		<React.Fragment>
			<TopBar
				render={() => (
					<>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{heading}
						</h3>
						<GetHelp filterText={['category']} />
					</>
				)}
				centerContent={() =>
					viewFrom === 'booking' && (
						<BookingTabs navigate={navigate} value="category" />
					)
				}
			/>
			<SubTopBar heading={heading} />
			<div className="academy-page-content academy-page-content--category">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
					{current_user_can.manage_categories && (
						<div className="w-full shrink-0 lg:w-[340px]">
							<div className="rounded-lg border border-academy-border bg-academy-surface p-5">
								<h3 className="academy-heading">
									{isEditing
										? __('Edit Category', 'academy')
										: __('Add New Category', 'academy')}
								</h3>
								<Formik
									enableReinitialize={true}
									initialValues={{
										...EMPTY_CATEGORY,
										...editSavedValue,
									}}
									onSubmit={onFormSubmitHandler}
								>
									{({ isSubmitting, resetForm }) => (
										<Form>
											<CreateCategory
												key={formInstanceKey}
												viewFrom={viewFrom}
											/>
											<div className="mt-4 flex items-center gap-3">
												<Button
													type="submit"
													isLoading={isSubmitting}
													label={
														isEditing
															? __(
																	'Update Category',
																	'academy'
																)
															: __(
																	'Add Category',
																	'academy'
																)
													}
												/>
												{isEditing && (
													<Button
														type="button"
														border="purple"
														onClick={() => {
															setEditSavedValue(
																{}
															);
															resetForm({
																values: EMPTY_CATEGORY,
															});
														}}
														label={__(
															'Cancel',
															'academy'
														)}
													/>
												)}
											</div>
										</Form>
									)}
								</Formik>
							</div>
						</div>
					)}
					<div className="min-w-0 flex-1 overflow-x-auto">
						<CategoryTable
							viewFrom={viewFrom}
							values={selectedTermLists}
							editItemHandler={onClickEditHandler}
							selectHandler={onCheckTermItemHandler}
							deleteHandler={deleteHandler}
						/>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default Category;
