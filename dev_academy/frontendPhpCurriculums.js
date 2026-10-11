import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@Redux/store';
import { is_disabled_lessons_right_click } from '@Utils/helper';
import PhpLessonTutorBooking from './containers/PhpLessonRender/PhpLessonTutorBooking';

import ShareCourse from './containers/frontend-curriculums/Topbar/ShareCourse';

import { academyRenderQuizPlayer, academyLogin } from './utils/frontendssr';
import PopupLogin from './containers/frontend-modal/PopupLogin';
import YouTubePlayer from '@Components/YouTubePlayer';
import {
	destroyAcademyPhpPlayers,
	mountAcademyPhpPlayers,
} from './utils/academyPhpPlayer';
import QuizAudioPlayer from '@Components/QuizAudioPlayer';
import NoteBook from '@Components/NoteBook';
import CourseReview from '@Components/CourseReview';
import Notification from '@Components/Notification';
import initPhpLearnDrawers from './utils/phpLearnDrawers';
import './../assets/scss/frontendCurriculums.scss';
import './../assets/scss/frontendPhpCurriculums.scss';
import './tailwind.css';

document.addEventListener('DOMContentLoaded', initPhpLearnDrawers);

jQuery(document).ready(function () {
	academyLogin();
});

// React pieces mounted inside the topic content, so they can be taken down
// when the block learn page swaps the content for another topic.
const contentRoots = [];

const mountContentRoot = (container, element) => {
	const root = createRoot(container);
	root.render(element);
	contentRoots.push(root);
};

// Everything that lives inside a topic's content. Runs on load, and again
// each time the block learn page moves to another topic without reloading.
function mountLearnContent() {
	// Controllable providers (html5/youtube/vimeo) now use the lesson player.
	mountAcademyPhpPlayers();
	// Plyr still backs any remaining native embeds (external/embedded/online).
	const plyrTarget = document.getElementById('academy_video_player');
	if (plyrTarget && !plyrTarget.plyr) {
		// eslint-disable-next-line
		new Plyr(plyrTarget);
	}
	academyRenderQuizPlayer();

	const bookingContentContainer = document.getElementById(
		'academy_curriculum_booking_content'
	);
	if (bookingContentContainer) {
		mountContentRoot(
			bookingContentContainer,
			<PhpLessonTutorBooking
				courseID={bookingContentContainer.getAttribute('data-course-id')}
				bookingID={bookingContentContainer.getAttribute(
					'data-booking-id'
				)}
				calenderSettings={bookingContentContainer.getAttribute(
					'data-calendar-settings'
				)}
			/>
		);
	}

	const logInButtonContainer = document.querySelector(
		'#academy-btn-popup-login'
	);
	if (logInButtonContainer) {
		mountContentRoot(
			logInButtonContainer,
			<Provider store={store}>
				<PopupLogin />
			</Provider>
		);
	}

	// Quiz question audio: swap the server-rendered placeholder for the same
	// waveform-style player used by the React quiz (QuizAudioPlayer).
	document
		.querySelectorAll('.academy-quiz-audio[data-audio-src]')
		.forEach((container) => {
			const src = container.getAttribute('data-audio-src');
			if (src) {
				mountContentRoot(container, <QuizAudioPlayer src={src} />);
			}
		});

	// academy Player initialize
	const container = document.getElementById('academy_player');
	if (container) {
		const { auto_complete_topic, auto_load_next_lesson } =
			window.AcademyGlobal;
		const videoId = container.getAttribute('data-lesson-current');
		const externalData = {
			redirectLink: container.getAttribute('data-lesson-next'),
			courseID: container.getAttribute('data-course_id'),
			topicID: container.getAttribute('data-topic_id'),
			topicType: container.getAttribute('data-topic_type'),
			auto_complete_topic,
			auto_load_next_lesson,
		};
		mountContentRoot(
			container,
			<Provider store={store}>
				<YouTubePlayer
					videoId={videoId}
					isExternal={true}
					externalData={externalData}
				/>
			</Provider>
		);
	}
}

function unmountLearnContent() {
	destroyAcademyPhpPlayers();
	while (contentRoots.length) {
		contentRoots.pop().unmount();
	}
}

