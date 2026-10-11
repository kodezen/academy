import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
	API,
	current_user_can,
	current_user_id,
	namespace,
	is_admin,
	makeRequest,
} from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

export const fetchAllWithdraw = createAsyncThunk(
	'academy/fetchAllWithdraw',
	({ status = 'publish', page = 1, per_page = 10 }, thunkAPI) => {
		try {
			const params = {
				status: status === 'all' ? 'any' : status,
				page,
				per_page,
			};

			return makeRequest({
				action: 'academy_multi_instructor/get_all_withdraw_request',
				...params,
			}).then((res) => {
				if (res.status === 200) {
					return {
						data: res.data.data,
						totalItems: parseInt(res.headers['x-wp-total']),
						status,
					};
				}
				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to fetch withdraw',
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

export const updateWithdraw = createAsyncThunk(
	'academy/updateWithdraw',
	(args, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_multi_instructor/update_withdraw_status',
				...args,
			}).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								'Successfully withdraw updated.',
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
						message: __('Failed to update withdraw.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to update withdraw.', 'academy'),
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

const withdrawSlice = createSlice({
	name: 'withdraw',
	initialState: {
		data: false,
		totalItems: 0,
		currentPage: 1,
		loading: false,
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
			// get All Course
			.addCase(fetchAllWithdraw.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchAllWithdraw.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload.data;
				state.totalItems = action.payload.totalItems;
				state.status = action.payload.status;
			})
			.addCase(fetchAllWithdraw.rejected, (state) => {
				state.loading = false;
			})
			// update Course
			.addCase(updateWithdraw.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.ID) === parseInt(action.payload.ID)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			});
	},
});

export const { updateCurrentPage, updateItemPerPage } = withdrawSlice.actions;
export default withdrawSlice.reducer;
