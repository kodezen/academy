import React, { useEffect, useState } from 'react';
import {
	generateUserName,
	sliceString,
	getTranslatedStatus,
	hideHtmlTags,
	is_admin,
} from '@Utils/helper';
import AttemptModal from './attempt-modal';
import ListTable from '@Components/ListTable';
import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import TopBar from '@Components/TopBar';
import QuizTabs from '@Containers/Quizzes/QuizTabs';
import SubTopBar from '@Components/SubTopBar';
import Search from '@Components/Search';
import Button from '@Components/Button';
import ProTag from '@Components/ProTag';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import OptionMenu from '@Components/OptionMenu';
import GetHelp from '@Components/GetHelp';
import { applyFilters } from '@wordpress/hooks';
import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';
import {
	deleteQuizAttempt,
	getAllQuizAttempts,
	updateQuizAttemptsCurrentPage,
	updateQuizAttemptsPerPage,
} from '@Redux/Slices/quizAttemptsSlice/quizAttemptsSlice';
import MathJaxLateX from '@Components/MathJaxLateX';
import "./styles.scss";

const QuizAttempts = () => {
	const [dataFetchingStatus, setDataFetchingStatus] = useState(false);
	const quiz_attempts = useSelector((state) => state.quizAttempts);

	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	const [attemptModal, setAttemptModal] = useState(false);
	const dispatch = useDispatch();

	const publishAction =
		quiz_attempts?.status !== 'trash'
			? [
					{
						suffix: 'delete',
						label: __('Delete Permanently', 'academy'),
						onClick: () =>
							setSnackbarOption({
								value: 'delete',
								message: __(
									'Are you sure, you want to delete these items?',
									'academy'
								),
							}),
					},
				]
			: [];

	const snackbarOptions = [...publishAction];

	useEffect(() => {
		if (
			!quiz_attempts.data ||
			(quiz_attempts.data && quiz_attempts.data.length <= 1)
		) {
			setDataFetchingStatus(true);
			dispatch(getAllQuizAttempts({})).then(() => {
				setDataFetchingStatus(false);
			});
		}
	}, []);

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = () => {
		selectedItems.forEach((item) => {
			dispatch(
				deleteQuizAttempt({
					ID: item.attempt_id,
				})
			);
		});
		handleReset();
	};

	React.useMemo(() => {
		if (confirm) {
			snackbarActionHandler();
		} else {
			handleReset();
		}
	}, [confirm]);

	const handleTableDataFetch = (page = 1, perPage = 10) => {
		setDataFetchingStatus(true);
		dispatch(
			getAllQuizAttempts({ status: 'any', page, per_page: perPage })
		).then(() => {
			setDataFetchingStatus(false);
		});
	};

	const handlePageChange = (page, perPage = 10) => {
		dispatch(updateQuizAttemptsCurrentPage(page));
		handleTableDataFetch(page, perPage);
	};

	const handleItemsPage = (itemsPerPage) => {
		handleTableDataFetch(1, itemsPerPage);
		dispatch(updateQuizAttemptsPerPage(itemsPerPage));
	};

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			setDataFetchingStatus(true);
			dispatch(
				getAllQuizAttempts({
					status: 'any',
					page: 1,
					per_page: 10,
					search: value,
				})
			).then(() => {
				setDataFetchingStatus(false);
			});
		};
		return (
			<>
				<div className="academy-table__sub-header-actions-left"></div>
				<div className="academy-table-sub-header-actions-right">
					<Search
						placeholder={__('Search Quiz Attempts', 'academy')}
						onSearchHandler={searchHandler}
					/>
					<div className="academy-table-sub-header-actions-right--border" />

					{is_admin &&
						applyFilters(
							'academy.quiz-attempts.export',
							<Button
								type="button"
								label={
									<>
										{__('Export', 'academy')}
										<ProTag suffix="academy-pro-badge-gradient" />
									</>
								}
								icon={
									<span className="academy-icon academy-icon--export"></span>
								}
								preset="transparent"
								border="gray"
								size="sm"
								onClick={() =>
									dispatch(upgradeProModal(true))
								}
								suffix="quiz-attempts-export"
							/>
						)}
				</div>
			</>
		);
	}, []);

	const deleteHandler = (item) => {
		if (
			// eslint-disable-next-line
			window.confirm(
				__(
					'Are you sure you want to permanently delete selected Qizzes?',
					'academy'
				)
			)
		) {
			dispatch(
				deleteQuizAttempt({
					ID: item.attempt_id,
				})
			);
		}
	};

	const handleAttemptModal = (row) => {
		setAttemptModal(row);
	};

	const columns = [
		{
			name: __('Quiz Info', 'academy'),

			cell: (row) => (
				<div className="academy-list-table-column academy-list-table-column--quiz-info">
					<p className="academy-list-table-column__date">
						{row?.attempt_started_at?.split(' ')[0]}
					</p>
					<p className="academy-list-table-column__heading">
						<strong>
							<MathJaxLateX
								text={sliceString(row?._quiz?.title)}
							/>
						</strong>
					</p>
					<p className="academy-list-table-column__sub-heading">
						<strong>{__('Student:', 'academy')}</strong>{' '}
						<a href={row?._user?.admin_permalink}>
							{sliceString(generateUserName(row?._user), 10)}
						</a>
					</p>
				</div>
			),
		},
		{
			name: __('Course', 'academy'),

			cell: (row) => (
				<div className="academy-list-table-column academy-list-table-column--quiz-course">
					<p className="academy-list-table-column__course-title">
						<strong>
							<a
								href={row?._course?.permalink}
								target="_blank"
								rel="noreferrer"
							>
								{sliceString(
									hideHtmlTags(row?._course?.title),
									30
								)}
							</a>
						</strong>
					</p>
				</div>
			),
		},
		{
			name: __('Questions', 'academy'),

			cell: (row) => (
				<p>
					<span>
						<strong>{__('Total:', 'academy')}</strong>{' '}
						{row?.total_questions}
					</span>
					<br />
					<span>
						<strong>{__('Answered:', 'academy')}</strong>{' '}
						{row?.total_answered_questions}
					</span>
				</p>
			),
		},
		{
			name: __('Answers', 'academy'),

			cell: (row) => {
				const parsedInfo =
					row?.attempt_info !== '' &&
					typeof row?.attempt_info !== 'object'
						? JSON.parse(row?.attempt_info)
						: row?.attempt_info;
				return (
					<p>
						<span>
							<strong>{__('Correct:', 'academy')}</strong>{' '}
							{parsedInfo?.total_correct_answers || 0}
						</span>
						<br />
						<span>
							<strong>{__('Incorrect:', 'academy')}</strong>{' '}
							{(row.total_answered_questions || 0) -
								(parsedInfo?.total_correct_answers || 0)}
						</span>
					</p>
				);
			},
		},
		{
			name: __('Marks', 'academy'),

			cell: (row) => (
				<p>
					<span>
						<strong>{__('Total:', 'academy')}</strong>{' '}
						{row?.total_marks}
					</span>
					<br />
					<span>
						<strong>{__('Earned:', 'academy')}</strong>{' '}
						{row?.earned_marks}
					</span>
				</p>
			),
		},
		{
			name: __('Result', 'academy'),

			cell: (row) => (
				<div className="academy-quiz">
					<span className={`academy-${row?.attempt_status}`}>
						{getTranslatedStatus(row?.attempt_status)}
					</span>
				</div>
			),
		},
		{
			name: __('Action', 'academy'),

			cell: (row) => (
				<div className="academy-table-item-control">
					<OptionMenu
						options={[
							{
								type: 'button',
								label: __('Details', 'academy'),
								hasBorder: true,
								icon: (
									<span className="academy-icon academy-icon--analytics" />
								),
								onClick: () => handleAttemptModal(row),
							},
							{
								type: 'button',
								label: __('Delete', 'academy'),
								suffix: 'trash',
								icon: (
									<span className="academy-icon academy-icon--trash-delete" />
								),
								onClick: () => deleteHandler(row),
							},
						]}
					/>
				</div>
			),
		},
	];

	return (
		<>
			<TopBar
				render={() => (
					<>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{__('Quiz Attempts', 'academy')}
						</h3>
						<GetHelp filterText={['quiz']} />
					</>
				)}
				centerContent={() => <QuizTabs value="attempts" />}
			/>
			<SubTopBar heading={__('Quiz Attempts', 'academy')} />
			<div className="academy-page-content academy-page-content--quiz-attempts">
				<ListTable
					columns={columns}
					data={quiz_attempts?.data ?? []}
					noDataText={__(
						'Nothing to show yet.',
						'academy'
					)}
					showSubHeader={true}
					subHeaderComponent={subHeaderComponentMemo}
					isRowSelectable={true}
					showColumnFilter={true}
					getSelectRowValue={(selectedRow) => {
						setSelectedItems(selectedRow);
						setResetSelectedItems(false);
					}}
					showPagination={true}
					onChangePage={handlePageChange}
					onChangeItemsPerPage={handleItemsPage}
					totalItems={quiz_attempts?.totalItems}
					totalRows={quiz_attempts?.data?.length}
					dataFetchingStatus={dataFetchingStatus}
					resetSelected={resetSelectedItems}
					rowsPerPage={quiz_attempts?.itemPerPage || 10}
					suffix="quiz_attempts"
				/>
				{selectedItems.length > 0 && (
					<SnackbarAction
						actionButtons={snackbarOptions}
						itemsLength={selectedItems?.length}
						confirmHandler={setConfirm}
						isActionSelected={snackbarOption}
						resetHandler={handleReset}
					/>
				)}

				{attemptModal && (
					<AttemptModal
						attempt={attemptModal}
						closeModal={() => setAttemptModal(false)}
					/>
				)}
			</div>
		</>
	);
};

export default QuizAttempts;
