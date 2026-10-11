import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@Components/Button';
import QuizEditor from '@Containers/Courses/new-course/QuizEditor';
import QuizFormModal from '@Containers/Quizzes/QuizFormModal';
import QuizzesListTable from './QuizzesListTable';
import TopBar from '@Components/TopBar';
import QuizTabs from './QuizTabs';
import SubTopBar from '@Components/SubTopBar';
import { __ } from '@wordpress/i18n';
import GetHelp from '@Components/GetHelp';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSettings } from '@Redux/Slices/settingsSlice/settingsSlice';
import {
	API,
	namespace,
	is_admin,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const propTypes = {};

export default function Quizzes({ redirectUrl }) {
	const settings = useSelector((state) => state.settings);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const canCreateQuiz = can('academy.quizzes.create');

	// wp-admin keeps the route-based (full-page) quiz editor.
	const quizForm = searchParams.get('quiz_form');
	const isEditorRoute = is_admin && ['new', 'edit'].includes(quizForm);
	const itemId = searchParams.get('item_id');

	useEffect(() => {
		if (!settings.data) {
			dispatch(fetchSettings());
		}
	}, []);

	const goToEditor = (id = null) => {
		const sp = new URLSearchParams(searchParams);
		sp.set('quiz_form', id ? 'edit' : 'new');
		if (id) {
			sp.set('item_id', String(id));
		} else {
			sp.delete('item_id');
		}
		navigate(`?${sp.toString()}`);
	};

	const goToList = () => {
		const sp = new URLSearchParams(searchParams);
		sp.delete('quiz_form');
		sp.delete('item_id');
		navigate(`?${sp.toString()}`);
	};

	// Frontend (instructor) dashboard opens the same multi-step quiz form in a
	// modal instead (the step indicator itself only renders on wp-admin's
	// topbar, so the route-based editor's steps are invisible on frontend).
	const [quizModal, setQuizModal] = useState({
		isOpen: false,
		formData: {},
		isLoading: false,
	});

	const closeQuizModal = () => {
		setQuizModal({ isOpen: false, formData: {}, isLoading: false });
	};

	const quizFormHandler = (param = null) => {
		const id = param?.id || param?.ID || null;
		if (is_admin) {
			goToEditor(id);
			return;
		}
		if (id) {
			// Editing: the list row carries only partial meta, so fetch the
			// full quiz — otherwise the Settings step and question list open
			// blank.
			setQuizModal({ isOpen: true, formData: {}, isLoading: true });
			API.get(`${namespace}academy_quiz/${parseInt(id)}`, {
				params: { context: 'edit' },
			})
				.then((res) => {
					setQuizModal({
						isOpen: true,
						formData: res.data,
						isLoading: false,
					});
				})
				.catch(() => {
					setQuizModal({
						isOpen: true,
						formData: param || {},
						isLoading: false,
					});
				});
			return;
		}
		setQuizModal({ isOpen: true, formData: {}, isLoading: false });
	};

	if (isEditorRoute) {
		return (
			<QuizEditor
				headerMode="topbar"
				itemId={itemId}
				topics={[]}
				isDripContentEnable={false}
				leadingCrumbs={[
					{ label: __('Quizzes', 'academy'), onClick: goToList },
				]}
				onSaved={(item) => {
					const sp = new URLSearchParams(searchParams);
					sp.set('quiz_form', 'edit');
					sp.set('item_id', String(item.id));
					navigate(`?${sp.toString()}`, { replace: true });
				}}
				onBack={goToList}
			/>
		);
	}

	return (
		<React.Fragment>
			<TopBar
				render={() => (
					<>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{__('All Quizzes', 'academy')}
						</h3>
						<GetHelp filterText={['quiz']} />
					</>
				)}
				centerContent={() => <QuizTabs />}
			/>
			{/* The page's main action sits on its title row, as on Courses. */}
			<SubTopBar heading={__('All Quizzes', 'academy')}>
				<Button
					type="button"
					isDisabled={is_admin && !canCreateQuiz}
					title={
						is_admin && !canCreateQuiz
							? permissionDeniedMessage('academy.quizzes.create')
							: undefined
					}
					onClick={() => {
						if (!is_admin) {
							quizFormHandler();
							return;
						}
						if (!canCreateQuiz) {
							dispatch(
								showNotification({
									message: permissionDeniedMessage(
										'academy.quizzes.create'
									),
									isShow: true,
									type: 'error',
								})
							);
							return;
						}
						goToEditor();
					}}
					label={__('Add New Quiz', 'academy')}
				/>
			</SubTopBar>
			<div className="academy-page-content academy-page-content--quizzes">
				<QuizzesListTable
					quizFormHandler={quizFormHandler}
					redirectUrl={redirectUrl}
				/>
			</div>
			{!is_admin && (
				<QuizFormModal
					isOpenQuizForm={quizModal.isOpen}
					closeQuizFormModal={closeQuizModal}
					formData={quizModal.formData}
					isLoading={quizModal.isLoading}
					topics={[]}
					isDripContentEnable={false}
				/>
			)}
		</React.Fragment>
	);
}

Quizzes.propTypes = propTypes;
