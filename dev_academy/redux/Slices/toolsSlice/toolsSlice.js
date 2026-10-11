import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { menu, makeRequest } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';

export const getAcademyStatus = createAsyncThunk(
	'academy/getAcademyStatus',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/fetch_academy_status',
			}).then((res) => {
				return res?.data?.data;
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

export const getAcademyPages = createAsyncThunk(
	'academy/getAcademyPages',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/fetch_academy_pages',
			}).then((res) => {
				return res?.data?.data;
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

const toolsSlice = createSlice({
	name: 'tools',
	initialState: {
		loading: true,
	},
	extraReducers: (builder) => {
		builder
			// fetch status
			.addCase(getAcademyStatus.pending, (state) => {
				state.loading = true;
			})
			.addCase(getAcademyStatus.fulfilled, (state, action) => {
				state.loading = false;
				state.status = action.payload;
			})
			.addCase(getAcademyStatus.rejected, (state) => {
				state.loading = false;
			})
			// fetch pages
			.addCase(getAcademyPages.pending, (state) => {
				state.loading = true;
			})
			.addCase(getAcademyPages.fulfilled, (state, action) => {
				state.loading = false;
				state.pages = action.payload;
			})
			.addCase(getAcademyPages.rejected, (state) => {
				state.loading = false;
			});
	},
});

export default toolsSlice.reducer;
