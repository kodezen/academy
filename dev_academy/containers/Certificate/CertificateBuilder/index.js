import React, { useCallback, useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	CertificateCanvasEditor,
	convertFlowTreeToCanvas,
} from '@kodezen/editor';
import TopBar from '@Components/TopBar';
import Button from '@Components/Button';
import Preloader from '@Components/Loader/Preloader';
import NavigationBlocker from '@Components/NavigationBlocker';
import { API, namespace, route_path } from '@Utils/helper';
import { wpMediaUpload } from '@Utils/wpMediaUpload';
import { EDITOR_I18N_CONFIG } from '@Utils/editorI18nConfig';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import PageSetupModal from './PageSetupModal';
import {
	DEFAULT_PAGE_CONFIG,
	configFromRoot,
	normalizeTree,
	rootAttributes,
	samePageConfig,
} from './pageSetup';

/**
 * Certificate builder page — hosts the @kodezen/editor block editor. The design
 * is stored as a JSON tree in the academy_certificate post meta via the
 * certificate-builder REST routes; the PDF is rendered server-side from that
 * tree. Academy's dynamic codes are fed to the editor as merge tags so authors
 * can drop `{{learner}}` etc. into text.
 *
 * The editor runs in `certificate` mode, so the page — a fixed sheet at the
 * chosen size and orientation, with the background painted behind the content —
 * is drawn by the editor itself from the tree root. Academy's job is only to
 * put sensible page attributes there: the create wizard (on the certificates
 * list) seeds them, the Page Setup panel edits them, and `pageConfig` mirrors
 * the tree so both stay in step with edits made from the editor's own settings
 * panel.
 *
 * A certificate always exists before this page opens — the wizard creates it
 * and redirects here — so `id` is required. Unsaved edits (title, page
 * setup, or the canvas itself) are tracked in `isDirty` and guarded by
 * `NavigationBlocker`, same as the course editor.
 */

const MERGE_TAGS = [
	{ tag: '{{learner}}', label: __('Learner name', 'academy') },
	{ tag: '{{course_title}}', label: __('Course title', 'academy') },
	{ tag: '{{instructor}}', label: __('Instructor', 'academy') },
	{ tag: '{{course_place}}', label: __('Site name', 'academy') },
	{ tag: '{{completion_date}}', label: __('Completion date', 'academy') },
	{ tag: '{{total_topics}}', label: __('Total topics', 'academy') },
	{ tag: '{{course_requirements}}', label: __('Requirements', 'academy') },
	{ tag: '{{course_materials}}', label: __('Materials', 'academy') },
	{
		tag: '{{what_you_will_learn}}',
		label: __('What you will learn', 'academy'),
	},
	{
		tag: '{{verification_url}}',
		label: __('Verification URL (QR)', 'academy'),
	},
	{
		tag: '{{verification_code}}',
		label: __('Verification Code', 'academy'),
	},
];

