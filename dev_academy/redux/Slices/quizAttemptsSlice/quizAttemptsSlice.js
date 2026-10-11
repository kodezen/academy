import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
	API,
	academy_nonce,
	makeRequest,
	namespace,
	ajaxurl,
	is_admin,
	current_user_can,
	current_user_id,
} from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

export const getAllQuizAttempts = createAsyncThunk(
	'academy/getAllQuizAttempts',
	(
		{ status = 'publish', page = 1, per_page = 10, search = '' },
		thunkAPI
	) => {
		try {
			let params = {
				page,
				per_page,
				search,
			};

			if (status !== 'all') {
				params = {
					...params,
				};
			}

			if (
				(!is_admin || current_user_can.manage_options === false) &&
				!current_user_can.manage_academy_manager
			) {
				params = {
					...params,
					author: current_user_id,
				};
			}

			if (search) {
				params = {
					...params,
					search,
				};
			}

			const path = namespace + 'quiz_attempts';
			return API.get(path, {
				params,
			}).then((res) => {
				if (res.status === 200) {
					return {
						data: res.data,
						totalItems: parseInt(res.headers['x-wp-total']),
						status,
					};
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to fetch quiz attempts',
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
			return thunkAPI.rejectWithValue({
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

export const updateQuizAttempt = createAsyncThunk(
	'academy/updateQuizAttempt',
	(params, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_quizzes/quiz_answer_manual_review',
				answer_id: params.attempt_answer_id,
				attempt_id: params.attempt_id,
				question_id: params.question_id,
				quiz_id: params.quiz_id,
				user_id: params.user_id,
				mark_as: params.mark_as,
			}).then((res) => {
				if (res.status === 200) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to update quiz attempts',
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
			return thunkAPI.rejectWithValue({
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

export const deleteQuizAttempt = createAsyncThunk(
	'academy/deleteQuizAttempt',
	(params, thunkAPI) => {
		try {
			const path = namespace + 'quiz_attempts';
			return API.post(
				`${path}/${parseInt(params.ID)}`,
				{
					force: true,
				},
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __('Quiz Attempt removed!', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to delete quiz attempt',
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
			return thunkAPI.rejectWithValue({
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

export const getQuizAttemptAnswers = createAsyncThunk(
	'academy/getQuizAttemptAnswers',
	({ ID, courseId, userId = 0 }, thunkAPI) => {
		try {
        const form_data = new FormData(); // eslint-disable-line
			form_data.append(
				'action',
				'academy_quizzes/get_student_quiz_attempt_details'
			);
			form_data.append('security', academy_nonce);
			form_data.append('attempt_id', ID);
			form_data.append('course_id', courseId);
			if (userId) {
				form_data.append('user_id', userId);
			}
			// eslint-disable-next-line
        return axios.post(ajaxurl, form_data).then((res) => {
				return res.data.data;
			});
		} catch (error) {
			thunkAPI.dispatch(
				showNotification({
					message: error?.response?.data?.message ?? error?.message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

const quizAttemptsSlice = createSlice({
	name: 'quizAttempts',
	initialState: {
		data: [],
		totalItems: 0,
		currentPage: 1,
		itemsPerPage: 10,
		isLoading: false,
	},
	reducers: {
		updateQuizAttemptsFeedBack: (state, action) => {
			state.data = state.data.map((item) => {
				if (
					parseInt(item.attempt_id) ===
					parseInt(action.payload.attempt_id)
				) {
					const parsedInfo =
						item?.attempt_info !== '' &&
						typeof item?.attempt_info !== 'object'
							? JSON.parse(item?.attempt_info)
							: item?.attempt_info;
					return {
						...item,
						attempt_info: {
							...parsedInfo,
							instructor_feedback:
								action.payload.instructor_feedback,
						},
					};
				}
				return item;
			});
		},
		updateQuizAttemptsPerPage: (state, action) => {
			state.itemsPerPage = action.payload;
		},
		updateQuizAttemptsCurrentPage: (state, action) => {
			state.currentPage = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// get all quiz attempts
			.addCase(getAllQuizAttempts.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(getAllQuizAttempts.fulfilled, (state, action) => {
				state.isLoading = false;
				state.data = action.payload.data;
				state.totalItems = action.payload.totalItems;
			})
			.addCase(getAllQuizAttempts.rejected, (state, action) => {
				state.isLoading = false;
			})
			// update quiz attempt
			.addCase(updateQuizAttempt.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(updateQuizAttempt.fulfilled, (state, action) => {
				state.isLoading = false;
				state.data = state.data.map((item) => {
					if (
						parseInt(item.attempt_id) ===
						parseInt(action.payload.attempt_id)
					) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			.addCase(updateQuizAttempt.rejected, (state, action) => {
				state.isLoading = false;
			})
			// delete quiz attempt
			.addCase(deleteQuizAttempt.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(deleteQuizAttempt.fulfilled, (state, action) => {
				state.isLoading = false;
				state.data = state.data.filter(
					(item) =>
						parseInt(item.attempt_id) !== parseInt(action.payload)
				);
			})
			.addCase(deleteQuizAttempt.rejected, (state) => {
				state.isLoading = false;
			});
	},
});

export const {
	updateQuizAttemptsFeedBack,
	updateQuizAttemptsPerPage,
	updateQuizAttemptsCurrentPage,
} = quizAttemptsSlice.actions;
export default quizAttemptsSlice.reducer;
