import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API, namespace } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

export const fetchQuestions = createAsyncThunk(
	'academy/fetchQuestions',
	(thunkAPI) => {
		try {
			return API.get(
				namespace +
					'quiz_questions?status=draft,publish,pending,future&per_page=100'
			).then((res) => {
				if (res.status === 200) {
					return res.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to fetch quiz question',
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

export const fetchQuestionBank = createAsyncThunk(
	'academy/fetchQuestionBank',
	(
		{
			search = '',
			question_type = '',
			question_level = '',
			orderby = 'question_created_at',
			order = 'DESC',
			page = 1,
			per_page = 10,
		} = {},
		thunkAPI
	) => {
		try {
			const params = new URLSearchParams({
				per_page,
				page,
				...(search && { search }),
				...(question_type && { question_type }),
				...(question_level && { question_level }),
				orderby,
				order,
			});
			return API.get(
				`${namespace}quiz_questions?${params.toString()}`
			).then((res) => {
				if (res.status === 200) {
					return {
						data: res.data,
						total: parseInt(res.headers['x-wp-total'] ?? 0, 10),
						totalPages: parseInt(
							res.headers['x-wp-totalpages'] ?? 1,
							10
						),
					};
				}
				return thunkAPI.rejectWithValue({
					message:
						res.data?.message || 'Failed to fetch question bank',
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

export const importQuestions = createAsyncThunk(
	'academy/importQuestions',
	(rows, thunkAPI) => {
		try {
			return API.post(`${namespace}quiz_questions/import`, rows).then(
				(res) => {
					if (res.status === 200) {
						return res.data;
					}
					return thunkAPI.rejectWithValue({
						message:
							res.data?.message || 'Failed to import questions',
					});
				}
			);
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

export const getQuestion = createAsyncThunk(
	'academy/getQuestion',
	(ID, thunkAPI) => {
		try {
			return API.get(namespace + 'quiz_questions/' + ID).then((res) => {
				if (res.status === 200) {
					return res.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get a quiz question',
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

export const createQuestion = createAsyncThunk(
	'academy/createQuestion',
	(formData, thunkAPI) => {
		try {
			const path = formData?.id
				? namespace + 'quiz_questions/' + formData?.id
				: namespace + 'quiz_questions';

			return API.post(path, formData).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: 'Quiz question created successfully',
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				const message =
					res.data?.message || 'Failed to create new quiz question';
				thunkAPI.dispatch(
					showNotification({
						message,
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({ message });
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

export const updateQuestion = createAsyncThunk(
	'academy/updateQuestion',
	(formData, thunkAPI) => {
		try {
			return API.post(
				namespace + 'quiz_questions/' + parseInt(formData.question_id),
				formData
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: 'Quiz question updated successfully',
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				const message =
					res.data?.message || 'Failed to update quiz question';
				thunkAPI.dispatch(
					showNotification({
						message,
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({ message });
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

export const deleteQuestion = createAsyncThunk(
	'academy/deleteQuestion',
	(formData, thunkAPI) => {
		try {
			return API.post(
				namespace + 'quiz_questions/' + id,
				{ force: true },
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			).then((res) => {
				if (res.status === 201) {
					thunkAPI.dispatch(
						showNotification({
							message: 'Quiz question updated successfully',
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to update quiz question',
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

const quizQuestionSlice = createSlice({
	name: 'quizQuestion',
	initialState: {
		data: [],
		loading: false,
		bank: {
			data: [],
			total: 0,
			totalPages: 1,
			loading: false,
		},
	},
	extraReducers: (builder) => {
		builder
			// create a quiz question
			.addCase(createQuestion.pending, (state) => {
				state.loading = true;
			})
			.addCase(createQuestion.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [action.payload, ...state.data];
			})
			.addCase(createQuestion.rejected, (state) => {
				state.loading = false;
			})
			// update a quiz question
			.addCase(updateQuestion.pending, (state) => {
				state.loading = true;
			})
			.addCase(updateQuestion.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (
						parseInt(item.question_id) ===
						parseInt(action.payload.question_id)
					) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			.addCase(updateQuestion.rejected, (state) => {
				state.loading = false;
			})
			// fetch all quiz questions
			.addCase(fetchQuestions.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchQuestions.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload;
			})
			.addCase(fetchQuestions.rejected, (state) => {
				state.loading = false;
			})
			// get a quiz question
			.addCase(getQuestion.pending, (state) => {
				state.loading = true;
			})
			.addCase(getQuestion.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [action.payload];
			})
			.addCase(getQuestion.rejected, (state) => {
				state.loading = false;
			})
			// question bank fetch
			.addCase(fetchQuestionBank.pending, (state) => {
				state.bank.loading = true;
			})
			.addCase(fetchQuestionBank.fulfilled, (state, action) => {
				state.bank.loading = false;
				state.bank.data = action.payload.data;
				state.bank.total = action.payload.total;
				state.bank.totalPages = action.payload.totalPages;
			})
			.addCase(fetchQuestionBank.rejected, (state) => {
				state.bank.loading = false;
			})
			// import questions
			.addCase(importQuestions.pending, (state) => {
				state.bank.loading = true;
			})
			.addCase(importQuestions.fulfilled, (state) => {
				state.bank.loading = false;
			})
			.addCase(importQuestions.rejected, (state) => {
				state.bank.loading = false;
			});
	},
});
export default quizQuestionSlice.reducer;
