import classNames from 'classnames';

export function suffixClassNames(suffix, expandableSize) {
	return classNames(
		'academy-react-modal',
		suffix && `academy-react-modal--${suffix}`,
		expandableSize && `academy-react-modal--${expandableSize}`
	);
}

export function contentClassNames(expandableSize) {
	return classNames(
		'academy-react-modal__content',
		expandableSize && `academy-react-modal--content-${expandableSize}`
	);
}
