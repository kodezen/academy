/* eslint-disable camelcase */

import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import moment from 'moment-timezone';

// The icon font's crown glyph doesn't render in every environment (missing
// glyph in the built font), so Pro-upsell UI (upgrade modal, locked-content
// overlay) uses this inline SVG instead.
export const CrownIcon = ({ size = 20, color = 'currentColor', className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		className={className}
	>
		<path
			d="M18.9996 20.0003C19.5519 20.0003 19.9996 20.448 19.9996 21.0003C19.9994 21.5524 19.5518 22.0003 18.9996 22.0003H4.99962C4.44764 22.0001 3.99979 21.5523 3.99962 21.0003C3.99962 20.4482 4.44753 20.0005 4.99962 20.0003H18.9996ZM12.1998 2.02081C12.3321 2.03859 12.4616 2.0733 12.5846 2.12531L12.7633 2.21613L12.9283 2.32941C13.0329 2.41186 13.1264 2.50751 13.2057 2.61456L13.3141 2.78351L13.3229 2.80011L16.2692 8.39191L20.5328 4.74054L20.5524 4.72394C20.7985 4.52383 21.1018 4.40687 21.4186 4.38995L21.5377 4.388C21.7744 4.39418 22.0064 4.45663 22.2145 4.56964L22.316 4.63019L22.4137 4.69855C22.6014 4.84297 22.7515 5.03052 22.8531 5.24445L22.9 5.35284L22.9381 5.46613C23.0157 5.73111 23.0187 6.0136 22.9459 6.28156L22.9449 6.28546L20.1109 16.5316C19.9952 16.9506 19.7459 17.3205 19.401 17.5853C19.056 17.8502 18.6338 17.9959 18.1988 17.9993H5.80333C5.36815 17.9963 4.94558 17.851 4.60021 17.5862C4.25493 17.3214 4.00513 16.951 3.88927 16.5316L1.05626 6.28644L1.05529 6.28253L1.02892 6.16632C0.977807 5.89486 1.00218 5.61335 1.10118 5.35382L1.14806 5.24542C1.26662 4.99584 1.45225 4.78265 1.68517 4.63116L1.78673 4.57062C1.99482 4.45762 2.22678 4.39514 2.46349 4.38898L2.58263 4.39093L2.70079 4.40167C2.97439 4.43814 3.23348 4.54983 3.44884 4.72491L2.81798 5.50031L2.82482 5.49152L3.44884 4.72491L3.46837 4.74152L7.73009 8.39288L10.6774 2.80011L10.6861 2.78351C10.8156 2.54845 11.0059 2.35268 11.2369 2.21613L11.4156 2.12531C11.5998 2.04744 11.7984 2.0072 11.9996 2.00714L12.1998 2.02081ZM9.49474 9.33722L8.60997 8.87042L8.63927 8.88702L9.49474 9.33722L9.48888 9.34796L9.37364 9.53546C9.24777 9.71662 9.0924 9.87611 8.91368 10.0071C8.67559 10.1817 8.40176 10.3015 8.11193 10.3577C7.82207 10.4139 7.52304 10.4053 7.23693 10.3323C7.02229 10.2776 6.81877 10.1876 6.63439 10.0667L6.45665 9.93585L6.44298 9.92413L7.06993 9.19269L7.09337 9.16437L6.44298 9.92413L3.42052 7.33429L5.817 15.9984V15.9993H18.1832V15.9984L20.5797 7.33234L17.5563 9.92316L16.9059 9.16339V9.16437L17.5563 9.92316C17.5518 9.92698 17.5471 9.93113 17.5426 9.93488L17.3658 10.0657C17.1815 10.1866 16.9779 10.2766 16.7633 10.3314C16.4772 10.4043 16.1781 10.4129 15.8883 10.3568C15.5985 10.3005 15.3246 10.1807 15.0865 10.0062C14.9078 9.87515 14.7524 9.71561 14.6266 9.53448L14.5113 9.34698L14.5055 9.33624L15.36 8.88605L15.3902 8.86945L14.5055 9.33624L11.9996 4.57941L9.49474 9.33722Z"
			fill={color}
		/>
	</svg>
);

export const {
	nonce,
	academy_nonce,
	rest_url,
	ajaxurl,
	namespace,
	plugin_root_url,
	plugin_root_path,
	site_url,
	route_path,
	is_plain_permalink,
	menu,
	admin_url,
	dashboard,
	logout_url,
	woocommerce_is_active,
	edd_is_active,
	pmpro_is_active,
	current_user_id,
	is_pro,
	is_admin,
	is_rtl,
	addons,
	current_user_can,
	customize_url,
	woo_store,
	editor_settings,
	login_url,
	current_permalink,
	is_enabled_academy_login,
	toplevel_menu_icon_url,
	toplevel_menu_title,
	logo_url,
	zoomSetup,
	is_disabled_lessons_right_click,
	is_enabled_course_share,
	is_notes_addon_active,
	academy_learn_topbar,
	is_enabled_course_review,
	is_enabled_course_wishlist,
	is_enabled_lessons_content_title,
	lessons_topic_length,
	is_enabled_earning,
	users_can_register,
	admin_notices,
	storeengine_addons,
	storeengine_nonce,
	storeengine_is_active,
	youtube_api_key,
	is_ablocks_active,
	is_storeengine_active,
	certificates,
	academy_is_hp_lesson_active,
	ecm_is_active,
	active_plugins,
	bp_components_status,
	is_block_theme_active,
	academy_learn_page_theme_mode,
	staff_permissions,
	native_submenu_items
	// `AcademyGlobal` is only localized on Academy-owned views. This util gets
	// pulled into shared bundles that can also load elsewhere (e.g. a 404), so
	// fall back to an empty object instead of throwing a destructure TypeError
	// that takes down the whole bundle.
} = window.AcademyGlobal || {};

/**
 * `staff_permissions` is `null` for an admin or an ordinary (non-staff) user
 * (see `AcademyProRolePermission\RolePermission::localize_staff_permissions()`)
 * — unrestricted, so `can()` always allows. For a managed staff user it's the
 * exact list of dotted permission slugs (e.g. `academy.courses.update`)
 * granted via Manage Roles — the same source of truth the server's own
 * `RestGuard`/`AjaxGuard` enforce against, so a control this gates is
 * disabled if and only if the matching request would actually be rejected.
 *
 * Free-plugin-only installs (no role-permission addon) never set this key at
 * all, so it's `undefined` there too — same "unrestricted" behavior.
 *
 * @param {string} slug e.g. 'academy.courses.update'
 * @return {boolean} Whether the current user may perform this action.
 */
export const can = (slug) =>
	!Array.isArray(staff_permissions) || staff_permissions.includes(slug);

/**
 * True for a managed staff user (any account holding at least one Manage
 * Roles permission); false for a real admin or an ordinary non-staff user.
 * For a control gated on a whole admin-only surface (Tools, Add-ons, ...)
 * that AjaxGuard/RestGuard deny to every staff member outright — regardless
 * of which specific permission they hold — there's no single dotted slug to
 * pass to `can()`; check `!is_staff` instead.
 *
 * @return {boolean}
 */
export const is_staff = Array.isArray(staff_permissions);

/**
 * Only a site admin can turn addons on (or buy Pro), so only they should see
 * the "Off"/"PRO" badges, locked previews and upgrade prompts — and only in
 * wp-admin. The frontend dashboard (`is_admin` false) is the instructor view,
 * so it never shows them, even when an admin is the one browsing it. Staff
 * get the addon-less UI too.
 *
 * @return {boolean}
 */
export const can_manage_addons = Boolean(
	is_admin && current_user_can?.manage_options
);

/**
 * User-facing "why is this disabled" copy for a gated slug, mirroring
 * `AcademyProRolePermission\Permissions::denied_message()` server-side so the
 * tooltip and the eventual API error (if a request slips through anyway) say
 * the same thing.
 *
 * @param {string} slug e.g. 'academy.courses.update'
 * @return {string} The message to show the user.
 */
export const permissionDeniedMessage = (slug) => {
	const parts = String(slug).split('.');
	const resource = parts[1] ?? '';
	const verb = parts[2] ?? '';
	if (!resource) {
		return __(
			"You don't have permission to perform this action. Please contact your site administrator if you need access.",
			'academy'
		);
	}
	const verbs = {
		create: __('create', 'academy'),
		update: __('update', 'academy'),
		delete: __('delete', 'academy'),
	};
	const action = verbs[verb] ?? __('manage', 'academy');
	const resourceLabel = resource.replace(/_/g, ' ');
	return sprintf(
		/* translators: 1: action verb (create/update/delete/manage). 2: resource name (courses, lessons, ...). */
		__(
			"You don't have permission to %1$s %2$s. Please contact your site administrator to request access.",
			'academy'
		),
		action,
		resourceLabel
	);
};

export const API = axios.create({
	baseURL: rest_url,
	headers: {
		'content-type': 'application/json',
		'X-WP-Nonce': nonce,
		'Cache-Control': 'no-cache', // Prevent caching
	},
});
export const generateSlug = (value) => {
	return value
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
};

export const generateRandomSlug = (length = 3) => {
	return (
		Math.random().toString(20).substr(2, length) +
		new Date().getMilliseconds()
	);
};

export const modalMediumWidthStyles = {
	overlay: {
		background: 'rgba(35, 40, 45, 0.62)',
		zIndex: 9999,
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		padding: 0,
		transform: 'translate(-50%, -50%)',
	},
};

export const modalFullWidthStyles = {
	overlay: {
		background: 'rgba(35, 40, 45, 0.62)',
		zIndex: 9999,
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		width: '50%',
		marginRight: '-50%',
		padding: 0,
		transform: 'translate(-50%, -50%)',
	},
};

export const modalCustomSmallStyles = {
	overlay: {
		background: 'rgba(35, 40, 45, 0.62)',
		zIndex: 9999,
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		width: '50%',
		marginRight: '-50%',
		padding: 0,
		transform: 'translate(-50%, -50%)',
	},
};

export const copyToClipboard = (copyText) => {
	const tempInput = document.createElement('input');
	tempInput.value = copyText;
	document.body.appendChild(tempInput);
	tempInput.select();
	document.execCommand('copy');
	document.body.removeChild(tempInput);
};
export const compareConditionValue = (condition, allFieldsValue) => {
	let flag = true;
	if (condition === undefined) return flag;
	for (const [key, value] of Object.entries(condition)) {
		if (allFieldsValue[key] === value) {
			flag = false;
		} else {
			flag = true;
		}
	}
	return flag;
};

export const IsJsonString = (str) => {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};

export const getUserInitialValues = (data) => {
	if (data) {
		const {
			first_name,
			last_name,
			profile_photo,
			cover_photo,
			phone_number,
			designation,
			bio,
			website_url,
			github_url,
			facebook_url,
			twitter_url,
			linkedin_url,
		} = data?.academy_meta;
		return {
			first_name,
			last_name,
			academy_profile_photo: profile_photo,
			academy_cover_photo: cover_photo,
			academy_phone_number: phone_number,
			academy_profile_designation: designation,
			academy_profile_bio: bio,
			academy_website_url: website_url,
			academy_github_url: github_url,
			academy_facebook_url: facebook_url,
			academy_twitter_url: twitter_url,
			academy_linkedin_url: linkedin_url,
		};
	}
};

export const getTagSuggestions = (data) => {
	return (
		data &&
		data.reduce(function (acc, item) {
			acc.push(item?.name);
			return acc;
		}, [])
	);
};

export const prepareSavedTags = (data, values) => {
	if (values && data) {
		return data?.reduce(function (acc, item) {
			if (values.includes(item?.id)) {
				acc.push(item.name);
				return acc;
			}
			return acc;
		}, []);
	}
	return [];
};

export const delayStatusChanged = (
	firstStatus,
	secondStatus,
	thirdStatus,
	setState
) => {
	if (firstStatus) {
		setState(firstStatus);
	}
	setTimeout(() => {
		if (secondStatus) {
			setState(secondStatus);
		}
		if (thirdStatus) {
			setTimeout(() => {
				setState(thirdStatus);
			}, 3000);
		}
	}, 1000);
};

export const generateUserName = (item) => {
	if (item?.first_name || item?.last_name) {
		return item.first_name + ' ' + item.last_name;
	}
	return item?.user_nicename;
};

/**
 * Get global settings data (own properties only).
 * @param {string} [path]         Dot notation path for nested objects/arrays.
 * @param {*}      [defaultValue] Value to return if path is not found.
 * @return {*} The value at the path or defaultValue / full AcademyGlobal object.
 */
export function getSeGlobal(path, defaultValue) {
	const root = window.AcademyGlobal;
	if (!path) {
		return root;
	}

	const value = path.split('.').reduce((obj, key) => {
		if (obj === undefined || obj === null) {
			return undefined;
		}

		// Only access own properties
		return hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	}, root);

	return value === undefined ? defaultValue : value;
}

/**
 * Make AxiosError object.
 *
 * @param  message
 * @param  response
 * @param  code
 * @return {AxiosError}
 */
const makeAxiosError = (message, response, code = 'UNKNOWN') => {
	return new AxiosError(
		message,
		'ERR_' + (code ? code : 'UNKNOWN'),
		response.config,
		response.request,
		response
	);
};

/**
 * Process ajax error data and throw error.
 *
 * @param  data
 * @param  response
 *
 * @throws {Error|AxiosError}
 */
const processAjaxError = (data, response) => {
	if ('string' === typeof data) {
		throw new Error(data);
	}

	if (data && 'object' === typeof data && data?.message) {
		const error = new Error(data.message);
		if (data?.code) error.code = data.code;

		throw error;
	}

	if (
		data &&
		Array.isArray(data) &&
		data.length &&
		data[0].code &&
		data[0].message
	) {
		if (1 === data.length) {
			const error = new Error(data[0].message);
			error.code = data[0].code;

			throw error;
		}

		throw makeAxiosError(
			__(
				'Something went wrong. Please try again after sometime.',
				'storeengine'
			),
			response
		);
	}

	throw new Error(
		__(
			'Something went wrong. Please try again after sometime.',
			'storeengine'
		)
	);
};

/**
 * Send post request to WP ajax endpoint action.
 *
 * @param  action
 * @param  payload
 * @param  isRaw
 * @return {Promise<axios.AxiosResponse<any>|void>}
 *
 * @deprecated use makeRequest2
 * @see makeRequest2
 */
export const makeRequest = async (payload = {}, isRaw = false) => {
	let form_data = new FormData(); // eslint-disable-line
	form_data.append('security', academy_nonce);

	Object.entries(payload).forEach(([key, value]) => {
		// FormData.append() stringifies undefined to the literal text
		// "undefined" rather than omitting the field, which silently corrupts
		// any endpoint that distinguishes "field omitted" from "field sent
		// empty". Skip it here so callers can pass an optional field through
		// as undefined and have it actually be left out of the request.
		if (value === undefined) {
			return;
		}
		if (!isRaw && typeof value === 'object' && value !== null) {
			form_data.append(key, JSON.stringify(value));
		} else {
			form_data.append(key, value);
		}
	});

	try {
		const response = await axios.post(ajaxurl, form_data);
		return response;
	} catch (error) {
		console.error('Request Error:', error);
		throw error;
	}
};

/**
 * Send post request to WP ajax endpoint action.
 *
 * Send post request and throw if success false, enhancing error handling.
 *
 * @param {string}  action  Ajax Action name.
 * @param {Object}  payload Payload data
 * @param {boolean} [isRaw] Optional. If true will not stringify nested object. Default false (stringify nested object).
 * @return {Promise<any>}
 * @throws {Error|AxiosError}
 */
export const makeRequest2 = async (payload = {}, isRaw = false) => {
	const form_data = new FormData();
	form_data.append('security', academy_nonce);

	Object.entries(payload).forEach(([key, value]) => {
		// see makeRequest() above for why undefined fields are skipped rather
		// than sent as the literal text "undefined".
		if (value === undefined) {
			return;
		}
		if (!isRaw && typeof value === 'object' && value !== null) {
			form_data.append(key, JSON.stringify(value));
		} else {
			form_data.append(key, value);
		}
	});

	const response = await axios.post(ajaxurl, form_data);
	const {
		data: { success, data },
	} = response;

	if (!success) {
		processAjaxError(data, response);
	}

	return data;
};

export const runUploader = (config = {}) => {
	return new Promise((resolve) => {
		let frame; // eslint-disable-line
		// If the media frame already exists, reopen it.
		if (frame) {
			frame.open();
			return;
		}

		// Create a new media frame
		frame = wp.media({
			title: __('Select or Upload Media', 'academy'),
			button: {
				text: __('Use this media', 'academy'),
			},
			multiple: false, // Set to true to allow multiple files to be selected
			...config,
		});

		// When an image is selected in the media frame...
		frame.on('select', function () {
			return resolve(frame.state().get('selection').first().toJSON());
		});
		// Finally, open the modal on click
		frame.open();
	});
};

export const lessonIsComplete = (allLessons, playLessonArrayIndex) => {
	if (allLessons.length) {
		return allLessons[playLessonArrayIndex]?.is_completed;
	}
	return false;
};

export const useQuery = () => {
	return new URLSearchParams(useLocation().search);
};

export const getUserWithdrawInitialValues = (data) => {
	return {
		withdrawMethodType: '',
		echeckAddress: '',
		bankAccountName: '',
		bankAccountNumber: '',
		bankName: '',
		bankIBAN: '',
		bankSWIFTCode: '',
		...data,
	};
};

export const debounce = (callback, wait) => {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			callback.apply(this, args);
		}, wait);
	};
};

