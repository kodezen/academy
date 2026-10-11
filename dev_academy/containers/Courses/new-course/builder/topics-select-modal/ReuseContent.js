import React, { useState } from 'react';
import {
	active_plugins,
	can_manage_addons,
	getAddonActiveStatus,
	is_pro,
	plugin_root_url,
} from '@Utils/helper';
import { useSelector } from 'react-redux';
import { __, sprintf } from '@wordpress/i18n';
import ProTag from '@Components/ProTag';
import ProLockedContent from '@Components/ProTag/ProLockedContent';
import Meeting from './Meeting';
import Lesson from './Lesson';
import Quiz from './quiz';
import QuizPressQuiz from './quizpress-quiz';
import Booking from './Booking';
import Assignment from './assignments';

/*
 * "Reuse Content" picker: content types listed as tabs on the left, the
 * selected type's browser rendered on the right. Lesson is selected by
 * default.
 */

const ReuseContent = ({
	isSubCurriculum,
	subCurriculumIndex,
	subItemRemoveHandler,
	closeModal,
}) => {
	const allAddons = useSelector((state) => state.addons);

	const types = [
		{
			key: 'lesson',
			label: __('Lesson', 'academy'),
			icon: 'academy-icon--lessons',
			visible: true,
			locked: false,
			Component: Lesson,
		},
		{
			key: 'quiz',
			label: __('Quiz', 'academy'),
			icon: 'academy-icon--quiz-fill',
			addonSlug: 'quizzes',
			// Free addon: always show it now instead of vanishing when off —
			// just needs enabling, not Pro, so it gets the "Off" treatment
			// rather than a PRO badge.
			visible: true,
			locked: !getAddonActiveStatus(allAddons, 'quizzes'),
			isProFeature: false,
			Component: Quiz,
		},
		{
			key: 'quizpress_quiz',
			label: __('QuizPress', 'academy'),
			icon: 'academy-icon--quiz-fill',
			iconImage: plugin_root_url + 'assets/images/addons/quizpress.svg',
			addonSlug: 'quizpress',
			// A separate companion plugin (Extensions & Integrations), not a
			// bundled addon: usable whenever the plugin is active. The CTA
			// installs-and-activates it, same as GameEngine's on the course
			// overview.
			visible: true,
			locked: !active_plugins?.quizpress_is_active,
			isProFeature: false,
			isIntegration: true,
			Component: QuizPressQuiz,
		},
		{
			key: 'assignment',
			label: __('Assignment', 'academy'),
			icon: 'academy-icon--assignment-two',
			addonSlug: 'assignments',
			// Pro on: keep respecting the addon's own toggle (hidden if off).
			// Pro off: always show it, locked, instead of vanishing.
			visible: is_pro
				? getAddonActiveStatus(allAddons, 'assignments', true)
				: true,
			locked: !is_pro,
			isProFeature: true,
			Component: Assignment,
		},
		{
			key: 'meeting',
			label: __('Meeting', 'academy'),
			icon: 'academy-icon--meeting',
			addonSlug: 'meeting',
			visible: is_pro
				? getAddonActiveStatus(allAddons, 'meeting', true)
				: true,
			locked: !is_pro,
			isProFeature: true,
			Component: Meeting,
		},
		{
			key: 'booking',
			label: __('Booking', 'academy'),
			icon: 'academy-icon--tutor-booking-fill',
			addonSlug: 'tutor-booking',
			visible: is_pro
				? getAddonActiveStatus(allAddons, 'tutor-booking', true)
				: true,
			locked: !is_pro,
			isProFeature: true,
			Component: Booking,
		},
	].filter((type) => type.visible && (can_manage_addons || !type.locked)); // Only an admin gets the locked preview of an off addon; anyone else

	const [activeType, setActiveType] = useState(types[0]?.key ?? null);

	const activeTypeConfig =
		types.find((type) => type.key === activeType) ?? types[0];
	const ActiveComponent = activeTypeConfig?.Component;

	return (
		<div className="academy-reuse-content">
			<div className="academy-reuse-content__tabs">
				{types.map((type) => (
					<button
						key={type.key}
						type="button"
						className={`academy-reuse-content__tab${
							activeType === type.key
								? ' academy-reuse-content__tab--active'
								: ''
						}`}
						aria-selected={activeType === type.key}
						onClick={() => setActiveType(type.key)}
					>
						{type.iconImage ? (
							<img
								className="academy-reuse-content__tab-icon-image"
								src={type.iconImage}
								alt={type.label}
							/>
						) : (
							<span className={`academy-icon ${type.icon}`} />
						)}
						<span className="academy-reuse-content__tab-label">
							{type.label}
						</span>
						{type.locked &&
							(type.isProFeature ? (
								<ProTag suffix="academy-pro-badge-gradient" />
							) : (
								<span className="academy-off-badge">
									{__('Off', 'academy')}
								</span>
							))}
					</button>
				))}
			</div>
			<div className="academy-reuse-content__panel">
				{ActiveComponent && (
					<div className="academy-reuse-content__body">
						{activeTypeConfig.locked ? (
							<ProLockedContent
								addonName={activeTypeConfig.label}
								addonIcon={activeTypeConfig.icon}
								addonSlug={activeTypeConfig.addonSlug}
								isProFeature={activeTypeConfig.isProFeature}
								isIntegration={!!activeTypeConfig.isIntegration}
								title={
									activeTypeConfig.isProFeature
										? undefined
										: sprintf(
												/* translators: %s: addon name, e.g. "Quiz" or "QuizPress Quiz" */
												__(
													'%s Addon is Off',
													'academy'
												),
												activeTypeConfig.label
											)
								}
								subtitle={
									activeTypeConfig.isProFeature
										? undefined
										: sprintf(
												activeTypeConfig.isIntegration
													? /* translators: %s: plugin name, e.g. "QuizPress" */
														__(
															'Install and activate %s to browse and reuse existing content.',
															'academy'
														)
													: /* translators: %s: addon name, e.g. "Quiz" or "QuizPress Quiz" */
														__(
															'Turn on the %s addon to browse and reuse existing content.',
															'academy'
														),
												activeTypeConfig.label
											)
								}
							/>
						) : (
							<ActiveComponent
								isSubCurriculum={isSubCurriculum}
								subCurriculumIndex={subCurriculumIndex}
								subItemRemoveHandler={subItemRemoveHandler}
								closeModal={closeModal}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ReuseContent;
