import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
	API,
	current_user_can,
	current_user_id,
	namespace,
	is_admin,
} from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

export const createNewHooks = createAsyncThunk(
	'academy/createNewHooks',
	(formData, thunkAPI) => {
		try {
			return API.post(`${namespace}academy_webhook`, {
				...formData,
			}).then((res) => {
				if (201 === res.status) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								'WebHook Created Successfully',
								'academy'
							),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				return thunkAPI.rejectWithValue({
					message: __('Failed to create WebHook', 'academy'),
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
				message: __('Failed to create WebHook', 'academy'),
				success: false,
			});
		}
	}
);

export const updateHooks = createAsyncThunk(
	'academy/updateHooks',
	async ({ id, formData }, thunkAPI) => {
		try {
			const { data, status } = await API.post(
				`${namespace}academy_webhook/${parseInt(id)}`,
				formData
			);

			if (200 === status) {
				thunkAPI.dispatch(
					showNotification({
						message: __('WebHook Updated', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				return data;
			}
			return thunkAPI.rejectWithValue({
				message: __('Failed to update WebHook', 'academy'),
				success: false,
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
				message: __('Failed to update WebHook', 'academy'),
				success: false,
			});
		}
	}
);

export const updateHooksStatus = createAsyncThunk(
	'academy/updateHooksStatus',
	async (formData, thunkAPI) => {
		try {
			const { data, status } = await API.post(
				`${namespace}academy_webhook/${parseInt(formData.id)}`,
				formData
			);

			if (status === 200) {
				thunkAPI.dispatch(
					showNotification({
						message: __('WebHook Status Updated', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				return data;
			}
			return thunkAPI.rejectWithValue({
				message: __('Failed to update WebHook status', 'academy'),
				success: false,
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
				message: __('Failed to update WebHook status', 'academy'),
				success: false,
			});
		}
	}
);

export const fetchAllHooks = createAsyncThunk(
	'academy/fetchAllHooks',
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
			return API.get(`${namespace}academy_webhook`, {
				params,
			}).then((res) => {
				return {
					data: res?.data,
					totalItems: parseInt(res.headers['x-wp-total']),
					status,
				};
			});
		} catch (e) {
			dispatch(
				showNotification({
					message: e?.response?.data?.message ?? e?.message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({
				message: __('Failed to fetch Webhook', 'academy'),
				success: false,
			});
		}
	}
);

export const getHooks = createAsyncThunk(
	'academy/getAnnouncement',
	(ID, thunkAPI) => {
		try {
			return API.get(namespace + `academy_webhook/${parseInt(ID)}`).then(
				({ data, status }) => {
					if (200 === status) {
						return {
							data,
							status,
						};
					}
					return thunkAPI.rejectWithValue({
						message: __('Failed to fetch WebHook', 'academy'),
						success: false,
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
				message: __('Failed to fetch WebHook', 'academy'),
				success: false,
			});
		}
	}
);

export const deleteHooks = createAsyncThunk(
	'academy/deleteHooks',
	(params, thunkAPI) => {
		try {
			return API.post(
				`${namespace}academy_webhook/${parseInt(params.ID)}`,
				{ force: true },
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			).then(({ data, status }) => {
				if (200 === status) {
					thunkAPI.dispatch(
						showNotification({
							message: __('WebHook Deleted!', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return {
						data: data.previous,
						status,
					};
				}
				return thunkAPI.rejectWithValue({
					message: __('Failed to fetch WebHook!', 'academy'),
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
				message: __('Failed to fetch WebHook!', 'academy'),
				success: false,
			});
		}
	}
);

const webHooksSlice = createSlice({
	name: 'webHooks',
	initialState: {
		data: [],
		totalItems: 0,
		currentPage: 1,
		itemPerPage: 10,
		loading: false,
	},
	reducers: {
		updateHooksCurrentPage: (state, actions) => {
			state.currentPage = actions.payload;
		},
		updateHooksItemPerPage: (state, actions) => {
			state.itemPerPage = actions.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllHooks.pending, (state) => {
				state.status = true;
			})
			.addCase(fetchAllHooks.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload.data;
				state.totalItems = action.payload.totalItems;
				state.status = action.payload.status;
			})
			.addCase(fetchAllHooks.rejected, (state) => {
				state.loading = false;
			})
			.addCase(createNewHooks.fulfilled, (state, action) => {
				state.loading = false;
				state.totalItems = state.totalItems + 1;
				state.data = [action.payload, ...state.data];
			})
			.addCase(updateHooks.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			.addCase(updateHooksStatus.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			.addCase(getHooks.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [action.payload.data, ...state.data];
			})
			.addCase(deleteHooks.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.filter(
					(item) =>
						parseInt(item.id) !== parseInt(action.payload.data.id)
				);
			});
	},
});

export const { updateHooksCurrentPage, updateHooksItemPerPage } =
	webHooksSlice.actions;
export default webHooksSlice.reducer;
