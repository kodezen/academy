import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and resolve conflicting Tailwind utilities
 * (the later class wins, e.g. cn('p-2', 'p-4') -> 'p-4').
 *
 * @param {...any} inputs clsx-compatible class values.
 * @return {string} Merged class string.
 */
export const cn = ( ...inputs ) => twMerge( clsx( inputs ) );

export default cn;