// Block learn page: "Review this course" in the top bar opens the same review
// form the React player uses.
let reviewRoot = null;
window.addEventListener('academy:learn-open-review', (event) => {
	const { courseId } = event.detail || {};
	let container = document.getElementById('academy-learn-review');
	if (!container) {
		container = document.createElement('div');
		container.id = 'academy-learn-review';
		document.body.appendChild(container);
	}
	if (!reviewRoot) {
		reviewRoot = createRoot(container);
	}
	const close = (open) => {
		if (!open) {
			reviewRoot.render(null);
		}
	};
	reviewRoot.render(
		<Provider store={store}>
			<CourseReview
				isOpenModal={true}
				setOpenModal={close}
				courseId={courseId}
				isRedriect={false}
			/>
			<Notification />
		</Provider>
	);
});

document.addEventListener('DOMContentLoaded', mountLearnContent);
window.addEventListener('academy:learn-before-navigate', unmountLearnContent);
window.addEventListener('academy:learn-navigated', mountLearnContent);

document.addEventListener('DOMContentLoaded', () => {
	if (is_disabled_lessons_right_click) {
		document.addEventListener('contextmenu', function (e) {
			e.preventDefault();
		});
		document.addEventListener('keydown', function (e) {
			// Disable F12 (Windows) and Cmd+Option+I (Mac) for Chrome and Firefox
			if (
				(e.key === 'F12' && e.ctrlKey === undefined) || // Windows F12
				(e.key === 'F12' && e.ctrlKey === true) || // Windows Chrome/Firefox F12
				(e.ctrlKey && e.key === 'Alt' && e.code === 'KeyI') // Mac Chrome/Firefox Cmd+Option+I
			) {
				e.preventDefault();
			}

			// Disable Cmd+Option+C (Mac) for Safari
			if (e.ctrlKey && e.key === 'Alt' && e.code === 'KeyC') {
				e.preventDefault();
			}
		});
	}
});

document.addEventListener('DOMContentLoaded', function () {
	const myForm = document.querySelectorAll('.save_mark_topic');

	Array.from(myForm).forEach((form) => {
		const topicCheck = form.querySelector('.topic_check');
		if (topicCheck) {
			topicCheck.addEventListener('change', function () {
				form.submit();
			});
		}
	});
});

// QuizPress dispatches this on the currently-playing quizpress_quiz topic's
// page once an attempt is graded (see quizController.submitAttempt() in the
// QuizPress plugin). On a pass, drive the same per-topic "mark complete"
// checkbox + submit flow above — save_topic_mark_as_complete is a TOGGLE,
// so only touch it if the topic isn't already marked complete.
document.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('quizpress:attempt_finished', (event) => {
		if (event?.detail?.attempt_status !== 'passed') {
			return;
		}

		const topicCheck = document.querySelector(
			'.academy-learn-page-topics-lesson-item--playing .topic_check, .academy-sub-topics-lesson-item--playing .topic_check'
		);

		if (topicCheck && !topicCheck.checked) {
			topicCheck.checked = true;
			topicCheck.dispatchEvent(new Event('change', { bubbles: true }));
		}
	});
});

// curriculum hide and show
document.addEventListener('DOMContentLoaded', function () {
	const expandBtn = document.querySelector('#academy-curriculum-expand');
	const curriculum = document.querySelector('#academy-course-curriculums');
	const curriculumContainer = document.querySelector(
		'#academy-course-curriculums-container'
	);

	const tabCourse = document.querySelector('.academy-lesson-tab-Course');

	const curriculumContent = document.querySelector(
		'#academy-course-curriculum-contents'
	);
	const curriculumCloseBtn = document.querySelector(
		'#academy-course-curriculums-close-btn'
	);

	if (curriculumContent) {
		const floatingCartIcon = document.querySelector(
			'.storeengine-floating-cart'
		);
		if (floatingCartIcon) {
			floatingCartIcon.style.display = 'none';
		}
	}

	// The curriculum is now a top-bar drawer (see phpLearnDrawers); the old
	// expand-rail elements no longer exist, so bail out if they're absent.
	if (
		!expandBtn ||
		!curriculum ||
		!curriculumContainer ||
		!curriculumCloseBtn
	) {
		return;
	}

	expandBtn.style.display = 'none';

	const handleScreenChange = () => {
		if (window.innerWidth > 768) {
			expandBtn.style.display = 'none';
			tabCourse.style.display = 'none';
			curriculumContainer.style.width = '33.3%';
			curriculumContent.style.width = '66.6%';
			curriculum.style.display = 'flex';
		} else {
			curriculum.style.display = 'none';
			tabCourse.style.display = 'block';
			curriculumContainer.style.width = '0%';
			curriculumContent.style.width = '100%';
			expandBtn.style.display = 'none';
		}
	};

	window.addEventListener('resize', handleScreenChange);
	handleScreenChange();

	curriculumCloseBtn.addEventListener('click', () => {
		curriculum.style.display = 'none';
		tabCourse.style.display = 'block';
		curriculumContainer.style.width = '0%';
		curriculumContent.style.width = '100%';
		expandBtn.style.display = 'flex';
	});
	expandBtn.addEventListener('click', () => {
		expandBtn.style.display = 'none';
		tabCourse.style.display = 'none';
		curriculumContainer.style.width = '33.3%';
		curriculumContent.style.width = '66.6%';
		curriculum.style.display = 'flex';
	});
});

