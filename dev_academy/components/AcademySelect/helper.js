/**
 * Resolve the text an option should be matched against while searching.
 *
 * `option.label` may be a React node (e.g. an avatar + name) for rich selects,
 * in which case it can't be lower-cased directly. Such options should carry a
 * plain-string `searchLabel`; otherwise we fall back to a string label, or an
 * empty string (node label with no searchLabel is simply not filtered out).
 *
 * @param {Object} option        The option object.
 * @param {string} searchKeyword The current search text.
 * @return {boolean} Whether the option matches the search keyword.
 */
export const optionMatchesSearch = (option, searchKeyword) => {
	const text =
		typeof option?.searchLabel === 'string'
			? option.searchLabel
			: typeof option?.label === 'string'
				? option.label
				: '';
	return text.toLowerCase().includes((searchKeyword || '').toLowerCase());
};
