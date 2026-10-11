import {
	current_user_id,
	makeRequest2,
	API,
	rest_url,
	ajaxurl,
	academy_nonce,
} from '@Utils/helper';
import { setIn } from 'formik';

// Sets a value the editor loads or defaults after mount (not a user edit)
// without marking the course as having unsaved changes: while the form is
// still clean it becomes part of the saved baseline. Once the user has
// started editing it's set normally, so their edits keep their dirty state.
export const setLoadedFieldValue = (formik, name, value) => {
	if (formik.dirty) {
		formik.setFieldValue(name, value);
		return;
	}
	formik.resetForm({ values: setIn(formik.values, name, value) });
};

// The course's own single (marketing) page — just its permalink.
export const getCoursePreviewUrl = (courseLink) => courseLink || '';

// `academy_course_curriculum` is a list of modules, each holding its own
// `topics` (lessons/quizzes/…), and a `sub-curriculum` topic nests another
// `topics` list inside itself. Content Drip's prerequisite picker needs the
// actual selectable items (lesson/quiz/assignment/booking/meeting), not the
// modules that contain them, so flatten every level down to a single list.
export const flattenCurriculumTopics = (curriculum = []) => {
	if (!Array.isArray(curriculum)) {
		return [];
	}
	return curriculum.reduce((acc, module) => {
		if (!Array.isArray(module?.topics)) {
			return acc;
		}
		module.topics.forEach((topic) => {
			if (topic?.type === 'sub-curriculum') {
				acc.push(...flattenCurriculumTopics([topic]));
			} else if (topic) {
				acc.push(topic);
			}
		});
		return acc;
	}, []);
};

// A specific curriculum item's learn URL. Resolved server-side (respecting
// `is_enabled_lessons_php_render` and needing the item slug the builder doesn't
// hold) via the `academy/preview_curriculum_item` ajax redirect →
// `Helper::get_topic_play_link`.
export const getItemPreviewUrl = (courseId, type, id) => {
	if (!courseId || !type || !id) {
		return '';
	}
	const params = new URLSearchParams({
		action: 'academy/preview_curriculum_item',
		course_id: courseId,
		type,
		item_id: id,
		security: academy_nonce,
	});
	return `${ajaxurl}?${params.toString()}`;
};

const ecmMeta = (courseMeta = {}, post_type = null) => {
	const { field_groups = [] } = window.EasyContentManagerGlobal || {};

	if (!Array.isArray(field_groups) || field_groups.length === 0 || !post_type)
		return {};

	return field_groups.reduce((acc, current) => {
		if (current.location?.post_type?.includes(post_type)) {
			current?.custom_fields?.forEach((fieldItem) => {
				const metaKey = fieldItem?.meta_key;
				const defaultValue = fieldItem?.general?.field_default_value;

				if (!metaKey) return;
				acc[metaKey] = courseMeta?.[metaKey] ?? defaultValue;
			});
		}
		return acc;
	}, {});
};

export const getCustomTaxonomy = async (courseData = null) => {
	// For custom taxonomies handling. Do not touch it.
	return await API.get(`${rest_url}wp/v2/types/academy_courses`)
		.then(({ data }) =>
			data.taxonomies.filter(
				(item) =>
					item !== 'academy_courses_category' &&
					item !== 'academy_courses_tag'
			)
		)
		.then((taxonomies) =>
			Promise.all(
				taxonomies.map(
					async (item) =>
						await API.get(
							`${rest_url}wp/v2/taxonomies/${item}`
						).then((res) => res.data)
				)
			)
		)
		.then((response) => {
			const taxonomies = response.reduce(
				(acc, item) => ({ ...acc, [item.slug]: [] }),
				{}
			);

			if (!courseData) return taxonomies;
			Object.keys(taxonomies).forEach((key) => {
				if (courseData[key] && Array.isArray(courseData[key])) {
					return (taxonomies[key] = courseData[key].map(
						(item) => item
					));
				}
			});
			return taxonomies;
		});
};

