import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Query params that switch which screen is rendered somewhere in the admin
// app, gathered from every `searchParams.get()`/`location.get()` call across
// dev_academy/containers:
// - `page`/`id`/`action`/`path` — BackendDashboard's renderSwitch()
// - `step`/`curriculum`/`item_id` — course builder step tabs
//   (Overview/Builder/Settings) and its curriculum-item editor
//   (lesson/quiz/assignment/meeting/booking)
// - `tab` — Settings sub-tabs, Webhooks (Incoming/Outgoing), Tools/Migration
// - `announcement_form`/`lesson_form`/`quiz_form`/`question_form` — the
//   other route-based full-page list-to-editor swaps (Announcements,
//   Lessons, Quizzes, Question Manager), same pattern as `curriculum`
// - `meeting_form`/`bundle_form`/`assignment_form`/`booking_form`/
//   `classroom_setup` — same list-to-editor pattern in academy-pro
//   (Meetings, Course Bundle, Assignments, Tutor Booking, Google Classroom)
//
// Deliberately excluded: list-table params (`status`, `search`, `perPage`,
// `addon`), modal/accordion toggles (`open_module`, `quiz_attempt`), and
// transient params like Google Classroom's OAuth `code` — none of these
// swap the whole screen, so scrolling on them would just disrupt someone
// mid-filter or mid-scroll on a list.
const NAV_PARAMS = [
	'page',
	'id',
	'action',
	'path',
	'step',
	'curriculum',
	'item_id',
	'tab',
	'announcement_form',
	'lesson_form',
	'quiz_form',
	'question_form',
	'meeting_form',
	'bundle_form',
	'assignment_form',
	'booking_form',
	'classroom_setup',
];

const EXCLUDE_PAGES = [ 'addons' ];

function isExcludedPage(page) {
	return !! page && EXCLUDE_PAGES.includes(page.split('-')[1]);
}

export function scrollToTop() {
	try {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	} catch (e) {
		window.scrollTo(0, 0);
	}
}

// Generic building block: scrolls to top whenever `key` changes. For
// screens whose step/tab is driven by local component state instead of the
// URL (e.g. a FormikWizard's currentStepIndex) — the URL-based hook below
// can't see those, so the screen has to pass its own step value in.
export function useScrollToTopOnChange(key) {
	useEffect(() => {
		scrollToTop();
	}, [key]);
}

// Auto-scrolls to top whenever the admin app navigates to a different
// screen, so leaving a page scrolled down doesn't leave the next one
// looking blank until the user manually scrolls up.
export default function useScrollToTop() {
	const { search } = useLocation();
	// Holds the last key computed on a non-excluded page. On an excluded
	// page we keep returning this same value instead of a fresh one (e.g.
	// `null`), because any *change* in the memoized key — including a
	// change to `null` — is what fires the scroll effect below. Returning
	// a stable value is what actually suppresses the scroll.
	const lastKeyRef = useRef(null);

	const navKey = useMemo(() => {
		const params = new URLSearchParams(search);
		if (isExcludedPage(params.get('page'))) {
			return lastKeyRef.current;
		}
		const key = NAV_PARAMS.map((navParam) => params.get(navParam)).join('|');
		lastKeyRef.current = key;
		return key;
	}, [search]);

	useScrollToTopOnChange(navKey);
}
