import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { API, namespace } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

export const fetchAllTags = createAsyncThunk(
	'academy/fetchAllTags',
	(search = '', thunkAPI) => {
		try {
			let params = {
				per_page: 100,
			};
			if (search) {
				params = {
					...params,
					search,
				};
			}

			return API.get(namespace + 'academy_courses_Tag', {
				params,
			}).then((res) => {
				if (res.status === 200) {
					return {
						data: res.data,
					};
				}
				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message:
						res.data.message || res.data || 'Failed to fetch Tags',
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

export const fetchInCludedTags = createAsyncThunk(
	'academy/fetchInCludedTags',
	(include, thunkAPI) => {
		try {
			return API.get(namespace + 'academy_courses_Tag', {
				params: { include },
			}).then((res) => {
				if (res.status === 200) {
					return res.data;
				}
				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message:
						res.data.message || res.data || 'Failed to fetch Tags',
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

export const fetchIncludedFromSearch = createAsyncThunk(
	'academy/fetchIncludedFromSearch',
	(search, thunkAPI) => {
		try {
			return API.get(namespace + 'academy_courses_Tag', {
				params: { search },
			}).then((res) => {
				if (res.status === 200) {
					return res.data.find(
						(item) =>
							item.name.toLowerCase() === search.toLowerCase()
					);
				}
				// Handle case when success is false
				return thunkAPI.rejectWithValue({
					message:
						res.data.message || res.data || 'Failed to fetch Tags',
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

export const createNewTags = createAsyncThunk(
	'academy/createNewTags',
	(data, thunkAPI) => {
		try {
			return API.post(namespace + 'academy_courses_Tag', data).then(
				(res) => {
					if (res.status === 201) {
						thunkAPI.dispatch(
							showNotification({
								message: __(
									'Successfully Tag created.',
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
							message: __('Failed to create Tag.', 'academy'),
							isShow: true,
							type: 'error',
						})
					);
					return thunkAPI.rejectWithValue({
						message: __('Failed to create Tag.', 'academy'),
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
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

export const updateTag = createAsyncThunk(
	'academy/updateTag',
	(data, thunkAPI) => {
		try {
			return API.post(
				namespace + 'academy_courses_Tag/' + parseInt(data.id),
				data
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __('Successfully Tag updated.', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return res.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __('Failed to update Tag.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to update Tag.', 'academy'),
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

export const updateTagStatus = createAsyncThunk(
	'academy/updateTagStatus',
	(data, thunkAPI) => {
		try {
			return API.post(
				namespace + 'academy_courses_Tag/' + parseInt(data.id),
				data
			).then((res) => {
				if (res.status === 200) {
					thunkAPI.dispatch(
						showNotification({
							message: __(`Course Updated.`, 'academy'),
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

export const restoreTag = createAsyncThunk(
	'academy/restoreTag',
	(data, thunkAPI) => {
		const updatedData = { ...data, status: 'draft' };
		try {
			return API.post(
				namespace + 'academy_courses_Tag/' + parseInt(data.id),
				updatedData
			).then((res) => {
				if (res.status === 200) {
					dispatch(
						showNotification(
							__(`Tag Restored!`, 'academy'),
							true,
							'success'
						)
					);
					return res.data;
				}
				thunkAPI.dispatch(
					showNotification({
						message: __('Failed to restore Tag', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
				return thunkAPI.rejectWithValue({
					message: __('Failed to restore Tag.', 'academy'),
					success: false,
				});
			});
		} catch (e) {
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

export const moveToTrash = createAsyncThunk(
	'academy/moveToTrash',
	(ID, thunkAPI) => {
		try {
			return API.post(
				`${namespace}academy_courses_Tag/${parseInt(ID.id)}`,
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
							message: __(`Tag moved to trash!`, 'academy'),
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

export const deleteTag = createAsyncThunk(
	'academy/deleteTag',
	(ID, thunkAPI) => {
		try {
			return API.post(
				`${namespace}academy_courses_Tag/${parseInt(ID)}`,
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
							message: __(`Tag Deleted!`, 'academy'),
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

const tagSlice = createSlice({
	name: 'tags',
	initialState: {
		data: [],
		loading: false,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			// get All Tags
			.addCase(fetchAllTags.fulfilled, (state, action) => {
				state.data = action.payload.data;
			})
			// create new Tags
			.addCase(createNewTags.fulfilled, (state, action) => {
				if (!state.data.length) {
					state.data = [action.payload];
					return;
				}
				state.data = [action.payload, ...state.data];
			})
			.addCase(fetchInCludedTags.fulfilled, (state, action) => {
				if (!state.data.length) {
					state.data = [action.payload];
					return;
				}
				state.data = [...action.payload, ...state.data];
			})
			.addCase(fetchIncludedFromSearch.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchIncludedFromSearch.fulfilled, (state, action) => {
				if (action.payload) {
					if (!state.data.length) {
						state.data = [action.payload];
						state.loading = false;
						return;
					}
					state.data = [action.payload, ...state.data];
				}
				state.loading = false;
			})
			.addCase(fetchIncludedFromSearch.rejected, (state) => {
				state.loading = false;
			})
			// update Tags
			.addCase(updateTag.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// update Tags status
			.addCase(updateTagStatus.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// Restore Tags
			.addCase(restoreTag.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			// Move Tags To Trash
			.addCase(moveToTrash.fulfilled, (state, action) => {
				state.loading = false;
				const prepareData = state.data.reduce((acc, item) => {
					if (parseInt(item.parent) === parseInt(action.payload.id)) {
						item.parent = 0;
					}
					acc.push(item);
					return acc;
				}, []);
				state.data = prepareData.filter(
					(item) => parseInt(item.id) !== parseInt(action.payload.id)
				);
			})
			// Delete Tags
			.addCase(deleteTag.fulfilled, (state, action) => {
				state.loading = false;
				const prepareData = state.data.reduce((acc, item) => {
					if (parseInt(item.parent) === parseInt(action.payload.id)) {
						item.parent = 0;
					}
					acc.push(item);
					return acc;
				}, []);
				state.data = prepareData.filter(
					(item) => parseInt(item.id) !== parseInt(action.payload.id)
				);
			});
	},
});

export const { updateCurrentPage, updateItemPerPage } = tagSlice.actions;
export default tagSlice.reducer;
