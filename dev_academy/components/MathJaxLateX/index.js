import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';

export default function MathJaxLateX({ text }) {
	useEffect(() => {
		if (window.MathJax) {
			window.MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
		}
	}, [text]);

	return <span dangerouslySetInnerHTML={{ __html: text }} />;
}
