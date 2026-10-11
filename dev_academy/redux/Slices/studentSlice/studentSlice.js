import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeRequest } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

export const fetchAllEnrolledStudents = createAsyncThunk(
	'academy/fetchAllEnrolledStudents',
	(thunkAPI) => {
		try {
			let form_data = new FormData(); // eslint-disable-line
			form_data.append('action', 'academy/get_enrolled_students');
			form_data.append('security', academy_nonce);
			axios.post(ajaxurl, form_data).then((response) => {
				if (response.data) {
					return {
						data: res.data.data,
						totalItems: parseInt(res.headers['x-wp-total']),
					};
				}

				return thunkAPI.rejectWithValue({
					message: __('Failed to fetch students', 'academy'),
				});
			});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

export const getAllStudents = createAsyncThunk(
	'academy/getAllStudents',
	({ page = 1, per_page = 10, search = '', course_id = 0 }, thunkAPI) => {
		try {
			let params = {
				page,
				per_page,
			};
			if (search) {
				params = {
					...params,
					search,
				};
			}
			if (course_id) {
				params = {
					...params,
					course_id,
				};
			}
			return makeRequest({
				action: 'academy/get_all_students',
				...params,
			}).then((res) => {
				if (res.data.success) {
					return {
						data: res.data.data,
						totalItems: parseInt(res.headers['x-wp-total']),
					};
				}
				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to fetch students',
				});
			});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

export const registerStudent = createAsyncThunk(
	'academy/registerStudent',
	({ values }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/register_student',
				...values,
			}).then((res) => {
				if (res.data.success) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								'Student registered successfully',
								'academy'
							),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __(res.data.data[0], 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to register student.', 'academy'),
					success: false,
				});
			});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

export const deleteStudent = createAsyncThunk(
	'academy/deleteStudent',
	({ ID }, thunkAPI) => {
		try {
			return makeRequest({
				action: `academy/remove_student`,
				student_id: parseInt(ID),
			}).then((res) => {
				if (res.data.success) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								'Student removed successfully',
								'academy'
							),
							isShow: true,
							type: 'success',
						})
					);
					return res.data.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __(
							'Sorry, You need to cancel all enrollment before remove student',
							'academy'
						),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __(
						'Sorry, You need to cancel all enrollment before remove student',
						'academy'
					),
					success: false,
				});
			});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

export const updateEnrolledStatus = createAsyncThunk(
	'academy/updateEnrolledStatus',
	({ course_id, enrolled_id, student_id, status }, thunkAPI) => {
		try {
			const params = {
				course_id,
				enrolled_id,
				student_id,
				status,
			};
			return makeRequest({
				action: 'academy/update_enrollment_status',
				...params,
			}).then((res) => {
				if (res.data.success) {
					thunkAPI.dispatch(
						showNotification({
							message: res.data.data,
							isShow: true,
							type: 'success',
						})
					);
					return { ...params };
				}
				thunkAPI.dispatch(
					showNotification({
						message: res.data.data,
						isShow: true,
						type: 'error',
					})
				);

				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message: res.data.message || '',
				});
			});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

const studentSlice = createSlice({
	name: 'student',
	initialState: {
		data: false,
		totalItems: 0,
		current_page: 1,
		loading: false,
	},
	reducers: {
		updateStudentCurrentPage: (state, actions) => {
			state.current_page = actions.payload;
		},
		updateStudentItemPerPage: (state, actions) => {
			state.itemPerPage = actions.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// fetch All Enrolled Students
			.addCase(fetchAllEnrolledStudents.fulfilled, (state, action) => {
				state.loading = false;
				state.analytics = action.payload;
			})
			// get All Students
			.addCase(getAllStudents.pending, (state) => {
				state.loading = true;
			})
			.addCase(getAllStudents.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload.data;
				state.totalItems = action.payload.totalItems;
			})
			.addCase(getAllStudents.rejected, (state) => {
				state.loading = false;
			})
			// register Student
			.addCase(registerStudent.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [action.payload.data.data, ...state.data];
			})
			// delete Student
			.addCase(deleteStudent.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [
					...state.data.filter(
						(item) => parseInt(item.ID) !== parseInt(action.payload)
					),
				];
			})
			//Update Status
			.addCase(updateEnrolledStatus.fulfilled, (state, action) => {
				const { student_id, status, enrolled_id } = action.payload;

				const student = state.data.find(
					(student) => parseInt(student.ID) === parseInt(student_id)
				);

				if (student) {
					const enrolledCourse = student.enrolled_courses.find(
						(course) =>
							parseInt(course.enrolled_id) ===
							parseInt(enrolled_id)
					);

					if (enrolledCourse) {
						enrolledCourse.status = status;
					}
				}
			});
	},
});

export const { updateStudentItemPerPage, updateStudentCurrentPage } =
	studentSlice.actions;
export default studentSlice.reducer;