export const prepare_term_data = (terms, parentId = 0) => {
	if (!terms) return [];
	const data = [];
	terms.forEach((term) => {
		if (parseInt(term?.parent) === parseInt(parentId)) {
			const updatedTerm = {
				...term,
				children: prepare_term_data(terms, term.id),
			};
			data.push(updatedTerm);
		}
	});
	return data;
};

export const quizModalStyles = {
	overlay: {
		background: 'rgba(35, 40, 45, 0.62)',
		zIndex: '9999',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
	},
};

export const questionModalStyles = {
	overlay: {
		background: 'rgba(35, 40, 45, 0.62)',
		zIndex: '9999',
	},
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
	},
};

export const timeStringGenerator = (paramTime, unit) => {
	let timeString = '';
	const time = parseInt(paramTime);
	switch (unit) {
		case 'seconds':
			timeString = `00:00:${time}`;
			break;
		case 'minutes':
			timeString = `00:${time}:00`;
			break;
		case 'hours':
			timeString = `${time}:00:00`;
			break;
		case 'days':
			timeString = `${time * 24}:00:00`;
			break;
		case 'weeks':
			timeString = `${time * 168}:00:00`;
			break;
		default:
			timeString = '00:00:00';
			break;
	}
	return timeString;
};

export const timeToSecondsGenerator = (paramTime, unit) => {
	let time = parseInt(paramTime);
	switch (unit) {
		case 'seconds':
			time = time;
			break;
		case 'minutes':
			time = time * 60;
			break;
		case 'hours':
			time = time * 3600;
			break;
		case 'days':
			time = time * 86400;
			break;
		case 'weeks':
			time = time * 604800;
			break;
		default:
			time = 0;
			break;
	}
	return time;
};

