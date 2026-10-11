import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import Preloader from '@Components/Loader/Preloader';
import QuizForm from '@Containers/Quizzes/QuizForm';
import QuizFormContext from '@Containers/Quizzes/context/QuizFormContext';
import { API, namespace } from '@Utils/helper';
import { Breadcrumb } from '@Components/ui';

/*
 * Full-page (route-based) quiz editor — replaces the old QuizFormModal for the
 * admin course builder. Provides QuizFormContext with route-based callbacks:
 * `topicUpdateHandler` folds the quiz into the course curriculum (via onSaved),
 * and `closeModal`/`cancelHandler` navigate back to the builder. QuizForm keeps
 * its own multi-step wizard + save buttons.
 */
const QuizEditor = ({
	courseTitle,
	itemId,
	topicIndex,
	topics,
	dripContentType,
	isDripContentEnable,
	onSaved,
	onRenamed,
	onBack,
	leadingCrumbs,
	headerMode = 'subheader',
	// DOM slot in the course topbar to portal the wizard's save controls into
	// (course builder only). Forwarded to QuizForm.
	topbarActionsNode = null,
	// DOM slot in the course topbar centre to portal the quiz step stepper into.
	topbarCenterNode = null,
}) => {
	const [formData, setFormData] = useState(false);
	const [isLoading, setLoading] = useState(!!itemId);
	// The id we opened with. When the quiz is created mid-wizard the id shows up
	// here (URL edit-mode), but the wizard already holds the data — refetching
	// would remount QuizForm and reset the wizard back to step 1, so only fetch
	// for the quiz we opened directly.
	const initialItemIdRef = useRef(itemId);

	useEffect(() => {
		if (itemId && itemId === initialItemIdRef.current) {
			setLoading(true);
			API.get(`${namespace}academy_quiz/${parseInt(itemId)}`, {
				params: { context: 'edit' },
			})
				.then((res) => setFormData(res.data))
				.finally(() => setLoading(false));
		}
	}, [itemId]);

	const crumbs = [
		...(leadingCrumbs || [
			{ label: courseTitle || __('Course', 'academy'), onClick: onBack },
			{ label: __('Course Builder', 'academy'), onClick: onBack },
		]),
		{
			label: itemId
				? __('Edit Quiz', 'academy')
				: __('New Quiz', 'academy'),
		},
	];

	const contextValue = {
		dripContentType,
		topics,
		currentItemId: itemId,
		isDripContentEnable,
		topicUpdateHandler: (item) => onSaved && onSaved(item),
		// Safe to call on every save, update included — unlike
		// topicUpdateHandler above, it only refreshes the curriculum row's
		// name and skips the item_id URL sync (see handleItemRenamed).
		topicRenameHandler: (item) => onRenamed && onRenamed(item),
		updateTopic: false,
		itemIndex: topicIndex,
		subCurriculumIndex: null,
		subTopicUpdateHandler: () => {},
		isSubCurriculum: false,
		closeModal: onBack,
		isAddNewItem: false,
	};

	// In topbar mode the quiz wizard renders its own topbar (breadcrumb +
	// step stepper + wizard controls) via QuizForm — see headerMode/headerLeft.
	if (headerMode === 'topbar') {
		return (
			<QuizFormContext.Provider value={contextValue}>
				{isLoading ? (
					<div className="academy-quiz-loader h-[150px]">
						<Preloader />
					</div>
				) : (
					<QuizForm
						headerMode="topbar"
						headerLeft={<Breadcrumb items={crumbs} />}
						cancelHandler={onBack}
						data={formData}
					/>
				)}
			</QuizFormContext.Provider>
		);
	}

	return (
		<QuizFormContext.Provider value={contextValue}>
			<div className="academy-page-content academy-page-content--course academy-editor academy-editor--course">
				{isLoading ? (
					<div className="academy-quiz-loader h-[150px]">
						<Preloader />
					</div>
				) : (
					<QuizForm
						headerMode="subheader"
						onBack={onBack}
						cancelHandler={onBack}
						data={formData}
						topbarActionsNode={topbarActionsNode}
						topbarCenterNode={topbarCenterNode}
					/>
				)}
			</div>
		</QuizFormContext.Provider>
	);
};

export default QuizEditor;
