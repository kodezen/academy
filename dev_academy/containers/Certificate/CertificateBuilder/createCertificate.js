import { API, namespace } from '@Utils/helper';
import { buildStarterCanvasTree } from '@kodezen/editor';

/**
 * Create a certificate from the wizard's answers and resolve to its new id.
 *
 * Creating up front is what lets the editor open on a real URL: the builder is
 * never a nameless `action=new` screen whose work is lost on a refresh, and
 * Back or a reload lands on the certificate itself.
 *
 * New certificates use the CANVAS format (`version: 3` — freeform x/y/w/h
 * placement) unconditionally: only certificates that already existed before
 * this format shipped keep opening in the old flow builder (see
 * `presets.js`'s `buildInitialTree`, still used solely for that re-open
 * path). Unlike the flow format, the canvas renderer (PHP
 * `AcademyCertificates\Render\CanvasRenderer`) renders straight from the
 * tree at request time — no client-rendered `html` blob needs to accompany
 * it (`BuilderApi::save_design` ignores/clears that field for `version: 3`
 * trees), so nothing here needs Easy Mail Builder's `renderCertificateContent`
 * the way the old flow path did.
 *
 * @param {string}  title   Certificate name.
 * @param {Object}  config  Page setup from the wizard.
 * @param {boolean} isBlank true for a blank page — correctly sized but empty.
 * @return {Promise<number>} the new certificate's id.
 */
export const createCertificate = (title, config, isBlank) => {
	const tree = buildStarterCanvasTree(config, !isBlank);
	return API.post(`${namespace}certificate-builder`, {
		title,
		tree,
	}).then((res) => {
		const id = res?.data?.id;
		if (!id) {
			throw new Error('certificate-builder returned no id');
		}
		return id;
	});
};

export default createCertificate;
