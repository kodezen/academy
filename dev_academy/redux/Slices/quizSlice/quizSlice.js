import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
	API,
	current_user_can,
	current_user_id,
	namespace,
	is_admin,
	is_plain_permalink,
} from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

// Numeric quiz settings the server stores as integers. An empty or invalid value
// (e.g. a cleared Time Limit) would be rejected with a 400, so send a safe number.
const QUIZ_INT_META = {
	academy_quiz_time: [0, Infinity],
	academy_quiz_passing_grade: [0, 100],
	academy_quiz_max_attempts_allowed: [0, Infinity],
	academy_quiz_max_questions_for_answer: [0, Infinity],
};

export const normalizeQuizData = (data) => {
	if (!data?.meta) {
		return data;
	}
	const meta = { ...data.meta };
	Object.entries(QUIZ_INT_META).forEach(([key, [min, max]]) => {
		if (key in meta) {
			const n = Math.trunc(Number(meta[key]));
			meta[key] = Number.isFinite(n) ? Math.min(Math.max(n, min), max) : 0;
		}
	});
	return { ...data, meta };
};

// axios rejections are async, so a try/catch around the promise never sees them.
const handleQuizError = (error, thunkAPI) => {
	const message =
		error?.response?.data?.message ??
		error?.message ??
		__('Something went wrong. Please try again.', 'academy');
	thunkAPI.dispatch(
		showNotification({ message, isShow: true, type: 'error' })
	);
	return thunkAPI.rejectWithValue({ message });
};