export const getCourseInitialValues = (
	id,
	courseData,
	customTaxonomies = {}
) => {
	if (id && courseData && courseData.length > 0) {
		courseData = courseData.find(
			(item) => parseInt(item?.id) === parseInt(id)
		);

		const {
			status,
			title,
			slug,
			link,
			content,
			excerpt,
			author,
			academy_courses_category,
			academy_courses_tag,
			featured_media,
			meta,
			instructors,
			password,
			date,
			sticky,
			menu_order,
		} = courseData;

		const hasEngineType = meta?.academy_ecommerce_engine
			? {
					academy_ecommerce_engine: meta?.academy_ecommerce_engine,
				}
			: {};

		return {
			post_ID: id,
			title: title?.raw ?? title?.rendered,
			link,
			slug,
			content: content?.raw ?? content?.rendered,
			excerpt: excerpt?.raw ?? excerpt?.rendered,
			author,
			featured_media,
			status,
			academy_courses_category,
			academy_courses_tag,
			sticky: sticky ? true : false,
			menu_order: parseInt(menu_order, 10) || 0,
			tags: [],
			meta: {
				...hasEngineType,
				academy_course_attachments: meta?.academy_course_attachments,
				academy_course_certificate_id:
					meta?.academy_course_certificate_id,
				academy_course_enable_certificate:
					meta?.academy_course_enable_certificate,
				academy_course_type: meta?.academy_course_type,
				academy_course_price: meta?.academy_course_price ?? 0,
				academy_course_language: meta?.academy_course_language,
				academy_rcp_membership_levels:
					meta?.academy_rcp_membership_levels,
				academy_courses_mempr_membership_id:
					meta?.academy_courses_mempr_membership_id,
				academy_courses_gameengine_rules:
					meta?.academy_courses_gameengine_rules,
				academy_courses_gameengine_require_all:
					meta?.academy_courses_gameengine_require_all,
				academy_courses_gameengine_nudge_enabled:
					meta?.academy_courses_gameengine_nudge_enabled,
				academy_courses_gameengine_nudge_threshold:
					meta?.academy_courses_gameengine_nudge_threshold,
				academy_courses_gameengine_allow_purchase:
					meta?.academy_courses_gameengine_allow_purchase,
				_gameengine_restrict_type: meta?._gameengine_restrict_type,
				_gameengine_restrict_value: meta?._gameengine_restrict_value,
				_gameengine_restrict_message: meta?._gameengine_restrict_message,
				_gameengine_lock_media: meta?._gameengine_lock_media,
				academy_course_product_id: meta?.academy_course_product_id,
				academy_course_download_id: meta?.academy_course_download_id,
				academy_course_audience: meta?.academy_course_audience,
				academy_course_benefits: meta?.academy_course_benefits,
				academy_course_curriculum: meta?.academy_course_curriculum,
				academy_course_difficulty_level:
					meta?.academy_course_difficulty_level,
				academy_course_duration: meta?.academy_course_duration,
				academy_course_intro_video: meta?.academy_course_intro_video,
				academy_course_materials_included:
					meta?.academy_course_materials_included,
				academy_course_max_students: meta?.academy_course_max_students,
				academy_course_expire_enrollment:
					meta?.academy_course_expire_enrollment,
				academy_course_requirements: meta?.academy_course_requirements,
				academy_course_drip_content_enabled:
					meta?.academy_course_drip_content_enabled,
				academy_course_drip_content_type:
					meta?.academy_course_drip_content_type,
				academy_course_module_drip_basis:
					meta?.academy_course_module_drip_basis,
				academy_course_module_drip_start_date:
					meta?.academy_course_module_drip_start_date,
				academy_is_enabled_course_qa:
					meta?.academy_is_enabled_course_qa,
				academy_is_disabled_course_review:
					meta?.academy_is_disabled_course_review,
				academy_course_coming_soon_end_date:
					meta?.academy_course_coming_soon_end_date,
				academy_is_enabled_course_announcements:
					meta?.academy_is_enabled_course_announcements,
				academy_prerequisite_courses:
					meta?.academy_prerequisite_courses,
				academy_prerequisite_categories:
					meta?.academy_prerequisite_categories,
				academy_prerequisite_type: meta?.academy_prerequisite_type,
				academy_scorm_file: meta?.academy_scorm_file
					? meta.academy_scorm_file
					: '',
				_academy_course_builder_scorm_file:
					meta?._academy_course_builder_scorm_file
						? meta._academy_course_builder_scorm_file
						: '',
				assigned_buddyboss_groups: meta.assigned_buddyboss_groups
					? meta.assigned_buddyboss_groups
					: [],
				assigned_buddypress_groups: meta.assigned_buddypress_groups
					? meta.assigned_buddypress_groups
					: [],
				is_buddypress_notification_active:
					meta.is_buddypress_notification_active
						? meta.is_buddypress_notification_active
						: false,
				is_buddyboss_notification_active:
					meta.is_buddyboss_notification_active
						? meta.is_buddyboss_notification_active
						: false,
				validate_youtube_api: meta?.validate_youtube_api ?? '',
				is_fluent_community_feed_active:
					meta.is_fluent_community_feed_active ?? false,
				fluent_community_notifiable_events:
					meta.fluent_community_notifiable_events ?? [],
				fluent_community_space_id: meta.fluent_community_space_id ?? 0,
				academy_course_is_sticky:
					meta?.academy_course_is_sticky ?? false,
				academy_course_timer_enabled:
					meta?.academy_course_timer_enabled ?? false,
				// Registered as an integer meta (course-active-timer addon), so
				// it must never be an empty string — the REST create/update
				// rejects that with a 400.
				academy_course_timer_duration_value:
					parseInt(meta?.academy_course_timer_duration_value, 10) ||
					0,
				academy_course_timer_duration_unit:
					meta?.academy_course_timer_duration_unit ?? 'minutes',
				academy_course_timer_expiry_action:
					meta?.academy_course_timer_expiry_action ?? 'course_lock',
				// register_post_meta() returns '' (not null/undefined) for an
				// unset single string meta, so ?? never applies its fallback
				// on a course that's never had this saved — || is needed to
				// actually land on 'course_default'.
				academy_group_plus_seat_validity_mode:
					meta?.academy_group_plus_seat_validity_mode ||
					'course_default',
				// Registered as an integer meta (group-plus addon), so it
				// must never be an empty string — the REST create/update
				// rejects that with a 400.
				academy_group_plus_seat_validity_duration_value:
					parseInt(
						meta?.academy_group_plus_seat_validity_duration_value,
						10
					) || 0,
				academy_group_plus_seat_validity_duration_unit:
					meta?.academy_group_plus_seat_validity_duration_unit ??
					'days',
				// Registered as a JSON-string meta (an array of
				// {min_seats, price} tiers) — '[]' is the "no tiers" empty
				// state, not '' (which would round-trip through
				// JSON.parse('') as an error every load).
				academy_group_plus_price_tiers:
					meta?.academy_group_plus_price_tiers || '[]',
				...ecmMeta(meta, 'academy_courses'),
			},
			password: password ? password : '',
			date: date ? date : '',
			instructors,
			...customTaxonomies, // For custom taxonomies handling. Do not touch it.
		};
	}

	const baseMeta = {
		academy_course_type: 'free',
		academy_course_price: 0,
		academy_course_attachments: [],
		academy_course_certificate_id: 0,
		academy_course_enable_certificate: true,
		academy_rcp_membership_levels: [],
		academy_courses_mempr_membership_id: 0,
		academy_courses_gameengine_rules: [],
		academy_courses_gameengine_require_all: false,
		academy_courses_gameengine_nudge_enabled: false,
		academy_courses_gameengine_nudge_threshold: 80,
		academy_courses_gameengine_allow_purchase: false,
		_gameengine_restrict_type: 'none',
		_gameengine_restrict_value: '',
		_gameengine_restrict_message: '',
		_gameengine_lock_media: false,
		academy_course_product_id: 0,
		academy_course_download_id: 0,
		acdemy_store_product: false,
		academy_course_audience: '',
		academy_course_benefits: '',
		academy_course_curriculum: '',
		academy_course_difficulty_level: 'experts',
		academy_course_duration: [0, 0, 0],
		academy_course_intro_video: [],
		academy_course_materials_included: '',
		academy_course_max_students: 0,
		academy_course_expire_enrollment: 0,
		academy_course_requirements: '',
		academy_course_drip_content_enabled: false,
		academy_course_drip_content_type: 'schedule_by_date',
		academy_course_module_drip_basis: 'enrollment',
		academy_course_module_drip_start_date: '',
		academy_is_enabled_course_qa: true,
		academy_is_disabled_course_review: false,
		academy_course_coming_soon_end_date: '',
		academy_is_enabled_course_announcements: true,
		academy_prerequisite_type: 'course',
		academy_prerequisite_courses: [],
		academy_prerequisite_categories: [],
		academy_course_language: '',
		academy_scorm_file: '',
		assigned_buddyboss_groups: [],
		assigned_buddypress_groups: [],
		is_buddyboss_notification_active: false,
		is_buddypress_notification_active: false,
		validate_youtube_api: '',
		is_fluent_community_feed_active: false,
		fluent_community_notifiable_events: [],
		fluent_community_space_id: 0,
		academy_course_is_sticky: false,
		academy_course_timer_enabled: false,
		// Integer meta (course-active-timer addon) — 0, never '', or the REST
		// create/update returns a 400 ("not of type integer").
		academy_course_timer_duration_value: 0,
		academy_course_timer_duration_unit: 'minutes',
		academy_course_timer_expiry_action: 'course_lock',
		academy_group_plus_seat_validity_mode: 'course_default',
		// Integer meta (group-plus addon) — 0, never '', or the REST
		// create/update returns a 400 ("not of type integer").
		academy_group_plus_seat_validity_duration_value: 0,
		academy_group_plus_seat_validity_duration_unit: 'days',
		academy_group_plus_price_tiers: '[]',
	};

	return {
		title: '',
		slug: '',
		content: '',
		excerpt: '',
		author: current_user_id,
		// New courses start as draft; publishing is an explicit action and the
		// builder auto-saves the draft in the background.
		status: 'draft',
		sticky: false,
		menu_order: 0,
		academy_courses_category: [],
		tags: [],
		meta: {
			...baseMeta,
			...ecmMeta(baseMeta, 'academy_courses'),
		},
		instructors: [current_user_id],
		...customTaxonomies, // For custom taxonomies handling. Do not touch it.
	};
};

export const aiGenerateCourse = async (prompt) => {
	return await makeRequest2({
		action: 'academy/ai_integration/chatgpt',
		prompt_handler: 'course_generation',
		prompt,
	}).then((res) => {
		return res;
	});
};
