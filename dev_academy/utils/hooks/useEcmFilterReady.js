import { useEffect, useState } from 'react';
import { hasFilter } from '@wordpress/hooks';
import { ecm_is_active } from '@Utils/helper';

// Easy Content Manager registers its React-editor filters
// (`ecm.react-editor.register-taxonomy` / `-custom-field`) from its own,
// separately-enqueued script. Right after a course/lesson/announcement form
// mounts there's a real window where ECM is active but hasn't registered the
// filter yet — reading `hasFilter()` once at render time (the old approach)
// lands in that window and renders an empty section until some unrelated
// re-render happens to pick the filter up later.
//
// Polls until the filter shows up (or ECM turns out not to be active, or
// this has waited long enough that something's wrong), so callers can show a
// loader instead of a blank gap.
const POLL_MS = 100;
const TIMEOUT_MS = 5000;

export default function useEcmFilterReady(hookName) {
	const [ready, setReady] = useState(
		() => !ecm_is_active || hasFilter(hookName)
	);

	useEffect(() => {
		if (ready) {
			return;
		}
		const start = Date.now();
		const interval = setInterval(() => {
			if (hasFilter(hookName) || Date.now() - start > TIMEOUT_MS) {
				clearInterval(interval);
				setReady(true);
			}
		}, POLL_MS);
		return () => clearInterval(interval);
	}, [hookName, ready]);

	return ready;
}