export const fireNotify = (message, type = '', position = 'top-right') => {
	switch (type) {
		case 'error':
			return toast.error(
				<div className="academy-toasts">
					<div className="academy-toasts__icon">
						<span className="academy-icon academy-icon--information academy-icon--information-error"></span>
					</div>
					<p className="academy-toasts-message">{message}</p>
				</div>,
				{
					position,
					hideProgressBar: true,
				}
			);
		case 'info':
			return toast.info(
				<div className="academy-toasts">
					<div className="academy-toasts__icon">
						<span className="academy-icon academy-icon--information"></span>
					</div>
					<p className="academy-toasts-message">{message}</p>
				</div>,
				{
					position,
					hideProgressBar: true,
				}
			);
		case 'warning':
			return toast.warning(
				<div className="academy-toasts">
					<div className="academy-toasts__icon">
						<span className="academy-icon academy-icon--notification"></span>
					</div>
					<p className="academy-toasts-message">{message}</p>
				</div>,
				{
					position,
					hideProgressBar: true,
				}
			);
		default:
			return toast.success(
				<div className="academy-toasts">
					<div className="academy-toasts__icon">
						<span className="academy-icon academy-icon--check"></span>
					</div>
					<p className="academy-toasts-message">{message}</p>
				</div>,
				{
					position,
					hideProgressBar: true,
				}
			);
	}
};

