/**
 * Whether the current admin screen edits something (a course, lesson, quiz,
 * assignment, bundle, announcement, meeting…) rather than listing things.
 * Editing screens keep the top bar to their own actions: no global search,
 * no dark-mode switch.
 *
 * Any `…_form` parameter (lesson_form, quiz_form, assignment_form,
 * bundle_form…) or an item being opened counts, so a new route-based editor
 * is covered without being added here.
 *
 * @return {boolean} Whether this is an editing screen.
 */
export const isEditorScreen = () => {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	const q = new URLSearchParams( window.location.search );
	if (
		q.get( 'id' ) ||
		q.get( 'item_id' ) ||
		q.get( 'action' ) ||
		q.get( 'curriculum' )
	) {
		return true;
	}
	for ( const [ key, value ] of q.entries() ) {
		if ( key.endsWith( '_form' ) && value ) {
			return true;
		}
	}
	return false;
};
