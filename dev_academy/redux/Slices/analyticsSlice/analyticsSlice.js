import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API } from '@Utils/helper';
import { addons as allAddons, makeRequest } from '@Utils/helper';
import { showNotification } from '../notificationSlice/notificationSlice';

export const getAnalytics = createAsyncThunk(
	'academy/getAnalytics',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy/get_analytics',
			}).then((res) => {
				if (res.data.success) {
					return {
						enrolled_info: res.data.data?.enrolled_info,
						total_assignments: res.data.data?.total_assignments,
						total_completed_course:
							res.data.data?.total_completed_course,
						total_courses: res.data.data?.total_courses,
						total_enrolled_courses:
							res.data.data?.total_enrolled_courses,
						total_instructors: res.data.data?.total_instructors,
						total_lessons: res.data.data?.total_lessons,
						total_questions: res.data.data?.total_questions,
						total_quizzes: res.data.data?.total_quizzes,
						total_reviews: res.data.data?.total_reviews,
						total_students: res.data.data?.total_students,
						live_meetings_count: res.data.data?.live_meetings_count,
						upcoming_meetings_count:
							res.data.data?.upcoming_meetings_count,
					};
				}
				thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to get analytics',
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
				message: error?.response?.data?.message ?? error?.message,
			});
		}
	}
);

