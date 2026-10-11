import { createContext } from 'react';

// A price typed into `PaidProductPrice` before its course exists — a new
// course only gets a post ID once it's first saved (i.e. once it has a
// title), so there's nothing to attach a product to yet. The course editor
// (`NewCourse`) provides this from above the form it remounts on that save,
// so the price outlives it and the remounted panel creates the product.
// `{ set(price), take(courseId) }`; null outside the course editor.
export const PendingPriceContext = createContext(null);