export const getAddonActiveStatus = (allAddons, addonName, isPro = false) => {
	// if pro is inactive
	if (isPro && !is_pro) {
		return false;
	}
	if (allAddons[addonName]) {
		return allAddons[addonName] === true;
	}
	return false;
};

export const sliceString = (text, length = 20, more = '...') => {
	if (!text || text.length < length) {
		return text;
	}

	return text.slice(0, length).replace(/(^[\s]+|[\s]+$)/g, '') + more;
};

export const hideHtmlTags = (html) => {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
};

// A question's Description can have at most one embedded audio player,
// inserted as raw `<audio src="…" controls></audio>` markup alongside its
// other rich-text content (see
// AcademyQuizzes\API\Schema\QuizQuestionSchema::sanitize_description()).
// These helpers manage that one embed, and let renderers pull the audio out
// to show it as <QuizAudioPlayer> instead of the raw (browser-default-styled)
// <audio> element.
const AUDIO_TAG_PATTERN = /<audio\b[^>]*>[\s\S]*?<\/audio>|<audio\b[^>]*\/>/i;
const AUDIO_SRC_PATTERN = /<audio\b[^>]*\ssrc="([^"]+)"/i;

export const extractAudioSrc = (content = '') => {
	const match = AUDIO_SRC_PATTERN.exec(content || '');
	return match ? match[1] : '';
};

