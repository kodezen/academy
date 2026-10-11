import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { academy_nonce, ajaxurl, current_user_id } from '@Utils/helper';
import { toggleTopicsComplete } from '@Redux/Slices/curriculumSlice/curriculumSlice';

// Throttle server dwell writes to one every 10s, matching the native tracker.
const HEARTBEAT_MS = 10000;

/**
 * Dwell-time watch tracking for the opaque third-party iframe fallback
 * (Wistia, Vidyard, Twitch, SoundCloud, Mixcloud, Facebook, Kaltura, and any
 * other embed/external source with no native KodezenPlayer provider). A
 * cross-origin iframe reports no playback position or duration to the
 * parent page, so this counts real wall-clock time the lesson stayed open
 * and visible as a coarse proxy, gated by a flat-seconds threshold instead
 * of the percent-of-duration one the native players use.
 */
export default function useExternalVideoDwellTracking({
	topic,
	courseID,
	gate,
	resumeSeconds = 0,
}) {
	const dispatch = useDispatch();
	const dwellRef = useRef(resumeSeconds);
	const lastSentRef = useRef(0);
	const lastTickRef = useRef(null);
	const completedRef = useRef(false);

	const isLogged = parseInt(current_user_id) !== 0;
	const topicID = topic?.id;
	const canTrack = isLogged && gate?.dwell_trackable && topicID;

	const save = useCallback(
		(seconds, { beacon = false } = {}) => {
			if (!canTrack || !seconds) return Promise.resolve(false);
			const body = new URLSearchParams(); // eslint-disable-line
			body.set('action', 'academy/save_external_video_dwell');
			body.set('security', academy_nonce);
			body.set('course_id', courseID);
			body.set('topic_id', topicID);
			body.set('dwell_seconds', String(Math.round(seconds)));

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

	// Start each lesson from a clean slate (except the resume seed, which
	// carries the last saved dwell time forward across a reload).
	useEffect(() => {
		dwellRef.current = resumeSeconds;
		lastSentRef.current = 0;
		completedRef.current = false;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [topicID]);

	// There's no player event to hook into for an opaque iframe, so this
	// hook drives its own clock: a 1s tick accrues real elapsed time only
	// while the tab is actually visible — an open-but-hidden tab shouldn't
	// count as "watching."
	useEffect(() => {
		if (!canTrack) return undefined;

		const tick = () => {
			if (document.visibilityState !== 'visible') return;
			const now = Date.now();
			if (lastTickRef.current !== null) {
				dwellRef.current += (now - lastTickRef.current) / 1000;
			}
			lastTickRef.current = now;

			if (now - lastSentRef.current >= HEARTBEAT_MS) {
				lastSentRef.current = now;
				save(dwellRef.current);
			}
		};

		lastTickRef.current =
			document.visibilityState === 'visible' ? Date.now() : null;
		const interval = window.setInterval(tick, 1000);

		const onVisibility = () => {
			if (document.visibilityState === 'visible') {
				lastTickRef.current = Date.now();
			} else {
				lastTickRef.current = null;
				save(dwellRef.current, { beacon: true });
			}
		};
		document.addEventListener('visibilitychange', onVisibility);

		const flush = () => save(dwellRef.current, { beacon: true });
		window.addEventListener('pagehide', flush);

		return () => {
			window.clearInterval(interval);
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('pagehide', flush);
			flush();
		};
	}, [canTrack, save]);
}
