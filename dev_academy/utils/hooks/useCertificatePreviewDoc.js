import { useEffect, useState } from 'react';
import {
	renderCertificateDocument,
	renderCertificateCanvasDocument,
} from '@kodezen/editor';
import { API, namespace } from '@Utils/helper';

// Both renderers build their standalone document for the *big* in-editor
// Preview modal: a fixed 24px padding and a gray-blue backdrop around the
// page, so it reads as a page floating on a canvas, plus a box-shadow and a
// fit-to-window script hardcoded to leave that 24px padding's worth of
// margin. All four are exactly wrong for a small grid thumbnail — the
// backdrop and padding show up as a disproportionate gray border, and the
// certificate itself doesn't fill the tile. Strip them so the certificate
// fills its iframe edge to edge; the literal text below is the exact
// (inline-styled, no classes) output both functions emit — see
// dev_emb/library/certificate-canvas/renderer.js and
// dev_emb/dashboard/.../render/certificate/document.js in the editor repo.
function stripPreviewChrome(doc) {
	return doc
		.replace(
			'margin:0;padding:24px;background:#64748b;text-align:center',
			'margin:0;padding:0;background:transparent;text-align:center'
		)
		.replace('box-shadow:0 8px 30px rgba(0,0,0,.35);', '')
		.replace(/window\.innerWidth-48/, 'window.innerWidth');
}

// Certificates saved with the newer freeform canvas builder carry
// `version: 3` and need the canvas renderer; everything else (the older
// flow builder, and pre-tree-builder certificates the API converts on the
// fly) uses the flow renderer. Both return a complete, self-scaling
// standalone HTML document meant for an iframe — see
// dev_emb/library/certificate-canvas/renderer.js and
// dev_emb/dashboard/.../render/certificate/document.js in the editor repo.
function documentFromTree(tree) {
	if (!tree) {
		return '';
	}
	const doc =
		3 === tree.version
			? renderCertificateCanvasDocument(tree)
			: renderCertificateDocument(tree);
	return stripPreviewChrome(doc);
}

// A certificate's design rarely changes while a picker/card showing its
// preview is open, and the same certificate is often previewed in more than
// one place (the picker modal, then the selected-certificate card) — cache
// per id instead of re-fetching every mount.
const cache = new Map();

// Live preview of a certificate's actual saved design (course-settings
// certificate picker + selected-certificate card), instead of a generic
// placeholder image. Fetches the design tree from the read-only
// `certificate-builder/{id}/preview-tree` route (open to anyone who can
// edit courses, not just whoever can edit that certificate — see
// preview_tree_permission_check in addons/certificates/builder-api.php) and
// renders it client-side with the same renderer the editor itself uses.
export default function useCertificatePreviewDoc(certificateId) {
	const [doc, setDoc] = useState(() => cache.get(certificateId) ?? null);

	useEffect(() => {
		if (!certificateId) {
			return undefined;
		}
		if (cache.has(certificateId)) {
			setDoc(cache.get(certificateId));
			return undefined;
		}
		let cancelled = false;
		API.get(
			`${namespace}certificate-builder/${certificateId}/preview-tree`
		)
			.then(({ data }) => {
				const html = documentFromTree(data?.tree);
				cache.set(certificateId, html);
				if (!cancelled) {
					setDoc(html);
				}
			})
			.catch(() => {
				cache.set(certificateId, '');
				if (!cancelled) {
					setDoc('');
				}
			});
		return () => {
			cancelled = true;
		};
	}, [certificateId]);

	return doc;
}
