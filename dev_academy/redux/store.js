import { configureStore } from '@reduxjs/toolkit';
// reducers
import settingsReducer from './Slices/settingsSlice/settingsSlice';
import menuReducer from './Slices/menuSlice/menuSlice';
import toolsReducer from './Slices/toolsSlice/toolsSlice';
import addonReducer from './Slices/addonSlice/addonSlice';
import userReducer from './Slices/userSlice/userSlice';
import studentReducer from './Slices/studentSlice/studentSlice';
import instructorReducer from './Slices/instructorSlice/instructorSlice';
import courseReducer from './Slices/courseSlice/courseSlice';
import categoryReducer from './Slices/categorySlice/categorySlice';
import tagReducer from './Slices/tagSlice/tagSlice';
import notificationReducer from './Slices/notificationSlice/notificationSlice';
import analyticsReducer from './Slices/analyticsSlice/analyticsSlice';
import lessonReducer from './Slices/lessonSlice/lessonSlice';
import announcementReducer from './Slices/announcementSlice/announcementSlice';
import assignmentReducer from './Slices/assignmentSlice/assignmentSlice';
import webHookReducer from './Slices/webHookSlice/webHookSlice';
import incomingWebHookReducer from './Slices/incomingWebHookSlice/incomingWebHookSlice';
import courseActiveTimerReducer from './Slices/courseActiveTimerSlice/courseActiveTimerSlice';
import gradeBookReducer from './Slices/gradeBookSlice/gradeBookSlice';
import questionAndAnswerReducer from './Slices/questionAndAnswerSlice/questionAndAnswerSlice';
import notesReducer from './Slices/notesSlice/notesSlice';
import quizAttemptsReducer from './Slices/quizAttemptsSlice/quizAttemptsSlice';
import quizQuestionReducer from './Slices/quizQuestionSlice/quizQuestionSlice';
import courseBundleReducer from './Slices/courseBundleSlice/courseBundleSlice';
import googleClassroomReducer from './Slices/googleClassroomSlice/googleClassroomSlice';
import notificationsReducer from './Slices/notificationsSlice/notificationsSlice';
import groupPlusReducer from './Slices/groupPlusSlice/groupPlusSlice';

import upgradeToProReducer from './Slices/upgradeToProSlice/upgradeToProSlice';
import certificateReducer from './Slices/certificateSlice/certificateSlice';
import bookingReducer from './Slices/bookingSlice/bookingSlice';
import quizReducer from './Slices/quizSlice/quizSlice';
import withdrawReducer from './Slices/withdrawSlice/withdrawSlice';
import curriculumsReducer from './Slices/curriculumSlice/curriculumSlice';
import meetingReducer from './Slices/meetingSlice/meetingSlice';
import attendanceReducer from './Slices/assignmentSlice/assignmentSlice';
import logger from 'redux-logger';

let middleware = [];
if (process.env.NODE_ENV !== 'production') {
	middleware = [logger];
}

const store = configureStore({
	reducer: {
		settings: settingsReducer,
		adminmenu: menuReducer,
		tools: toolsReducer,
		addons: addonReducer,
		user: userReducer,
		students: studentReducer,
		instructors: instructorReducer,
		notification: notificationReducer,
		analytics: analyticsReducer,
		lessons: lessonReducer,
		announcement: announcementReducer,
		assignment: assignmentReducer,
		courses: courseReducer,
		categories: categoryReducer,
		tags: tagReducer,
		upgradeToPro: upgradeToProReducer,
		certificates: certificateReducer,
		webHooks: webHookReducer,
		incomingWebHooks: incomingWebHookReducer,
		courseActiveTimer: courseActiveTimerReducer,
		gradeBook: gradeBookReducer,
		questionAndAnswer: questionAndAnswerReducer,
		notes: notesReducer,
		bookings: bookingReducer,
		quizzes: quizReducer,
		frontendCurriculums: curriculumsReducer,
		withdraw: withdrawReducer,
		meetings: meetingReducer,
		quizAttempts: quizAttemptsReducer,
		quizQuestions: quizQuestionReducer,
		courseBundle: courseBundleReducer,
		googleClassroom: googleClassroomReducer,
		notifications: notificationsReducer,
		groupPlus: groupPlusReducer,
		attendance: attendanceReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(...middleware),
});

export default store;
