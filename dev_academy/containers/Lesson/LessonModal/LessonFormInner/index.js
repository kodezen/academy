import React, { useEffect, useState } from 'react';
import ContentDrip from '@Components/ContentDrip';
import LessonMeta from './LessonMeta';
import PostTitle from '@Components/Form/PostTitle';
import PropTypes from 'prop-types';
import Editor from '@Components/Editor';
import UploadImage from '@Components/UploadImage';
import Attachment from '@Components/Attachment';
import { __ } from '@wordpress/i18n';
import {
	getAddonActiveStatus,
	generateSlug,
	makeRequest,
	API,
	rest_url,
	ecm_is_active,
} from '@Utils/helper';
import { useFormikContext, Field } from 'formik';
import { applyFilters } from '@wordpress/hooks';
import { useSelector } from 'react-redux';
import AiTextGenerator from '@Components/AiTextGenerator';
import CustomFieldsBox from '@Components/CustomFieldsBox';
import { Button } from '@Components/ui';
import Preloader from '@Components/Loader/Preloader';
import useEcmFilterReady from '@Utils/hooks/useEcmFilterReady';

const TAXONOMY_HOOK = 'ecm.react-editor.register-taxonomy';

const propTypes = {
	onRequestClose: PropTypes.func,
	dripContentType: PropTypes.string,
	isDripContentEnable: PropTypes.bool,
	topics: PropTypes.array,
	currentItemId: PropTypes.number,
};

