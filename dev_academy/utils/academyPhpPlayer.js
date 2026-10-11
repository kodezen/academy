import { createPlayer } from '@kodezen/player';
import '@kodezen/player/styles.css';
import '@Components/AcademyLessonPlayer/font.scss';
import subtitleTracks from '@Components/AcademyLessonPlayer/subtitleTracks';
import { academy_nonce, ajaxurl, current_user_id } from '@Utils/helper';

const HEARTBEAT_MS = 10000;

/**
 * Mount the tracking-free media player on the PHP-rendered learn page and wire
 * Academy's progress persistence, resume, and watch-gated auto-completion.
 * Driven by the data-attributes emitted in curriculums/lesson/academy-player.php.
 */
// Players on screen, so a page that swaps its content can stop them first.
const mounted = new Set();

export function destroyAcademyPhpPlayers() {
	mounted.forEach((entry) => entry.destroy());
	mounted.clear();
}

export function mountAcademyPhpPlayers(root = document) {
	const nodes = root.querySelectorAll(
		'[data-academy-lesson-player]:not([data-academy-player-mounted])'
	);
	const isLogged = parseInt(current_user_id) !== 0;

	nodes.forEach((node) => {
		node.setAttribute('data-academy-player-mounted', '1');
		const provider = node.getAttribute('data-provider');
		const src = node.getAttribute('data-src');
		const courseId = node.getAttribute('data-course-id');
		const topicId = node.getAttribute('data-topic-id');
		const nextUrl = node.getAttribute('data-next-url');
		const resume = parseFloat(node.getAttribute('data-resume')) || 0;
		const lockSeek = node.getAttribute('data-lock-seek') === '1';
		const autoNext = node.getAttribute('data-autonext') === '1';
		const autoComplete = node.getAttribute('data-autocomplete') === '1';
		const autoplay = node.getAttribute('data-autoplay') === '1';
		const poster = node.getAttribute('data-poster') || undefined;
		const title = node.getAttribute('data-title') || '';
		const subtitle = node.getAttribute('data-subtitle') || '';

		const source =
			provider === 'youtube' || provider === 'vimeo'
				? { type: provider, id: src, url: src, poster }
				: { type: 'html5', url: src, poster };

		let lastState = null;
		let lastSent = 0;

		const save = (state, beacon = false) => {
			// Skip readings taken before the media reported a duration: they
			// carry no progress and would overwrite a good saved position with
			// zeros, costing the learner their resume point.
			if (!isLogged || !state || state.duration <= 0 || !topicId) {
				return Promise.resolve();
			}
			const body = new URLSearchParams(); // eslint-disable-line
			body.set('action', 'academy/save_lesson_video_progress');
			body.set('security', academy_nonce);
			body.set('course_id', courseId);
			body.set('topic_id', topicId);
			body.set('position', String(Math.round(state.current)));
			body.set('furthest', String(Math.round(state.furthest)));
			body.set('duration', String(Math.round(state.duration)));
			body.set('percent', String(state.percent));

			if (beacon && window.navigator.sendBeacon) {
				window.navigator.sendBeacon(ajaxurl, body);
				return Promise.resolve();
			}
			return fetch(ajaxurl, {
				method: 'POST',
				body,
				credentials: 'same-origin',
			}).catch(() => {});
		};

		// "Auto Complete Topic" (pro). Mirrors the SPA's on-ended completion; the
		// server still refuses it when a watch threshold has not been met.
		const markComplete = () => {
			if (!autoComplete || !isLogged || !topicId) {
				return Promise.resolve(false);
			}
			const body = new URLSearchParams(); // eslint-disable-line
			body.set('action', 'academy/mark_topic_complete');
			body.set('security', academy_nonce);
			body.set('course_id', courseId);
			body.set('topic_type', 'lesson');
			body.set('topic_id', topicId);
			return fetch(ajaxurl, {
				method: 'POST',
				body,
				credentials: 'same-origin',
			})
				.then((res) => res.json())
				.then((data) => !!data?.success)
				.catch(() => false);
		};

		const player = createPlayer(node, {
			source,
			resumeAt: resume,
			lockSeek,
			title,
			autoplay,
			tracks: subtitleTracks(subtitle),
		});

		player.on('timeupdate', (state) => {
			lastState = state;
			const now = Date.now();
			if (now - lastSent >= HEARTBEAT_MS) {
				lastSent = now;
				save(state);
			}
		});
		player.on('pause', () => save(lastState));
		player.on('ended', () => {
			// Send the final reading first: a gated lesson can only be marked
			// complete once the server has it. Then complete, and only then
			// move on — navigating away mid-request would abort it and leave
			// the lesson unticked.
			save(lastState)
				.then(markComplete)
				.then((completed) => {
					// The block learn page updates itself and moves on in place.
					if (document.querySelector('.academy-learn')) {
						window.dispatchEvent(
							new window.CustomEvent('academy:learn-topic-completed', {
								detail: {
									type: 'lesson',
									id: completed ? topicId : 0,
									next: autoNext && !!nextUrl,
								},
							})
						);
						return;
					}
					if (autoNext && nextUrl) {
						window.location.href = nextUrl;
					} else if (completed) {
						window.location.reload();
					}
				});
		});

		const flush = () => save(lastState, true);
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				flush();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		window.addEventListener('pagehide', flush);

		mounted.add({
			destroy: () => {
				flush();
				document.removeEventListener('visibilitychange', onVisibility);
				window.removeEventListener('pagehide', flush);
				if (player && typeof player.destroy === 'function') {
					player.destroy();
				}
			},
		});
	});
}
