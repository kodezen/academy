import { PanelBody } from '@wordpress/components';

/**
 * PanelBody for Academy block settings. Core leaves 5px under an open panel's
 * title but 16px between its controls; the academy-panel-body class (styled in
 * Academy\Blocks::editor_settings()) makes the first gap 16px too.
 *
 * @param {Object} props           PanelBody props.
 * @param {string} props.className Extra class.
 * @return {JSX.Element} Panel.
 */
export default function AcademyPanelBody( { className, ...props } ) {
	return <PanelBody className={ [ 'academy-panel-body', className ].filter( Boolean ).join( ' ' ) } { ...props } />;
}