export const getTotalEarningsAnalytics = createAsyncThunk(
	'academy/getTotalEarningsAnalytics',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/get_analytics_for_earnings',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to get total earnings',
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

export const getTotalRefundsAnalytics = createAsyncThunk(
	'academy/getTotalRefundsAnalytics',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/get_analytics_for_refunds',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to get total refunds',
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

export const getTotalDiscountsAnalytics = createAsyncThunk(
	'academy/getTotalDiscountsAnalytics',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/get_analytics_for_discounts',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get total discounts',
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

export const getPopularCourses = createAsyncThunk(
	'academy/getPopularCourses',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/get_popular_courses',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get popular courses',
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

export const getCourseTotalViews = createAsyncThunk(
	'academy/getCourseTotalViews',
	({ page = 1, per_page = 10 }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/get_course_total_views',
				page,
				per_page,
			}).then((res) => {
				if (res.data.success) {
					return {
						data: res.data.data,
						itemPerPage: per_page,
						page,
						totalItems: parseInt(res.headers['x-wp-total']),
					};
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get course total views',
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

export const lastEnrolledCourses = createAsyncThunk(
	'academy/lastEnrolledCourses',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/recent_enrolled_courses',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message ||
						'Failed to get last enrolled courses',
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

export const recentReviews = createAsyncThunk(
	'academy/recentReviews',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/recent_reviews',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to get recent reviews',
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

export const getRegisterdStudents = createAsyncThunk(
	'academy/getRegisterdStudents',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/recent_students',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get registered students',
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

export const getRegisterdInstructors = createAsyncThunk(
	'academy/getRegisterdInstructors',
	(thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/recent_instructors',
			}).then((res) => {
				if (res.data.success) {
					return res.data.data;
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message ||
						'Failed to get registered instructors',
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

export const getAnalyticsCourses = createAsyncThunk(
	'academy/getAnalyticsCourses',
	({ page, per_page }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/admin/get_courses',
				page,
				per_page,
			}).then((res) => {
				if (res.data.success) {
					return {
						data: res.data.data,
						total_courses: parseInt(res.headers['x-wp-total']),
					};
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message ||
						'Failed to get total course completions',
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

export const getAnalyticsCourseStudents = createAsyncThunk(
	'academy/getAnalyticsCourseStudents',
	({ ID, page = 1, per_page = 10 }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/admin/get_students_by_course_id',
				course_id: ID,
				page,
				per_page,
			}).then((res) => {
				if (res.data.success) {
					return {
						courseId: parseInt(ID),
						data: res.data.data,
						totalItems: parseInt(res.headers['x-wp-total']),
						per_page,
					};
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get course students',
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

export const getAnalyticsCourseInstructors = createAsyncThunk(
	'academy/getAnalyticsCourseInstructors',
	({ ID }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/admin/get_instructors_by_course_id',
				course_id: ID,
			}).then((res) => {
				if (res.data.success) {
					return {
						courseId: parseInt(ID),
						data: res.data.data,
						totalItems: parseInt(res.headers['x-wp-total']),
					};
				}
				thunkAPI.rejectWithValue({
					message:
						res.data.message || 'Failed to get course instructors',
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

export const getAnalyticsStudents = createAsyncThunk(
	'academy/getAnalyticsStudents',
	({ page = 1, per_page = 10 }, thunkAPI) => {
		try {
			return makeRequest({
				action: 'academy_pro_advanced_analytics/admin/get_students',
				page,
				per_page,
			}).then((res) => {
				if (res.data.success) {
					return {
						data: res.data.data,
						total_students: parseInt(res.headers['x-wp-total']),
					};
				}
				thunkAPI.rejectWithValue({
					message: res.data.message || 'Failed to get students',
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

const analyticsSlice = createSlice({
	name: 'analytics',
	initialState: {
		courses: false,
		students: false,
		popular_courses: false,
		enrolled_info: {},
		total_assignments: 0,
		total_completed_course: 0,
		total_courses: 0,
		total_enrolled_courses: 0,
		total_instructors: 0,
		total_lessons: 0,
		total_questions: 0,
		total_reviews: 0,
		total_students: 0,
		total_quizzes: 0,
		live_meetings_count: 0,
		upcoming_meetings_count: 0,
		loading: false,
		currentPage: 1,
		itemPerPage: 10,
	},
	reducers: {
		updateCurrentPage: (state, action) => {
			state.currentPage = action.payload;
		},
		updateItemPerPage: (state, action) => {
			state.itemPerPage = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// get all analytics
			.addCase(getAnalytics.fulfilled, (state, action) => {
				state.loading = false;
				state.total_assignments = action?.payload?.total_assignments;
				state.total_completed_course =
					action?.payload?.total_completed_course;
				state.total_courses = action?.payload?.total_courses;
				state.total_enrolled_courses =
					action?.payload?.total_enrolled_courses;
				state.total_instructors = action?.payload?.total_instructors;
				state.total_lessons = action?.payload?.total_lessons;
				state.total_questions = action?.payload?.total_questions;
				state.total_quizzes = action?.payload?.total_quizzes;
				state.total_students = action?.payload?.total_students;
				state.total_reviews = action?.payload?.total_reviews;
				state.enrolled_info = action?.payload?.enrolled_info;
				state.live_meetings_count =
					action?.payload?.live_meetings_count;
				state.upcoming_meetings_count =
					action?.payload?.upcoming_meetings_count;
			})
			// get total earnings analytics
			.addCase(getTotalEarningsAnalytics.pending, (state) => {
				state.loading = true;
			})
			.addCase(getTotalEarningsAnalytics.fulfilled, (state, action) => {
				state.loading = false;
				state.data = {
					...state.data,
					total_earnings: action.payload,
				};
			})
			.addCase(getTotalEarningsAnalytics.rejected, (state) => {
				state.loading = false;
			})

			// get totalreviews
			.addCase(recentReviews.pending, (state) => {
				state.loading = true;
			})
			.addCase(recentReviews.fulfilled, (state, action) => {
				state.loading = false;
				state.recent_reviews = action.payload;
			})
			.addCase(recentReviews.rejected, (state) => {
				state.loading = false;
			})
			//last Enrolled Courses
			.addCase(lastEnrolledCourses.pending, (state) => {
				state.loading = true;
			})
			.addCase(lastEnrolledCourses.fulfilled, (state, action) => {
				state.loading = false;
				state.last_enrolled_courses = action.payload;
			})
			.addCase(lastEnrolledCourses.rejected, (state) => {
				state.loading = false;
			})
			//get Popular Courses
			.addCase(getPopularCourses.pending, (state) => {
				state.loading = true;
			})
			.addCase(getPopularCourses.fulfilled, (state, action) => {
				state.loading = false;
				state.popular_courses = action.payload;
			})
			.addCase(getPopularCourses.rejected, (state) => {
				state.loading = false;
			})
			//get Registerd Students
			.addCase(getRegisterdStudents.pending, (state) => {
				state.loading = true;
			})
			.addCase(getRegisterdStudents.fulfilled, (state, action) => {
				state.loading = false;
				state.students = action.payload;
			})
			.addCase(getRegisterdStudents.rejected, (state) => {
				state.loading = false;
			})
			// get total refunds analytics
			.addCase(getTotalRefundsAnalytics.pending, (state) => {
				state.loading = true;
			})
			.addCase(getTotalRefundsAnalytics.fulfilled, (state, action) => {
				state.loading = false;
				state.total_refunds = action.payload;
			})
			.addCase(getTotalRefundsAnalytics.rejected, (state) => {
				state.loading = false;
			})
			// get course total views
			.addCase(getCourseTotalViews.pending, (state) => {
				state.loading = true;
			})
			.addCase(getCourseTotalViews.fulfilled, (state, action) => {
				state.loading = false;
				state.total_course_views = {
					data: action?.payload.data,
					itemPerPage: action?.payload.itemPerPage,
					page: action?.payload.page,
					totalItems: action?.payload.totalItems,
				};
			})
			.addCase(getCourseTotalViews.rejected, (state) => {
				state.loading = false;
			})
			// get Registered Instructors
			.addCase(getRegisterdInstructors.pending, (state) => {
				state.loading = true;
			})
			.addCase(getRegisterdInstructors.fulfilled, (state, action) => {
				state.loading = false;
				state.instructors = action.payload;
			})
			.addCase(getRegisterdInstructors.rejected, (state) => {
				state.loading = false;
			})
			// get analytics courses
			.addCase(getAnalyticsCourses.pending, (state) => {
				state.loading = true;
			})
			.addCase(getAnalyticsCourses.fulfilled, (state, action) => {
				state.loading = false;
				state.courses = action.payload.data;
				state.total_courses_items = action.payload.total_courses;
			})
			.addCase(getAnalyticsCourses.rejected, (state) => {
				state.loading = false;
			})
			// get analytics courses students
			.addCase(getAnalyticsCourseStudents.pending, (state) => {
				state.loading = true;
			})
			.addCase(getAnalyticsCourseStudents.fulfilled, (state, action) => {
				state.loading = false;
				state.courses = state.courses.map((item) => {
					if (item.ID === action?.payload.courseId) {
						return {
							...item,
							analytics_students: {
								data: action?.payload.data,
								totalItems: action?.payload.totalItems,
								itemsPerPage: action?.payload.per_page,
							},
						};
					}
					return item;
				});
			})
			.addCase(getAnalyticsCourseStudents.rejected, (state) => {
				state.loading = false;
			})
			// get analytics courses instructors
			.addCase(getAnalyticsCourseInstructors.pending, (state) => {
				state.loading = true;
			})
			.addCase(
				getAnalyticsCourseInstructors.fulfilled,
				(state, action) => {
					state.loading = false;
					state.courses = state.courses.map((item) => {
						if (item.ID === action?.payload.courseId) {
							return {
								...item,
								analytics_instructors: {
									data: action?.payload.data,
									totalItems: action?.payload.totalItems,
								},
							};
						}
						return item;
					});
				}
			)
			.addCase(getAnalyticsCourseInstructors.rejected, (state) => {
				state.loading = false;
			})
			// get analytics students
			.addCase(getAnalyticsStudents.pending, (state) => {
				state.loading = true;
			})
			.addCase(getAnalyticsStudents.fulfilled, (state, action) => {
				state.loading = false;
				state.students = action.payload;
				state.total_students_items = action.payload.total_students;
			})
			.addCase(getAnalyticsStudents.rejected, (state) => {
				state.loading = false;
			});
	},
});

export const { updateCurrentPage, updateItemPerPage } = analyticsSlice.actions;
export default analyticsSlice.reducer;