document.addEventListener('DOMContentLoaded', () => {
	const tabsHeadContainer = document.querySelectorAll(
		'.academy-lesson-tab__head'
	)[0];
	// Q&A / Announcements / Course content are top-bar drawers now; the legacy
	// 4-tab strip may be absent, so bail out cleanly when it is.
	if (!tabsHeadContainer) {
		return;
	}
	const isQAEnable = tabsHeadContainer.getAttribute('data-is-enable-qa');
	const isAnnouncementEnable = tabsHeadContainer.getAttribute(
		'data-is-enable-announcement'
	);
	const isLessonCommentsEnable = tabsHeadContainer.getAttribute(
		'data-is-enable-lesson-comments'
	);

	const QnATab = document.querySelectorAll('.academy-lesson-tab-QnA')[0];
	const announcementTab = document.querySelectorAll(
		'.academy-lesson-tab-Announcement'
	)[0];
	const courseTab = document.querySelector('.academy-lesson-tab-Course');
	const commentTab = document.querySelector('.academy-lesson-tab-Lesson');

	const QnAContent = document.querySelectorAll('.QnA')[0];
	const announcementContent = document.querySelectorAll('.Announcement')[0];
	const content = document.querySelectorAll('.Course')[0];
	const commentContent = document.querySelectorAll('.Lesson')[0];

	const tabs = document.querySelectorAll('.academy-lesson-tab-nav');
	const tabsContent = document.querySelectorAll(
		'.academy-lesson-tab__content'
	);

	if (!QnATab || !announcementTab || !courseTab || !commentTab) {
		return;
	}

	QnATab.addEventListener('click', () => {
		handleTabActive(QnATab, QnAContent);
	});
	commentTab.addEventListener('click', () => {
		handleTabActive(commentTab, commentContent);
	});

	announcementTab.addEventListener('click', () => {
		handleTabActive(announcementTab, announcementContent);
	});

	courseTab.addEventListener('click', () => {
		handleTabActive(courseTab, content);
	});

	const handleRemoveActiveClass = () => {
		tabs.forEach((tab) => {
			tab.classList.remove('academy-lesson-tab-nav--active');
		});
	};

	const handleHideContent = () => {
		tabsContent.forEach((tabsContentItem) => {
			tabsContentItem.style.display = 'none';
		});
	};

	const handleTabActive = (activeElement, displayBlockElement) => {
		handleRemoveActiveClass();
		handleHideContent();
		activeElement.classList.add('academy-lesson-tab-nav--active');
		displayBlockElement.style.display = 'block';
	};
	handleTabActive(QnATab, QnAContent);

	if (!isQAEnable) {
		QnATab.style.display = 'none';
		QnAContent.style.display = 'none';
	}
	if (!isAnnouncementEnable) {
		announcementTab.style.display = 'none';
		announcementContent.style.display = 'none';
	}
	if (!isLessonCommentsEnable) {
		commentTab.style.display = 'none';
		commentContent.style.display = 'none';
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const shareContainer = document.getElementById('academy-lesson-share-btn');
	if (shareContainer) {
		const root = createRoot(shareContainer);
		root.render(
			<Provider store={store}>
				<ShareCourse
					permalink={shareContainer.getAttribute(
						'data-course-permalink'
					)}
				/>
			</Provider>
		);
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const handleCurriculumExpansion = () => {
		const curriculums = document.querySelectorAll(
			'.academy-learn-page-topics'
		);

		curriculums.forEach((curriculum) => {
			const toggleButton = curriculum.querySelector(
				'.academy-learn-page-topics-title'
			);
			const icon = toggleButton?.querySelector('.academy-icon');

			const hasPlayingItem = curriculum.querySelector(
				'.academy-learn-page-topics-lesson-item--playing, .academy-sub-topics-lesson-item--playing'
			);

			if (hasPlayingItem) {
				curriculum.classList.add('academy-learn-page-topics--is-open');
				icon?.classList.replace(
					'academy-icon--simple-add',
					'academy-icon--minus-two'
				);
				curriculum.scrollIntoView({ behavior: 'smooth' });
			}

			toggleButton?.addEventListener('click', (event) => {
				event.stopPropagation();
				const isOpen = curriculum.classList.toggle(
					'academy-learn-page-topics--is-open'
				);
				icon?.classList.replace(
					isOpen
						? 'academy-icon--simple-add'
						: 'academy-icon--minus-two',
					isOpen
						? 'academy-icon--minus-two'
						: 'academy-icon--simple-add'
				);
			});

			const subCurriculums = curriculum.querySelectorAll(
				'.academy-learn-page-topics-sub-topics'
			);

			subCurriculums.forEach((subCurriculum) => {
				const subToggleButton = subCurriculum.querySelector(
					'.academy-sub-topics-title'
				);
				const subIcon = subToggleButton?.querySelector('.academy-icon');

				const isPlaying = subCurriculum.querySelector(
					'.academy-sub-topics-lesson-item--playing'
				);
				if (isPlaying) {
					subCurriculum.classList.add(
						'academy-learn-page-topics-sub-topics--is-open'
					);
					subIcon?.classList.replace(
						'academy-icon--simple-add',
						'academy-icon--minus-two'
					);
				}

				subToggleButton?.addEventListener('click', (event) => {
					event.stopPropagation();
					const isOpen = subCurriculum.classList.toggle(
						'academy-learn-page-topics-sub-topics--is-open'
					);
					subIcon?.classList.replace(
						isOpen
							? 'academy-icon--simple-add'
							: 'academy-icon--minus-two',
						isOpen
							? 'academy-icon--minus-two'
							: 'academy-icon--simple-add'
					);
				});
			});
		});
	};

	const handleSubTopicExpansion = (nextLessonUrl) => {
		const allSubTopics = document.querySelectorAll(
			'.academy-learn-page-topics-sub-topics'
		);

		allSubTopics.forEach((subTopic) => {
			const lessonLinks = subTopic.querySelectorAll(
				'.academy-sub-topics-lesson-item a'
			);

			lessonLinks.forEach((link) => {
				if (link.href === nextLessonUrl) {
					subTopic.classList.add(
						'academy-learn-page-topics-sub-topics--is-open'
					);

					const toggleButton = subTopic.querySelector(
						'.academy-sub-topics-title'
					);
					const icon = toggleButton?.querySelector('.academy-icon');

					icon?.classList.replace(
						'academy-icon--simple-add',
						'academy-icon--minus-two'
					);
				}
			});
		});
	};

	const attachNavigationListeners = () => {
		const prevNextButtons = document.querySelectorAll(
			'.academy-btn--next-lesson, .academy-btn--previous-lesson'
		);

		prevNextButtons.forEach((btn) => {
			btn.addEventListener('click', (e) => {
				const nextLessonUrl = btn.getAttribute('href');

				// Delay to wait for DOM update
				setTimeout(() => {
					handleSubTopicExpansion(nextLessonUrl);
				}, 100);
			});
		});
	};

	// Initialize all
	handleCurriculumExpansion();
	attachNavigationListeners();
});

// Top-bar "Take Note" button — same self-contained component used by the
// React curriculum player (guests still see the button; clicking it while
// logged out shows a warning instead of opening the note editor).
document.addEventListener('DOMContentLoaded', () => {
	const notebookContainer = document.getElementById(
		'academy-notebook-mount'
	);
	if (notebookContainer) {
		const root = createRoot(notebookContainer);
		root.render(
			<Provider store={store}>
				<NoteBook
					isLesson={true}
					courseID={notebookContainer.getAttribute(
						'data-course-id'
					)}
				/>
				<Notification />
			</Provider>
		);
	}
});