export default function LessonFormInner({
	dripContentType,
	isDripContentEnable,
	topics,
	currentItemId,
}) {
	const [isDuplicateSlug, setDuplicateSlug] = useState(false);
	// Slug is collapsed by default (like the course permalink) and only revealed
	// for editing when the user asks; `slugBeforeEdit` lets Cancel restore it.
	const [isSlugEditOpen, setSlugEditOpen] = useState(false);
	const [slugBeforeEdit, setSlugBeforeEdit] = useState('');
	const { values, setFieldValue } = useFormikContext();

	// ECM (Easy Content Manager) registers this filter from its own,
	// separately-enqueued script — right after mount there's a real window
	// where ECM is active but hasn't registered it yet. Wait for it instead
	// of reading applyFilters() once and getting stuck with `null` (and the
	// taxonomy-existence check below skipping itself for the rest of this
	// form's life — its effect only fired once, at mount).
	const ecmTaxonomyReady = useEcmFilterReady(TAXONOMY_HOOK);
	// Slot for ECM's custom taxonomies registered against the
	// `academy_lessons` post type.
	const customTaxonomy = ecmTaxonomyReady
		? applyFilters(
				TAXONOMY_HOOK,
				null,
				values,
				setFieldValue,
				'academy_lessons'
			)
		: null;
	// ECM's taxonomy filter always returns a real element whenever the addon
	// is active, even with zero custom taxonomies registered for lessons — so
	// `customTaxonomy` alone can't tell us whether the card below will
	// actually have anything in it. Ask the same question ECM's own
	// ReactTaxonomy asks internally (does this post type have any taxonomies
	// beyond the built-in ones) before showing the card.
	const [hasCustomTaxonomy, setHasCustomTaxonomy] = useState(null);
	useEffect(() => {
		if (!customTaxonomy) {
			return;
		}
		let cancelled = false;
		API.get(`${rest_url}wp/v2/types/academy_lessons`)
			.then(({ data }) => {
				if (!cancelled) {
					setHasCustomTaxonomy((data?.taxonomies || []).length > 0);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setHasCustomTaxonomy(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [ecmTaxonomyReady]);
	const allAddons = useSelector((state) => state.addons);

	const isContentDripActive = getAddonActiveStatus(
		allAddons,
		'content-drip',
		true
	);
	// Only surface the drip card when ContentDrip will actually render something:
	// the "set from Course Builder" info (type === null) or the settings UI
	// (drip enabled with a concrete, non-sequential, non-module type — those two
	// have no per-lesson fields, so ContentDrip itself renders nothing for them).
	// Otherwise it renders an empty bordered box — e.g. on the standalone Lessons
	// page, or for a 'schedule_by_module' course.
	const showContentDrip =
		isContentDripActive &&
		(dripContentType === null ||
			(isDripContentEnable &&
				dripContentType !== '' &&
				dripContentType !== 'schedule_by_sequentially' &&
				dripContentType !== 'schedule_by_module'));

	useEffect(() => {
		if (values.lesson_name) {
			makeRequest({
				action: 'academy/lesson_slug_unique_check',
				ID: values?.ID,
				lesson_name: values.lesson_name,
			}).then((res) => {
				setDuplicateSlug(res?.data?.data);
			});
		}
	}, [values.lesson_name]);

	return (
		<div className="academy-lesson-form">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
				{/* Main: authoring (title, slug, content, media/meta) */}
				<div className="min-w-0 flex-1">
					<div className="rounded-lg border border-solid border-academy-border bg-academy-surface p-6">
						<div className="academy-column-items mb-2">
							<div className="academy-ai-generate--item-wrap">
								<h3 className="academy-title">
									{__('Lesson Title', 'academy')}
								</h3>
								<AiTextGenerator
									title={__(
										'Generate Lesson Title',
										'academy'
									)}
									name="lesson_title"
									saveHandler={setFieldValue}
									label={__(
										'Append to Lesson Title',
										'academy'
									)}
								/>
							</div>

							<PostTitle
								name="lesson_title"
								label={__('Add lesson title here', 'academy')}
								defaultValue={values.lesson_title}
								saveValueHandler={setFieldValue}
								onBlurHandler={() => {
									if (!values?.ID) {
										setFieldValue(
											'lesson_name',
											generateSlug(values.lesson_title)
										);
									}
								}}
							/>
						</div>

						<div className="academy-column-items academy-mb-6">
							{!isSlugEditOpen ? (
								<div className="flex flex-wrap items-center gap-2">
									<strong className="text-academy-text">
										{__('Permalink:', 'academy')}
									</strong>
									<span className="academy-lesson-slug-value break-all text-primary">
										{values.lesson_name || (
											<em className="text-academy-gray-dark">
												{__(
													'auto-generated from title',
													'academy'
												)}
											</em>
										)}
									</span>
									{(values.lesson_title ||
										values.lesson_name) && (
										<Button
											as="button"
											type="button"
											variant="secondary"
											size="sm"
											onClick={() => {
												setSlugBeforeEdit(
													values.lesson_name || ''
												);
												setSlugEditOpen(true);
											}}
										>
											{__('Edit', 'academy')}
										</Button>
									)}
								</div>
							) : (
								<>
									<div className="academy-lesson-slug-edit flex items-center gap-2">
										<strong className="text-academy-text">
											{__('Permalink:', 'academy')}
										</strong>
										<Field
											className={`academy-lesson-slug-input${
												isDuplicateSlug
													? ' academy-input--error'
													: ''
											}`}
											name="lesson_name"
											type="text"
										/>
										<Button
											as="button"
											type="button"
											size="sm"
											onClick={() =>
												setSlugEditOpen(false)
											}
										>
											{__('OK', 'academy')}
										</Button>
										<Button
											as="button"
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => {
												setFieldValue(
													'lesson_name',
													slugBeforeEdit
												);
												setSlugEditOpen(false);
											}}
										>
											{__('Cancel', 'academy')}
										</Button>
									</div>
									{isDuplicateSlug && (
										<div className="academy-warning">
											{isDuplicateSlug}
										</div>
									)}
								</>
							)}
						</div>

						<div className="academy-column-items academy-mb-6">
							<div className="academy-ai-generate--item-wrap">
								<h3 className="academy-title">
									{__('Lesson Content', 'academy')}
								</h3>
								<AiTextGenerator
									title={__(
										'Generate Lesson Content',
										'academy'
									)}
									placeholder={__(
										'Exp: Create a description about…',
										'academy'
									)}
									name="lesson_content"
									saveHandler={setFieldValue}
									label={__(
										'Append to Lesson Description',
										'academy'
									)}
								/>
							</div>

							<div className="academy-editor-tinymce-wrapper">
								<Editor
									name="lesson_content"
									defaultValue={values?.lesson_content}
									saveValueHandler={setFieldValue}
									suffix="lesson"
								/>
							</div>
						</div>

						<LessonMeta
							values={values.meta}
							saveValueHandler={setFieldValue}
						/>

						<CustomFieldsBox
							postType="academy_lessons"
							label={__('lessons', 'academy')}
							values={values}
							setFieldValue={setFieldValue}
							className="rounded-lg border border-solid border-academy-border bg-academy-surface p-5 mt-6"
						/>
					</div>
				</div>

				{/* Sidebar: settings (feature image, attachment, content drip) */}
				<div className="w-full shrink-0 lg:w-[340px]">
					<div className="flex flex-col gap-6">
						<div className="academy-lesson-sidebar-image academy-lesson-sidebar-card rounded-lg border border-solid border-academy-border bg-academy-surface p-5">
							<div className="academy-ai-generate--item-wrap">
								<h3 className="academy-lesson-sidebar-card__title">
									{__('Feature Image', 'academy')}
								</h3>
							</div>
							<p className="academy-lesson-sidebar-card__hint">
								{__('Recommended size: 700 × 430 px.', 'academy')}
							</p>
							<UploadImage
								name={'meta.featured_media'}
								saveValueHandler={setFieldValue}
								value={parseInt(values.meta.featured_media)}
								variant="dropzone"
								compact
								imageSize=""
								supportedFile="JPG, JPEG, GIF, PNG"
							/>
						</div>

						<div className="academy-lesson-sidebar-card rounded-lg border border-solid border-academy-border bg-academy-surface p-5">
							<h3 className="academy-lesson-sidebar-card__title">
								{__('Attachment', 'academy')}
							</h3>
							<p className="academy-lesson-sidebar-card__hint">
								{__('A file students can download from the lesson.', 'academy')}
							</p>
							<Attachment
								name="meta.attachment"
								value={parseInt(values.meta.attachment)}
								saveValueHandler={setFieldValue}
								variant="dropzone"
								compact
								imageSize=""
								supportedFile="JPG, JPEG, GIF, PNG, PDF, DOCX"
							/>
						</div>

						{showContentDrip && (
							<div className="rounded-lg border border-solid border-academy-border bg-academy-surface p-5">
								<ContentDrip
									type={dripContentType}
									name="drip_content"
									topics={topics}
									currentItemId={currentItemId}
									isDripContentEnable={isDripContentEnable}
								/>
							</div>
						)}
						{ecm_is_active &&
							(!ecmTaxonomyReady ||
							(customTaxonomy && hasCustomTaxonomy === null) ? (
								<div className="rounded-lg border border-solid border-academy-border bg-academy-surface p-5">
									<Preloader size="sm" />
								</div>
							) : (
								customTaxonomy &&
								hasCustomTaxonomy && (
									// `academy-widget--taxonomy` isn't for layout here — it's
									// the scope `assets/scss/backend/ecm-taxonomy-overrides.scss`
									// keys its checkbox/search-box/button styling off of.
									// Without it none of that CSS ever matches ECM's widget.
									<div className="academy-widget--taxonomy rounded-lg border border-solid border-academy-border bg-academy-surface p-5">
										{customTaxonomy}
									</div>
								)
							))}
					</div>
				</div>
			</div>
		</div>
	);
}

LessonFormInner.propTypes = propTypes;
