import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@Redux/store';
import Curriculums from '@Containers/frontend-curriculums';
import './../assets/scss/frontendCurriculums.scss';
import './tailwind.css';
import {
	is_disabled_lessons_right_click,
	applyPendingReloadTopic,
} from '@Utils/helper';
import { HashRouter } from 'react-router-dom';
import { __experimentalConfirmDialog } from '@wordpress/components';

document.addEventListener('DOMContentLoaded', () => {
	// Page-reload content mode: if a topic navigation stashed a target before
	// reloading, apply it to the hash now — before the router mounts — so the
	// fresh page opens the topic directly without an AJAX flash.
	applyPendingReloadTopic();

	const container = document.getElementById('academyLessonsWrap');
	if (container) {
		const floatingCartIcon = document.querySelector(
			'.storeengine-floating-cart'
		);
		if (floatingCartIcon) {
			floatingCartIcon.style.display = 'none';
		}
		if (is_disabled_lessons_right_click) {
			document.addEventListener('contextmenu', function (e) {
				e.preventDefault();
			});
			document.addEventListener('keydown', function (e) {
				// Disable F12 (Windows) and Cmd+Option+I (Mac) for Chrome and Firefox
				if (
					e.key === 'F12' || // Windows F12
					(e.key === 'F12' && e.ctrlKey === undefined) || // Windows F12
					(e.key === 'F12' && e.ctrlKey === true) || // Windows Chrome/Firefox F12
					(e.ctrlKey && e.key === 'Alt' && e.code === 'KeyI') || // Mac Chrome/Firefox Cmd+Option+I
					(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') // Chrome/Firefox CTRL+SHIFT+I
				) {
					e.preventDefault();
				}

				// Disable Cmd+Option+C (Mac) for Safari
				if (e.ctrlKey && e.key === 'Alt' && e.code === 'KeyC') {
					e.preventDefault();
				}
			});
		}
		const root = createRoot(container);
		const renderApp = () =>
			root.render(
				<Provider store={store}>
					<HashRouter basename="/">
						<Curriculums
							courseID={container.getAttribute('data-course-id')}
							courseTitle={container.getAttribute(
								'data-course-title'
							)}
							coursePermalink={container.getAttribute(
								'data-course-permalink'
							)}
							exitPermalink={container.getAttribute(
								'data-exit-permalink'
							)}
							isEnabledCourseQA={container.getAttribute(
								'data-enabled-course-qa'
							)}
							isEnabledLessonComment={container.getAttribute(
								'data-enabled-course-lesson-comment'
							)}
							isEnabledHP={container.getAttribute(
								'data-enabled-hp-lesson'
							)}
							isEnabledCourseAnnouncements={container.getAttribute(
								'data-enabled-course-announcements'
							)}
							courseType={container.getAttribute(
								'data-course-type'
							)}
							isCompletedCourse={container.getAttribute(
								'data-is-completed-course'
							)}
							isPopupReviewEnabled={container.getAttribute(
								'data-is-enabled-course-popup-review'
							)}
							autoLoadNextLesson={container.getAttribute(
								'data-auto-load-next-lesson'
							)}
							isFavorite={container.getAttribute(
								'data-is-favorite'
							)}
							isTopicsAccessible={
								!!container.getAttribute(
									'data-topics-accessible'
								)
							}
							autoComplete={
								!!container.getAttribute(
									'data-auto-complete-topic'
								)
							}
							isHeaderFooterEnabled={
								!!container.getAttribute(
									'data-enabled-header-footer'
								)
							}
							contentWidth={container.getAttribute(
								'data-lesson-content-width'
							)}
							contentWidthUnit={container.getAttribute(
								'data-lesson-content-width-unit'
							)}
							lessonAutoPlay={container.getAttribute(
								'data-enabled-lesson-auto-play'
							)}
							lessonVideoSkip={
								container?.getAttribute(
									'data-enabled-academy-lesson-video-skip'
								) ?? ''
							}
							isVisiableReview={
								container?.getAttribute(
									'data-minimum-course-completion-on-review'
								) ?? ''
							}
							hasReviewed={
								container?.getAttribute(
									'data-is-user-reviewed-on-course'
								) ?? ''
							}
							sidebarPosition={
								container?.getAttribute(
									'data-academy-sidebar-position'
								) ?? 'left'
							}
							contentLoadMode={
								container?.getAttribute(
									'data-academy-content-load'
								) ?? 'ajax'
							}
						/>
					</HashRouter>
				</Provider>
			);

		renderApp();
	}
});
