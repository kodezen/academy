import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API, namespace, makeRequest } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';

export const getUser = createAsyncThunk('academy/getUser', (thunkAPI) => {
	try {
		return API.get('wp/v2/users/me').then((res) => {
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
});
export const updateUser = createAsyncThunk(
	'academy/updateUser',
	({ data }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/saved_user_info',
				...data,
			}).then((res) => {
				if (res?.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __('Settings Saved', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
				}
				return res.data.data;
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

export const fetchUserPurchaseHistory = createAsyncThunk(
	'academy/fetchUserPurchaseHistory',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/get_user_purchase_history',
			}).then((res) => {
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

const userSlice = createSlice({
	name: 'user',
	initialState: {
		is_frontend_collapsible_menu: false,
		is_frontend_responsive_menu: false,
	},
	reducers: {
		toggleFrontendCollapsibleMenu: (state, actions) => {
			state.is_frontend_collapsible_menu = actions.payload;
		},
		toggleFrontendResponsiveMenu: (state, actions) => {
			state.is_frontend_responsive_menu = actions.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// fetch user
			.addCase(getUser.fulfilled, (state, action) => {
				state.data = action.payload;
			})
			// update user
			.addCase(updateUser.fulfilled, (state, action) => {
				state.data = {
					...state.data,
					academy_meta: {
						...state.data.academy_meta,
						cover_photo: action.payload.academy_cover_photo,
						facebook_url: action.payload.academy_facebook_url,
						github_url: action.payload.academy_github_url,
						linkedin_url: action.payload.academy_linkedin_url,
						phone_number: action.payload.academy_phone_number,
						bio: action.payload.academy_profile_bio,
						designation: action.payload.academy_profile_designation,
						profile_photo: action.payload.academy_profile_photo,
						twitter_url: action.payload.academy_twitter_url,
						website_url: action.payload.academy_website_url,
						first_name: action.payload.first_name,
						last_name: action.payload.last_name,
					},
				};
			})
			// fetch User Purchase History
			.addCase(fetchUserPurchaseHistory.fulfilled, (state, action) => {
				state.order = action.payload.data;
			});
	},
});

export const { toggleFrontendCollapsibleMenu, toggleFrontendResponsiveMenu } =
	userSlice.actions;
export default userSlice.reducer;