export const withAudioTag = (content = '', url) => {
	const withoutExistingAudio = (content || '')
		.replace(AUDIO_TAG_PATTERN, '')
		.trim();
	const audioTag = `<audio controls src="${url}"></audio>`;
	return withoutExistingAudio
		? `${audioTag}\n${withoutExistingAudio}`
		: audioTag;
};

export const withoutAudioTag = (content = '') =>
	(content || '').replace(AUDIO_TAG_PATTERN, '').trim();

export const getQuizTypeLabel = (type) => {
	let label = '';
	switch (type) {
		case 'trueFalse':
			label = __('True/False', 'academy');
			break;

		case 'singleChoice':
			label = __('Single Choice', 'academy');
			break;

		case 'multipleChoice':
			label = __('Multiple Choice ', 'academy');
			break;

		case 'dropDown':
			label = __('Dropdown', 'academy');
			break;
		case 'imageAnswer':
			label = __('Image Answer', 'academy');
			break;

		case 'shortAnswer':
			label = __('Short Answer', 'academy');
			break;

		case 'fillInTheBlanks':
			label = __('Fill In The Blanks', 'academy');
			break;

		default:
			break;
	}
	return label;
};

export const timezoneOptions = moment.tz.names().map((tz) => {
	const offset = moment.tz(tz).utcOffset() / 60;
	const offsetStr = `(GMT${offset >= 0 ? '+' : ''}${offset}:00) ${tz.replace(
		'_',
		' '
	)}`;

	return {
		label: offsetStr,
		value: tz,
	};
});