const CertificateBuilder = ({ id }) => {
	const editorRef = useRef(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [title, setTitle] = useState(__('Untitled Certificate', 'academy'));
	const [initialTree, setInitialTree] = useState(undefined);
	const [pageConfig, setPageConfig] = useState({ ...DEFAULT_PAGE_CONFIG });
	const [pageSetupOpen, setPageSetupOpen] = useState(false);
	// The editor mounts only once the design has loaded, so initialTree — which
	// the editor reads once, at mount — is already set.
	const [ready, setReady] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const notifyError = (err, fallback) =>
		dispatch(
			showNotification({
				message: err?.response?.data?.message || fallback,
				isShow: true,
				type: 'error',
			})
		);

	useEffect(() => {
		if (!id) return;
		setLoading(true);
		API.get(`${namespace}certificate-builder/${id}`)
			.then((res) => {
				// Anything that isn't already a canvas tree — a `version: 2`
				// flow design, or a legacy Gutenberg one the server just
				// converted into a flow tree — is upgraded to the canvas
				// model here, so EVERY certificate opens in the current
				// builder. The upgrade is in-memory only; it persists on the
				// author's next Save, and the untouched original keeps
				// rendering through the legacy path until then.
				const loaded = res.data.tree
					? normalizeTree(res.data.tree)
					: undefined;
				const tree =
					loaded && loaded.version !== 3
						? convertFlowTreeToCanvas(loaded)
						: loaded;
				setTitle(
					res.data.title || __('Untitled Certificate', 'academy')
				);
				setInitialTree(tree);
				setPageConfig(configFromRoot(tree?.root?.attributes));
				setReady(true);
			})
			.catch((err) =>
				notifyError(err, __('Failed to load certificate.', 'academy'))
			)
			.finally(() => setLoading(false));
	}, [id]);

	/**
	 * The editor's own settings panel edits the same root the Page Setup panel
	 * does, so mirror every tree change back into `pageConfig` — otherwise the
	 * Page Setup panel would reopen showing a page the author has since changed
	 * from the inspector. Only fires on real content edits (block add/move/
	 * remove/attribute change, undo/redo) — never on the initial mount — so
	 * it doubles as the "content changed" signal for `isDirty`.
	 */
	const syncPageConfig = useCallback(({ tree }) => {
		const next = configFromRoot(tree?.root?.attributes);
		setPageConfig((current) =>
			samePageConfig(current, next) ? current : next
		);
		setIsDirty(true);
	}, []);

	/**
	 * Merge a page setup onto a tree root.
	 */
	const withPageConfig = (tree, config) => ({
		...tree,
		root: {
			...tree.root,
			attributes: {
				...tree.root.attributes,
				...rootAttributes(config),
			},
		},
	});

	/**
	 * Apply a page change to the open design. The canvas reads the page frame
	 * from CSS vars, but the editor's own content table (width, padding, fill)
	 * lives on the tree root, so push the new attributes into the live tree too.
	 */
	const applyPageConfig = (config) => {
		setPageConfig(config);
		setPageSetupOpen(false);

		const editor = editorRef.current;
		const tree = editor?.getTree?.();
		if (tree?.root && editor?.setTree) {
			// `setTree` replaces the editor's internal tree directly, which
			// resets its own dirty flag rather than routing through `onChange`
			// (see store.js's SET_TREE) — so `syncPageConfig` never fires for
			// this path, and this page change would otherwise go untracked.
			editor.setTree(withPageConfig(tree, config));
			setIsDirty(true);
		}
	};

	const persist = () => {
		const tree = editorRef.current?.getTree?.();
		if (!tree?.root) return Promise.reject(new Error('no tree'));
		// The mpdf-safe content HTML is stored alongside the tree; certificate
		// mode renders it content-only, and the server wraps it in the page.
		const html = editorRef.current?.getHtml?.();

		setSaving(true);
		// The tree already carries the page — whichever panel last edited it.
		const payload = { title, tree: normalizeTree(tree), html };
		return API.post(`${namespace}certificate-builder/${id}`, payload)
			.then((res) => {
				dispatch(
					showNotification({
						message: __('Certificate saved.', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				setIsDirty(false);
				return res.data.id;
			})
			.catch((err) =>
				notifyError(err, __('Failed to save certificate.', 'academy'))
			)
			.finally(() => setSaving(false));
	};

	const backToList = () =>
		navigate(`${route_path}admin.php?page=academy-certificates`);

	const previewAsPdf = async (tree) => {
		try {
			const res = await API.post(
				`${namespace}certificate-builder/${id}/preview`,
				{ tree },
				{ responseType: 'blob' }
			);
			window.open(URL.createObjectURL(res.data), '_blank');
		} catch (err) {
			notifyError(
				err,
				__('Failed to generate the PDF preview.', 'academy')
			);
		}
	};

	if (loading) {
		return <Preloader />;
	}

	return (
		<>
			<NavigationBlocker
				when={isDirty}
				url={`${route_path}admin.php?page=academy-certificates&id=${id}&action=edit`}
			/>
			<TopBar
				render={() => (
					<h3 className="academy-topbar-heading">
						<span
							role="presentation"
							className="academy-icon academy-icon--angle-right academy-cursor-pointer"
							onClick={backToList}
						></span>
						<input
							type="text"
							className="academy-certificate-title-input"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								setIsDirty(true);
							}}
							placeholder={__('Certificate title', 'academy')}
							style={{
								border: 'none',
								background: 'transparent',
								fontSize: '18px',
								fontWeight: 600,
								minWidth: '320px',
								outline: 'none',
							}}
						/>
					</h3>
				)}
				label={__('Certificate Builder', 'academy')}
				rightContent={() => (
					<>
						<Button
							preset="transparent"
							border="gray"
							icon={
								<span className="academy-icon academy-icon--settings"></span>
							}
							label={__('Page Setup', 'academy')}
							onClick={() => setPageSetupOpen(true)}
						/>
						<Button
							preset="purple"
							label={__('Save', 'academy')}
							isLoading={saving}
							loadingLabel={__('Saving…', 'academy')}
							isDisabled={!isDirty}
							onClick={persist}
						/>
					</>
				)}
			/>

			<div
				className="academy-certificate-builder"
				style={{ padding: '16px 24px' }}
			>
				{ready && (
					<CertificateCanvasEditor
						ref={editorRef}
						suffix="academy"
						initialTree={initialTree}
						mergeTags={MERGE_TAGS}
						mediaUpload={wpMediaUpload}
						config={EDITOR_I18N_CONFIG}
						onChange={syncPageConfig}
						onPreviewPdf={previewAsPdf}
					/>
				)}
			</div>

			<PageSetupModal
				isOpen={pageSetupOpen}
				config={pageConfig}
				onClose={() => setPageSetupOpen(false)}
				onApply={applyPageConfig}
			/>
		</>
	);
};

export default CertificateBuilder;
