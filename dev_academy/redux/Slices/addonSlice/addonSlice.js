import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API } from '@Utils/helper';
import { addons as allAddons, makeRequest } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';

export const fetchAddons = createAsyncThunk(
	'academy/fetchAddons',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/addons/get_all_addons',
			}).then((res) => {
				if (!res.data?.success) {
					thunkAPI.dispatch(
						showNotification({
							message:
								res.data?.data?.message ??
								__('Some thing went wrong', 'academy'),
							isShow: true,
							type: 'error',
						})
					);
					return res.data;
				}
				return res.data;
			});
		} catch (e) {
			thunkAPI.dispatch(
				showNotification({
					message: e?.response?.data?.message ?? e?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);
export const saveAddon = createAsyncThunk(
	'academy/saveAddon',
	({ addon, status }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/addons/saved_addon_status',
				addon_name: addon.label,
				addon_slug: addon.name,
				status,
				required_plugin: addon.required_plugin,
			}).then((res) => {
				if (!res.data?.success) {
					thunkAPI.dispatch(
						showNotification({
							message: res?.data.data,
							isShow: true,
							type: 'error',
						})
					);
					return res.data;
				}
				return res.data;
			});
		} catch (e) {
			thunkAPI.dispatch(
				showNotification({
					message: e?.response?.data?.message ?? e?.message,
					isShow: true,
					type: 'error',
				})
			);
		}
	}
);

const addonSlice = createSlice({
	name: 'addons',
	initialState: allAddons,
	extraReducers: (builder) => {
		builder
			.addCase(fetchAddons.fulfilled, (state, action) => {
				if (action.payload.success) {
					return action.payload.data;
				}
			})
			.addCase(saveAddon.fulfilled, (state, action) => {
				if (action.payload.success) {
					return action.payload.data;
				}
			});
	},
});

export default addonSlice.reducer;