export const renderError = (e) => {
	fireNotify(e?.response?.data?.message ?? e?.message, 'error');
};

export const capitalizeFirstLetter = (string) => {
	return string?.charAt(0)?.toUpperCase() + string?.slice(1);
};

export const getTranslatedStatus = (status) => {
	const statusLabel = {
		publish: __('Published', 'academy'),
		future: __('Scheduled', 'academy'),
		submitted: __('Submitted', 'academy'),
		pending: __('Pending', 'academy'),
		draft: __('Draft', 'academy'),
		trash: __('Trash', 'academy'),
		completed: __('Approved', 'academy'),
		approved: __('Approve', 'academy'),
		processing: __('Processing', 'academy'),
		cancel: __('Cancel', 'academy'),
		private: __('Private', 'academy'),
		pass: __('Pass', 'academy'),
		passed: __('Passed', 'academy'),
		success: __('Success', 'academy'),
		answered: __('Answered', 'academy'),
		active: __('Active', 'academy'),
		expired: __('Expired', 'academy'),
		running: __('Running', 'academy'),
		rejected: __('Rejected', 'academy'),
		failed: __('Failed', 'academy'),
		'time expired': __('Time Expired', 'academy'),
	};

	return statusLabel[status];
};

const { isArray } = Array;

/**
 * Shows Notification toast.
 *
 * @param {string|[{code:string,message:string}]} message Message to show.
 * @param {'error'|'info'|'warning'|'success'}    [type]  [Optional] Notification type. Default type is `info`
 *
 * @param                                         suffix
 * @return void
 */
