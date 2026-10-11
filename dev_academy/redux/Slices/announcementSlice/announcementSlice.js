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

/**
 * @function createNewAnnouncement
 * @description Redux async thunk action creator that handles lesson creation through API.
 * @param {FormData} formData - Form data containing lesson details
 * @endpoint POST {namespace}lessons
 * @example dispatch(createNewAnnouncement({ formData: new FormData() }));
 * @example { status: 200, data: {} }
 * @example { message: string, success: false }
 * @fulfills {Object} API Response on success
 * @rejects {Object} Error object with message and success status
 * @dispatches - On Error: showNotification action with error message
 * @errorHandling
 * - Catches API errors and network failures
 * - Shows error notification with API error message or fallback message
 * - Returns standardized error object via rejectWithValue
 */

export const createAnnouncement = createAsyncThunk(
	'academy/createAnnouncement',
	async (formData, thunkAPI) => {
		try {
			// Awaited — a returned-but-unawaited `.then()` chain resolves
			// after this function has already returned, so a rejected
			// request (e.g. RestGuard's 403 when the user lacks
			// academy.announcements.create) never reached this catch, and
			// AnnouncementEditor's caller had no way to tell success from
			// failure (it wasn't even checking `payload.status`).
			const res = await API.post(`${namespace}academy_announcement`, {
				...formData,
			});
			if (201 === res.status) {
				thunkAPI.dispatch(
					showNotification({
						message: __(
							'Announcement Created Successfully',
							'academy'
						),
						isShow: true,
						type: 'success',
					})
				);
				// { data, status } — matching updateAnnouncement's shape below.
				// Callers gate success on `payload.status` being 200/201; this
				// used to resolve with the raw announcement object instead,
				// whose own `status` field is the WP post status ("publish"/
				// "draft"), never the number 201 — so that check was always
				// false for a create, and the create form never closed or
				// reset its dirty state, leaving the button clickable and
				// letting the same unchanged submission create duplicates.
				return { data: res.data, status: res.status };
			}
			return thunkAPI.rejectWithValue({
				message: __('Failed to create announcement', 'academy'),
				success: false,
			});
		} catch (error) {
			const message =
				error?.response?.data?.message ??
				error?.message ??
				__('Failed to create announcement', 'academy');
			thunkAPI.dispatch(
				showNotification({
					message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({ message, success: false });
		}
	}
);

/**
 * @function updateAnnouncement
 * @description Redux async thunk action creator that handles lesson creation through API.
 * @param {FormData} formData - Form data containing lesson details
 * @endpoint POST {namespace}lessons
 * @example  dispatch(createNewAnnouncement({ID, formData: new FormData() }));
 * @example { status: 200, data: {} }
 * @example { message: string, success: false }
 * @fulfills {Object} API Response on success
 * @rejects {Object} Error object with message and success status
 * @dispatches - On Error: showNotification action with error message
 * @errorHandling
 * - Catches API errors and network failures
 * - Shows error notification with API error message or fallback message
 * - Returns standardized error object via rejectWithValue
 */

export const updateAnnouncement = createAsyncThunk(
	'academy/updateAnnouncement',
	async (formData, thunkAPI) => {
		try {
			// Awaited — see createAnnouncement's comment above.
			const { data, status } = await API.post(
				`${namespace}academy_announcement/${parseInt(formData?.ID)}`,
				{
					...formData,
				}
			);
			if (200 === status) {
				thunkAPI.dispatch(
					showNotification({
						message: __('Announcement Updated!', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				return {
					data,
					status,
				};
			}
			return thunkAPI.rejectWithValue({
				message: __('Failed to update announcement!', 'academy'),
				success: false,
			});
		} catch (error) {
			const message =
				error?.response?.data?.message ??
				error?.message ??
				__('Failed to update announcement!', 'academy');
			thunkAPI.dispatch(
				showNotification({
					message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({ message, success: false });
		}
	}
);

/**
 * @function fetchAllAnnouncements
 * @description Redux async thunk action creator that retrieves lessons through the API with support for pagination, status filtering, and search.
 * @param {Object} params                - Query parameters
 * @param {string} [params.status='all'] - Filter lessons by status ('all', 'draft', 'publish', etc.)
 * @param {number} [params.page=1]       - Page number for pagination
 * @param {number} [params.per_page=10]  - Number of items per page
 * @param {string} [params.search='']    - Search term to filter lessons
 * @endpoint GET {namespace}lessons
 * @example dispatch(fetchAllAnnouncements({ status: 'publish', page: 1, per_page: 20, search: 'javascript' }));
 * @example { data: Array<Announcement>, totalItems: number, status: string }
 * @example  { message: string, success: false }
 * @fulfills {Object} Returns object containing:
 * - data: Array of lesson objects
 * - totalItems: Total number of lessons (from X-WP-Total header)
 * - status: Current filter status
 * @rejects {Object} Error object with message and success status
 * @dispatches - On Error: showNotification action with error message
 * @permissions
 * - Administrators: Can fetch all lessons
 * - Regular users: Can only fetch their own lessons (filtered by author)
 * @queryParams
 * - lesson_status: 'any' or specific status
 * - page: Pagination page number
 * - per_page: Items per page
 * - context: Set to 'edit'
 * - author: Added for non-admin users
 * - search: Optional search term
 * @errorHandling
 * - Catches API errors and network failures
 * - Shows error notification with API error message or fallback message
 * - Returns standardized error object via rejectWithValue
 */

export const fetchAllAnnouncements = createAsyncThunk(
	'academy/fetchAllAnnouncements',
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
			return API.get(`${namespace}academy_announcement`, {
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
				showNotification(
					e?.response?.data?.message ?? e?.message,
					true,
					'error'
				)
			);
			return thunkAPI.rejectWithValue({
				message: __('Failed to fetch lessons', 'academy'),
				success: false,
			});
		}
	}
);

/**
 * @function getAnnouncement
 * @description Redux async thunk action creator that retrieves a specific lesson through the API.
 * @param {number|string} ID       - The unique identifier of the lesson to fetch
 * @param {ThunkAPI}      thunkAPI - Redux Toolkit's thunk API object
 * @endpoint GET {namespace}lessons/${ID}
 * @example dispatch(getAnnouncement(123));
 * @example{ data: { id: number, title: string, content: string, }, status: 200 }
 * @example { message: string, success: false }
 * @fulfills {Object} Returns object containing:
 * - data: Announcement object with details
 * - status: HTTP status code
 * @rejects {Object} Error object with:
 * - message: Error message (localized)
 * - success: false
 * @dispatches - On Error: showNotification action with error details
 * @errorHandling
 * - Catches API errors and network failures
 * - Shows error notification with API error message or fallback
 * - Returns standardized error object via rejectWithValue
 */

export const getAnnouncement = createAsyncThunk(
	'academy/getAnnouncement',
	(ID, thunkAPI) => {
		try {
			return API.get(namespace + `lessons/${ID}`).then(
				({ data, status }) => {
					if (200 === status) {
						return {
							data,
							status,
						};
					}
					return thunkAPI.rejectWithValue({
						message: __('Failed to fetch lesson', 'academy'),
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
				message: __('Failed to fetch lesson', 'academy'),
				success: false,
			});
		}
	}
);

export const deleteAnnouncement = createAsyncThunk(
	'academy/deleteAnnouncement',
	async (formData, thunkAPI) => {
		try {
			// Awaited (not a bare returned promise) so a rejected request —
			// e.g. RestGuard's 403 when the user lacks
			// academy.announcements.delete — actually lands in this catch
			// instead of silently skipping it (see lessonSlice's
			// updateLesson for the full explanation of why an unawaited
			// `.then()` chain never triggers the surrounding try/catch).
			const { data, status } = await API.post(
				`${namespace}academy_announcement/${parseInt(formData.ID)}`,
				{ force: true },
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			);
			if (200 === status) {
				thunkAPI.dispatch(
					showNotification({
						message: __('Announcement Deleted!', 'academy'),
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
				message: __('Failed to delete announcement!', 'academy'),
				success: false,
			});
		} catch (error) {
			const message =
				error?.response?.data?.message ??
				error?.message ??
				__('Failed to delete announcement!', 'academy');
			thunkAPI.dispatch(
				showNotification({
					message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({ message, success: false });
		}
	}
);

export const moveAnnouncementToTrash = createAsyncThunk(
	'academy/moveAnnouncementToTrash',
	async ({ ID }, thunkAPI) => {
		try {
			// Awaited — see deleteAnnouncement's comment above.
			const { data, status } = await API.post(
				`${namespace}academy_announcement/${parseInt(ID)}`,
				{ force: false },
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			);
			if (200 === status) {
				thunkAPI.dispatch(
					showNotification({
						message: __(
							'Announcement moved to trash!',
							'academy'
						),
						isShow: true,
						type: 'success',
					})
				);
				return {
					data,
					status,
				};
			}
			return thunkAPI.rejectWithValue({
				message: __('Failed to trash announcement!', 'academy'),
				success: false,
			});
		} catch (error) {
			const message =
				error?.response?.data?.message ??
				error?.message ??
				__('Failed to trash announcement!', 'academy');
			thunkAPI.dispatch(
				showNotification({
					message,
					isShow: true,
					type: 'error',
				})
			);
			return thunkAPI.rejectWithValue({ message, success: false });
		}
	}
);

export const restoreAnnouncement = createAsyncThunk(
	'academy/restoreAnnouncement',
	async (formData, thunkAPI) => {
		const updatedFormData = { ...formData, status: 'draft' };

		try {
			const response = await API.post(
				`${namespace}academy_announcement/${parseInt(formData.id)}`,
				updatedFormData
			);

			if (response.status === 200) {
				thunkAPI.dispatch(
					showNotification({
						message: __(`Announcement Restored!`, 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				return response.data;
			}

			return thunkAPI.rejectWithValue({
				message: __('Failed to restore announcement', 'academy'),
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
				message: __('Failed to restore announcement', 'academy'),
				success: false,
			});
		}
	}
);

export const updateAnnouncementStatus = createAsyncThunk(
	'academy/updateAnnouncementStatus',
	({ ID, itemStatus }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/change_post_status',
				post_id: ID,
				status: itemStatus,
			}).then(({ data, status }) => {
				if (200 === status) {
					thunkAPI.dispatch(
						showNotification({
							message: __(
								`Announcement status updated`,
								'academy'
							),
							isShow: true,
							type: 'success',
						})
					);
					return {
						id: data.data,
						status: itemStatus,
					};
				}
				return thunkAPI.rejectWithValue({
					message: __('Failed to update status', 'academy'),
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
				message: __('Failed to update status', 'academy'),
				success: false,
			});
		}
	}
);

const announcementSlice = createSlice({
	name: 'announcement',
	initialState: {
		data: [],
		totalItems: 0,
		currentPage: 1,
		itemPerPage: 10,
		loading: false,
		// Tracks the requestId of the most recently *dispatched*
		// fetchAllAnnouncements call (see `pending` below). Clicking through
		// status tabs/pages quickly fires several of these concurrently, and
		// network timing gives no guarantee they resolve in the order they
		// were sent — without this, whichever one happened to finish last
		// wrote its `data` over a newer request's, showing results for a tab
		// the admin isn't even looking at anymore, with no visible error.
		currentRequestId: undefined,
	},
	reducers: {
		updateAnnouncementsCurrentPage: (state, actions) => {
			state.currentPage = actions.payload;
		},
		updateAnnouncementsItemPerPage: (state, actions) => {
			state.itemPerPage = actions.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllAnnouncements.pending, (state, action) => {
				state.status = true;
				state.currentRequestId = action.meta.requestId;
			})
			.addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
				// A stale response from an older, already-superseded request
				// — some *other* dispatch became "current" after this one
				// was sent. Ignore it: applying it now would overwrite the
				// newer request's still-loading state, or its own
				// already-applied results, with old data.
				if (state.currentRequestId !== action.meta.requestId) {
					return;
				}
				state.loading = false;
				state.data = action.payload.data;
				state.totalItems = action.payload.totalItems;
				state.status = action.payload.status;
			})
			.addCase(fetchAllAnnouncements.rejected, (state, action) => {
				if (state.currentRequestId !== action.meta.requestId) {
					return;
				}
				state.loading = false;
			})
			.addCase(createAnnouncement.fulfilled, (state, action) => {
				state.loading = false;
				state.totalItems = state.totalItems + 1;
				// createAnnouncement now resolves { data, status } (matching
				// updateAnnouncement below) rather than the raw announcement
				// object, so callers can tell an HTTP success from a
				// rejectWithValue by checking payload.status.
				state.data = [action.payload.data, ...state.data];
			})
			.addCase(updateAnnouncement.fulfilled, (state, action) => {
				state.loading = false;

				state.data = state.data.map((item) => {
					if (
						parseInt(item.id) ===
						parseInt(action?.payload?.data?.id)
					) {
						return { ...item, ...action?.payload?.data };
					}
					return item;
				});
			})
			.addCase(updateAnnouncementStatus.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (parseInt(item.id) === parseInt(action.payload.id)) {
						return { ...item, ...action.payload };
					}
					return item;
				});
			})
			.addCase(getAnnouncement.fulfilled, (state, action) => {
				state.loading = false;
				state.data = [action.payload.data, ...state.data];
			})
			.addCase(deleteAnnouncement.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.filter(
					(item) =>
						parseInt(item.id) !== parseInt(action.payload.data.id)
				);
			})
			.addCase(moveAnnouncementToTrash.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.map((item) => {
					if (
						parseInt(item.id) ===
						parseInt(action?.payload?.data?.id)
					) {
						return { ...item, ...action?.payload?.data };
					}
					return item;
				});
			})
			.addCase(restoreAnnouncement.fulfilled, (state, action) => {
				state.loading = false;
				state.data = state.data.filter(
					(item) => parseInt(item.id) !== parseInt(action.payload.id)
				);
			});
	},
});

export const {
	updateAnnouncementsItemPerPage,
	updateAnnouncementsCurrentPage,
} = announcementSlice.actions;
export default announcementSlice.reducer;