export const fetchQuizzes = createAsyncThunk(
	'academy/fetchQuizzes',
	({ status = 'all', page = 1, per_page = 10, search = '' }, thunkAPI) => {
		try {
			let params = {
				status: status === 'all' ? 'any' : status,
				page,
				per_page,
				context: 'edit',
			};

			if (
				(!is_admin || current_user_can.manage_options === false) &&
				!current_user_can.manage_academy_manager
			)
				params = { ...params, author: current_user_id };
			if (search) params = { ...params, search };

			return API.get(namespace + 'academy_quiz', {
				params,
			}).then((res) => {
				if (res.status === 200) {
					return {
						data: res.data,
						totalItems: parseInt(res.headers['x-wp-total']),
						status,
					};
				}
				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to fetch quiz',
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

export const getQuiz = createAsyncThunk('academy/getQuiz', (ID, thunkAPI) => {
	try {
		const queryString = is_plain_permalink ? '&' : '?';
		return API.post(
			namespace + 'academy_quiz/' + ID + queryString + 'context=edit'
		).then((res) => {
			if (res.status === 200) {
				return res.data;
			}
			thunkAPI.dispatch(
				showNotification({
					message: __('Failed to fetch quiz.', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({
				message: __('Failed to fetch quiz.', 'academy'),
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
		return thunkAPI.rejectWithValue({
			message: error?.response?.data?.message ?? error?.message,
		});
	}
});

export const createQuiz = createAsyncThunk(
	'academy/createQuiz',
	(data, thunkAPI) => {
		try {
			return API.post(namespace + 'academy_quiz', normalizeQuizData(data)).then((res) => {
				if (res.status === 201) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								'Successfully quiz created.',
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
						message: __('Failed to create quiz.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to create quiz.', 'academy'),
					success: false,
				});
			}).catch((error) => handleQuizError(error, thunkAPI));
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

export const updateQuiz = createAsyncThunk(
	'academy/updateQuiz',
	(params, thunkAPI) => {
		try {
			return API.post(
				namespace + 'academy_quiz/' + params.id,
				normalizeQuizData(params)
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								'Successfully quiz updated.',
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
						message: __('Failed to update quiz.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to update quiz.', 'academy'),
					success: false,
				});
			}).catch((error) => handleQuizError(error, thunkAPI));
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

export const quizStatusUpdate = createAsyncThunk(
	'academy/quizStatusUpdate',
	(params, thunkAPI) => {
		try {
			return API.post(
				namespace + 'academy_quiz/' + params.id,
				params
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(`Quiz status Updated.`, 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __('Failed to update status', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to update status.', 'academy'),
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
			return thunkAPI.rejectWithValue({
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

export const restoreQuiz = createAsyncThunk(
	'academy/restoreQuiz',
	(id, thunkAPI) => {
		const updatedFormData = { ...id, status: 'draft' };
		try {
			return API.post(
				namespace + 'academy_quiz/' + id,
				updatedFormData
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(`Quiz Restored!`, 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __('Failed to restore Quiz', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to restore Quiz.', 'academy'),
					success: false,
				});
			});
		} catch (e) {
			thunkAPI.dispatch(
				showNotification({
					message: e?.response?.data?.message ?? e?.message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({
				message: e?.response?.data?.message ?? e?.message,
			});
		}
	}
);

export const moveQuizToTrash = createAsyncThunk(
	'academy/moveQuizToTrash',
	(params, thunkAPI) => {
		try {
			return API.post(
				`${namespace}academy_quiz/${parseInt(params.ID)}`,
				{ force: false },
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(`Quiz moved to trash!`, 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __('Failed to moved to trash.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to moved to trash.', 'academy'),
					success: false,
				});
			});
		} catch (e) {
			thunkAPI.dispatch(
				showNotification({
					message: e?.response?.data?.message ?? e?.message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({
				message: e?.response?.data?.message ?? e?.message,
			});
		}
	}
);

export const deleteQuiz = createAsyncThunk(
	'academy/deleteQuiz',
	(id, thunkAPI) => {
		try {
			return API.post(
				namespace + 'academy_quiz/' + id,
				{ force: true },
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(`Course Deleted!`, 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return res.data.previous;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __('Failed to delete.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to delete.', 'academy'),
					success: false,
				});
			});
		} catch (e) {
			thunkAPI.dispatch(
				showNotification({
					message: e?.response?.data?.message ?? e?.message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({
				message: e?.response?.data?.message ?? e?.message,
			});
		}
	}
);

const quizSlice = createSlice({
	name: 'quizzes',
	initialState: {
		data: false,
		totalItems: 0,
		currentPage: 1,
		loading: false,
		itemPerPage: 10,
	},
	reducers: {
		updateCurrentPage: (state, actions) => {
			state.currentPage = actions.payload;
		},
		updateItemPerPage: (state, actions) => {
			state.itemPerPage = actions.payload;
		},
		clearCourseState: (state) => {
			state.data = false;
		},
	},
	extraReducers: (builder) => {
		builder
			// get All quiz
			.addCase(fetchQuizzes.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchQuizzes.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload.data;
				state.totalItems = action.payload.totalItems;
				state.status = action.payload.status;
			})
			.addCase(fetchQuizzes.rejected, (state) => {
				state.loading = false;
			})
			// get new quiz
			.addCase(getQuiz.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [
					action.payload,
					...(Array.isArray(state.data) ? state.data : []),
				];
			})
			// create new quiz
			.addCase(createQuiz.fulfilled, (state, action) => {
				state.loading = false;
				if (!state.data) {
					state.data = [action.payload];
					return;
				}
				state.data = [action.payload, ...state.data];
			})
			// update quiz
			.addCase(updateQuiz.fulfilled, (state, action) => {
				state.loading = false;
				if (!Array.isArray(state.data)) {
					return;
				}
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// update Course quiz
			.addCase(quizStatusUpdate.fulfilled, (state, action) => {
				state.loading = false;
				if (!Array.isArray(state.data)) {
					return;
				}
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// Restore quiz
			.addCase(restoreQuiz.fulfilled, (state, action) => {
				state.loading = false;
				if (!Array.isArray(state.data)) {
					return;
				}
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// Move quiz To Trash
			.addCase(moveQuizToTrash.fulfilled, (state, action) => {
				state.loading = false;
				if (!Array.isArray(state.data)) {
					return;
				}
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// Delete quiz
			.addCase(deleteQuiz.fulfilled, (state, action) => {
				state.loading = false;
				if (!Array.isArray(state.data)) {
					return;
				}
				state.data = state.data.filter(
					(item) => parseInt(item.id) !== parseInt(action.payload.id)
				);
			});
	},
});

export const { updateCurrentPage, updateItemPerPage } = quizSlice.actions;
export default quizSlice.reducer;