export const notification = (type, message, suffix = 'dashboard') => {
	let timer = null;
	let closeIn = 5000;

	if (!message) return;

	let icon = '';
	if (type === 'success') {
		icon = 'check';
	} else if (type === 'error') {
		icon = 'information';
	}

	type = ['success', 'warning', 'error', 'info'].includes(type)
		? type
		: 'info';

	const closeHandler = (e) => {
		e && e.preventDefault();
		notificationDiv.remove();
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	};

	const checkInterval = () => {
		closeIn -= 1000;
		if (closeIn <= 0) {
			closeHandler();
		}
	};

	const notificationDiv = document.createElement('div');
	notificationDiv.className = `academy-notification academy-notification--${suffix} ${
		type ? `academy-notification--${type}` : `academy-notification--success`
	}`;
	notificationDiv.setAttribute('aria-live', 'polite');
	notificationDiv.onmouseenter = () => clearInterval(timer);
	notificationDiv.onmouseleave = () =>
		(timer = setInterval(checkInterval, 1000));

	const messageParagraph = document.createElement('p');
	messageParagraph.className = 'academy-notification__message';
	messageParagraph.style.gap = '10px';

	if (Array.isArray(message) && message[0].code && message[0].message) {
		if (message.length === 1) {
			message = message[0].message;
		} else {
			const errors = [...message];
			message = '<ul class="academy-m-0" style="padding-left:1rem;">';
			for (const err of errors) {
				message += `<li><label class="error-msg" for="${err.code}">${err.message}</label></li>`;
			}

			message += '</ul>';
		}
	}

	messageParagraph.innerHTML = message;
	notificationDiv.appendChild(messageParagraph);

	const closeButton = document.createElement('button');
	closeButton.className = 'academy-btn academy-btn--bg-red';
	closeButton.style.padding = 0;
	closeButton.setAttribute('data-suffix', 'close-notification');
	closeButton.setAttribute('aria-label', __('Close', 'academy'));
	closeButton.innerHTML = `<span class="academy-icon academy-icon--close" style="display:flex;" aria-hidden="true"></span>`;
	closeButton.onclick = closeHandler;

	notificationDiv.appendChild(closeButton);

	timer = setInterval(checkInterval, 1000);

	document.body.appendChild(notificationDiv);

	try {
		const links = document.querySelectorAll(
			'.academy-notification__message a'
		);
		for (const idx in links) {
			if (links[idx].href && '#' !== links[idx].href) {
				links[idx].target = '_blank';
			}
		}
	} catch (er) {}
};

export const getFieldName = (name) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.trim()
		.replace(/\s+/g, '_');

/*
 * Learn-page "Page reload" content mode.
 *
 * We must NOT change the hash on the current page before reloading — the SPA's
 * HashRouter would react to the hashchange and AJAX-load the topic first, so
 * the user sees the content swap in and THEN the page reload (a double load).
 *
 * Instead we stash the target route and hard-reload the CURRENT url (hash
 * untouched). On boot, `applyPendingReloadTopic()` reads the stash and rewrites
 * the hash BEFORE the router mounts, so the fresh page lands straight on the
 * target topic with a single, clean load.
 */
const ACADEMY_RELOAD_TOPIC_KEY = 'academyReloadTopic';

export const reloadToTopic = (type, id) => {
	try {
		window.sessionStorage.setItem(
			ACADEMY_RELOAD_TOPIC_KEY,
			`/${type}/${id}`
		);
	} catch (e) {} // eslint-disable-line no-empty
	window.location.reload();
};

export const applyPendingReloadTopic = () => {
	try {
		const target = window.sessionStorage.getItem(ACADEMY_RELOAD_TOPIC_KEY);
		if (target) {
			window.sessionStorage.removeItem(ACADEMY_RELOAD_TOPIC_KEY);
			if (window.location.hash !== `#${target}`) {
				window.location.hash = `#${target}`;
			}
		}
	} catch (e) {} // eslint-disable-line no-empty
};
