import { createContext } from 'react';

/*
 * Holds the DOM node (or null) that the quiz wizard's sticky header exposes
 * for portaling in-context action bars — e.g. the per-question Reset/Add
 * Question buttons — so they stay reachable while scrolled deep into a form.
 */
const QuizHeaderPortalContext = createContext(null);

export default QuizHeaderPortalContext;
