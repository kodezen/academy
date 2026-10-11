import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { academy_nonce, ajaxurl, current_user_id } from '@Utils/helper';
import { toggleTopicsComplete } from '@Redux/Slices/curriculumSlice/curriculumSlice';

// Throttle server progress writes to one every 10s while playing.
const HEARTBEAT_MS = 10000;

/**
 * Server persistence + watch-gated auto-completion for a video player.
 * Shared by any player that can report `{ current, furthest, duration,
 * percent }` readings via `onTimeUpdate` — AcademyLessonPlayer (KodezenPlayer)
 * is the only one now that every native-provider host routes through it.
 */
export default function useVideoProgressTracking({ topic, courseID, gate }) {
	const dispatch = useDispatch();
	const lastSentRef = useRef(0);
	// Holds the last reading *and* the lesson it was taken from. The ref
	// outlives the player remount that a lesson change triggers, so without the
	// stamp the outgoing lesson's final reading gets written under the incoming
	// lesson's id — which hands the learner 100% watched on a lesson they have
	// not started, and with it a free pass through the watch gate.
	const lastStateRef = useRef(null);
	const completedRef = useRef(false);

	const isLogged = parseInt(current_user_id) !== 0;
	const topicID = topic?.id;
	const canTrack = isLogged && gate?.trackable && topicID;

	const save = useCallback(
		(entry, { beacon = false } = {}) => {
			const state = entry?.state;
			// A reading taken before the media reported its duration carries no
			// real progress, and writing it would overwrite a good saved
			// position with zeros — which is what a quick lesson switch used to
			// do, costing the learner their resume point.
			if (
				!canTrack ||
				!state ||
				state.duration <= 0 ||
				entry.topicID !== topicID
			) {
				return Promise.resolve(false);
			}
			const body = new URLSearchParams(); // eslint-disable-line
			body.set('action', 'academy/save_lesson_video_progress');
			body.set('security', academy_nonce);
			body.set('course_id', courseID);
			body.set('topic_id', topicID);
			body.set('position', String(Math.round(state.current)));
			body.set('furthest', String(Math.round(state.furthest)));
			body.set('duration', String(Math.round(state.duration)));
			body.set('percent', String(state.percent));

			if (beacon && window.navigator.sendBeacon) {
				window.navigator.sendBeacon(ajaxurl, body);
				return Promise.resolve(true);
			}

			return axios
				.post(ajaxurl, body)
				.then((res) => {
					const justCompleted =
						res?.data?.success && res.data.data?.just_completed;
					if (justCompleted && !completedRef.current) {
						completedRef.current = true;
						dispatch(
							toggleTopicsComplete({
								data: topic,
								isComplete: true,
							})
						);
					}
					return !!justCompleted;
				})
				.catch(() => false);
		},
		[canTrack, courseID, topic, topicID, dispatch]
	);

	const onTimeUpdate = useCallback(
		(state) => {
			lastStateRef.current = { state, topicID };
			const now = Date.now();
			if (now - lastSentRef.current >= HEARTBEAT_MS) {
				lastSentRef.current = now;
				save(lastStateRef.current);
			}
		},
		[save, topicID]
	);

	// Flush the latest position on tab-hide / unload / unmount so resume is exact.
	useEffect(() => {
		const flush = () => save(lastStateRef.current, { beacon: true });
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				flush();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		window.addEventListener('pagehide', flush);
		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('pagehide', flush);
			flush();
		};
	}, [save]);

	// Start each lesson from a clean slate. Declared after the flush effect so
	// the outgoing lesson's reading is still on record when that one's cleanup
	// runs, and only cleared once it has been sent.
	useEffect(() => {
		lastStateRef.current = null;
		lastSentRef.current = 0;
		completedRef.current = false;
	}, [topicID]);

	const flushNow = useCallback(
		() => save(lastStateRef.current),
		[save]
	);

	return { onTimeUpdate, flushNow };
}
