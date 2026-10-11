import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API, namespace, makeRequest, makeRequest2 } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';
import { __ } from '@wordpress/i18n';

export const fetchSettings = createAsyncThunk(
	'academy/fetchSettings',
	(thunkAPI) => {
		try {
			return API.get(namespace + 'settings').then((res) => {
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

export const updateSettings = createAsyncThunk(
	'academy/updateSettings',
	async (
		{
			values,
			action = 'update_base_settings',
			prefix = 'academy',
			childObjectKey = '',
			isCertificate = false,
		},
		thunkAPI
	) => {
		try {
			const formValues = Object.entries(values).reduce(
				(acc, [key, value]) => {
					if (value !== undefined && value !== 'undefined') {
						acc[key] = value;
					}
					return acc;
				},
				{}
			);

			const res = await makeRequest({
				action: prefix + '/' + action,
				...formValues,
			});

			if (isCertificate) {
				thunkAPI.dispatch(
					showNotification({
						message: __('Successfully selected', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
			}

			thunkAPI.dispatch(
				showNotification({
					message: __('Settings Saved!', 'academy'),
					isShow: true,
					type: 'success',
				})
			);

			return childObjectKey ? { [childObjectKey]: values } : values;
		} catch (e) {
			console.error('error', e);

			thunkAPI.dispatch(
				showNotification({
					message:
						e?.response?.data?.data?.message ||
						e?.response?.data?.message ||
						'Unknown error',
					isShow: true,
					type: 'error',
				})
			);

			return thunkAPI.rejectWithValue(e?.response?.data ?? e.message);
		}
	}
);

export const updateFormBuilderSettings = createAsyncThunk(
	'academy/updateFormBuilderSettings',
	({ values, action, isInstructor = true }, thunkAPI) => {
		try {
			const formValue = isInstructor ? values.instructor : values.student;
			const sortedValue = formValue.reduce((acc, current) => {
				const fields = current.fields.map((item) => {
					return item;
				});
				acc.push(fields);

				return acc;
			}, []);
			return makeRequest({
				action: 'academy/' + action,
				form_fields: sortedValue,
			}).then((res) => {
				if (res.data.success) {
					thunkAPI.dispatch(
						showNotification({
							message: __('Settings Saved!', 'academy'),
							isShow: true,
							type: 'success',
						})
					);
					return values;
				}
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

const settingsSlice = createSlice({
	name: 'settings',
	initialState: {
		// Formik's `initialValues` is `settings.data ?? {}` (settings/index.js) —
		// `??` only substitutes for null/undefined, not `false`. A `false`
		// sentinel here used to sail right through that fallback and become
		// Formik's actual `values`, so the *first* field anyone touched threw
		// (`setIn` tries to assign a property onto the boolean `false`) instead
		// of the settings screen just showing empty/default fields.
		data: null,
		loading: true,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSettings.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchSettings.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload;
			})
			.addCase(fetchSettings.rejected, (state) => {
				state.loading = false;
			})
			//updated settings
			.addCase(updateSettings.fulfilled, (state, action) => {
				state.loading = false;
				state.data = {
					...state.data,
					...action.payload,
				};
			})
			//updated formBuilder
			.addCase(updateFormBuilderSettings.fulfilled, (state, action) => {
				state.loading = false;
				state.data = {
					...state.data,
					form_builder: action.payload,
				};
			});
	},
});

export default settingsSlice.reducer;
