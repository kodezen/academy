import React, { useEffect, useState } from 'react';
import {
	deleteQuiz,
	fetchQuizzes,
	moveQuizToTrash,
	restoreQuiz,
	quizStatusUpdate,
	updateItemPerPage,
	updateCurrentPage,
} from '@Redux/Slices/quizSlice/quizSlice.js';
import StatusOptions from '@Components/StatusOptions';
import { useDispatch, useSelector } from 'react-redux';
import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';
import ListTable from '@Components/ListTable';
import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import {
	sliceString,
	is_pro,
	can_manage_addons,
	makeRequest,
	route_path,
	is_admin,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import OptionMenu from '@Components/OptionMenu';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import MathJaxLateX from '@Components/MathJaxLateX';

const propTypes = {};

const statusArray = [
	{
		label: __('All', 'academy'),
		value: 'all',
	},
	{
		label: __('Publish', 'academy'),
		value: 'publish',
	},
	{
		label: __('Draft', 'academy'),
		value: 'draft',
	},
	{
		label: __('Pending', 'academy'),
		value: 'pending',
	},
	{
		label: __('Trash', 'academy'),
		value: 'trash',
	},
];

function useQuery() {
	const { search } = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function QuizzesListTable({ quizFormHandler, redirectUrl }) {
	const quizzes = useSelector((state) => state.quizzes);
	const dispatch = useDispatch();
	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	const [dataFetchingStatus, setDataFetchingStatus] = useState(false);

	const navigate = useNavigate();
	const location = useQuery();
	const quizStatus = location.get('status');
	const perPage = location.get('perPage');
	const searchText = location.get('search');

	const [status, setStatus] = useState(quizStatus ? quizStatus : 'all');

	const canUpdateQuiz = can('academy.quizzes.update');
	const canCreateQuiz = can('academy.quizzes.create');
	const canDeleteQuiz = can('academy.quizzes.delete');

	const handleNavigate = (tableStatus = '', text = '', options = {}) => {
		let url = is_admin
			? `${route_path}admin.php?page=academy-quizzes`
			: redirectUrl;

		const queryParams = [];

		if (tableStatus && tableStatus !== 'null' && tableStatus !== 'all') {
			queryParams.push(`status=${encodeURIComponent(tableStatus)}`);
		}

		if (text && text !== 'null') {
			queryParams.push(`search=${encodeURIComponent(text)}`);
		}

		if (queryParams.length > 0) {
			url += (url.includes('?') ? '&' : '?') + queryParams.join('&');
		}

		navigate(url, options);
	};

	const publishAction =
		status !== 'trash'
			? [
					{
						suffix: 'trash',
						label: __('Trash', 'academy'),
						isDisabled: !canDeleteQuiz,
						title: !canDeleteQuiz
							? permissionDeniedMessage('academy.quizzes.delete')
							: undefined,
						onClick: () =>
							setSnackbarOption({
								value: 'trash',
								message: __(
									'Are you sure, you want to move these item to trash!',
									'academy'
								),
							}),
					},
				]
			: [];
	const trashAction =
		status === 'trash'
			? [
					{
						suffix: 'restore',
						label: __('Restore', 'academy'),
						isDisabled: !canUpdateQuiz,
						title: !canUpdateQuiz
							? permissionDeniedMessage('academy.quizzes.update')
							: undefined,
						onClick: () =>
							setSnackbarOption({
								value: 'restore',
								message: __(
									'Are you sure, you want to restore these items?',
									'academy'
								),
							}),
					},
					{
						suffix: 'delete',
						label: __('Delete Permanently', 'academy'),
						isDisabled: !canDeleteQuiz,
						title: !canDeleteQuiz
							? permissionDeniedMessage('academy.quizzes.delete')
							: undefined,
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
	const snackbarOptions = [...publishAction, ...trashAction];

	useEffect(() => {
		if (!quizzes?.data || (quizzes.data && quizzes.data.length <= 1)) {
			setDataFetchingStatus(true);
			dispatch(fetchQuizzes({ status })).then(() => {
				// eslint-disable-next-line
				setDataFetchingStatus(false);
			});
		}
	}, []);

	useEffect(() => {
		// Re-syncs the URL with the current filters; replace rather than
		// push, or every visit adds a duplicate history entry.
		handleNavigate(quizStatus, searchText, { replace: true });
	}, [quizStatus, searchText]);

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = (option) => {
		if (status !== 'trash' && option === 'trash') {
			selectedItems.forEach((item) => {
				dispatch(
					moveQuizToTrash({
						ID: item.id ? item.id : item.ID,
					})
				);
			});
			handleReset();
		} else if (option === 'restore') {
			selectedItems.forEach((item) => {
				dispatch(restoreQuiz(item.id));
			});
			handleReset();
		} else {
			selectedItems.forEach((item) => {
				dispatch(deleteQuiz(item.id));
				handleReset();
			});
		}
	};

	React.useMemo(() => {
		if (confirm) {
			snackbarActionHandler(snackbarOption.value);
		} else {
			handleReset();
		}
	}, [confirm]);

	const handleTableDataFetch = (page = 1, itemPerPage = 10) => {
		setDataFetchingStatus(true);
		dispatch(
			fetchQuizzes({ status: 'any', page, per_page: itemPerPage })
		).then(() => {
			setDataFetchingStatus(false);
		});
	};

	const handlePageChange = (page, itemPerPage = 10) => {
		dispatch(updateCurrentPage(page));
		handleTableDataFetch(page, itemPerPage);
	};
	const handleItemsPage = (itemsPerPage, page) => {
		dispatch(updateItemPerPage(itemsPerPage));
		handleTableDataFetch(page, itemsPerPage);
		handleNavigate(quizStatus);
	};

	const restoreHandler = (id) => {
		// eslint-disable-next-line
		dispatch(
			restoreQuiz(id)
		);
	};

	const duplicateHandler = (item) => {
		makeRequest({
			action: 'academy_pro/duplicate_quiz',
			quiz_id: item.id ? item.id : item.ID,
		}).then((res) => {
			if (res.data.success) {
				dispatch(
					showNotification({
						message: __('Quiz Duplicated', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				setDataFetchingStatus(true);
				dispatch(fetchQuizzes({})).then(() => {
					setDataFetchingStatus(false);
				});
			}
		});
	};

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			setDataFetchingStatus(true);
			dispatch(
				fetchQuizzes({ status, page: 1, per_page: 10, search: value })
			).then(() => {
				setDataFetchingStatus(false);
				handleNavigate(quizStatus, value);
			});
		};
		const dataFetchHandler = (itemStatus) => {
			setDataFetchingStatus(true);
			handleNavigate(itemStatus);
			dispatch(
				fetchQuizzes({ status: itemStatus, page: 1, per_page: perPage })
			).then(() => {
				setDataFetchingStatus(false);
			});
		};
		return (
			<>
				<div className="academy-table__sub-header-actions-left">
					<div className="academy-table-sub-header-tabs">
						{statusArray.map((item, index) => (
							<span
								role="presentation"
								className={`tab ${
									item?.value === status ? 'is-active' : ''
								} `}
								key={index}
								onClick={() => {
									setStatus(item.value);
									dataFetchHandler(item.value);
								}}
							>
								{item.label}
							</span>
						))}
					</div>
				</div>
				<div className="academy-table-sub-header-actions-right">
					<Search
						placeholder={__('Search Quiz', 'academy')}
						onSearchHandler={searchHandler}
						defaultValue={searchText ? searchText : ''}
					/>
					<div className="academy-table-sub-header-actions-right--border" />
				</div>
			</>
		);
	}, [status, searchText]);

	const deleteHandler = (item) => {
		// eslint-disable-next-line
		if (item.status !== 'trash') {
			dispatch(
				moveQuizToTrash({
					ID: item.id ? item.id : item.ID,
				})
			);
		} else if (
			// eslint-disable-next-line
			window.confirm(
				__(
					'Are you sure you want to permanently delete selected courses?',
					'academy'
				)
			)
		) {
			dispatch(deleteQuiz(item.id));
		}
	};

	const columns = [
		{
			name: __('Title', 'academy'),

			cell: (row) => {
				return (
					<div className="academy-table-title-wrap">
						<div
							onClick={() => quizFormHandler(row)}
							className="academy-table-title"
							role="presentation"
						>
							<MathJaxLateX
								text={sliceString(row.title.rendered, 30)}
							/>
						</div>
					</div>
				);
			},
		},
		{
			name: __('Questions Count', 'academy'),
			isLabelWidth: true,
			cell: (row) => (
				<div>{row?.meta?.academy_quiz_questions?.length}</div>
			),
		},
		{
			name: __('Created', 'academy'),

			cell: (row) => (
				<div>
					<span>{moment(row.date).format('MMMM DD, YYYY')}</span>
					<br />
					<span className="academy-table-time">
						{moment(row.date).format('h:mm A')}
					</span>
				</div>
			),
		},
		{
			name: __('Author', 'academy'),

			cell: (row) => <span>{row?.author_name}</span>,
		},
		{
			name: __('Status', 'academy'),

			cell: (row) => {
				const statusHandler = (itemStatus) => {
					// eslint-disable-next-line
					const data = { id: row.id ? row.id : row.ID, status: itemStatus }
					if (itemStatus === 'trash') {
						dispatch(
							moveQuizToTrash({
								ID: row.id ? row.id : row.ID,
							})
						);
					} else {
						dispatch(quizStatusUpdate(data));
					}
				};
				return (
					<StatusOptions
						value={row?.status}
						options={{
							items: [
								{
									label: __('Published', 'academy'),
									value: 'publish',
								},
								{
									label: __('Draft', 'academy'),
									value: 'draft',
								},
								{
									label: __('Pending', 'academy'),
									value: 'pending',
								},
								{
									label: __('Trash', 'academy'),
									value: 'trash',
								},
							],
						}}
						onChangeHandler={statusHandler}
					/>
				);
			},
		},
		{
			name: __('Action', 'academy'),

			cell: (row) => {
				const publishedActions =
					row.status !== 'trash'
						? [
								{
									type: 'button',
									label: __('Trash', 'academy'),
									suffix: 'trash',
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteQuiz,
									title: !canDeleteQuiz
										? permissionDeniedMessage(
												'academy.quizzes.delete'
											)
										: undefined,
									onClick: () => deleteHandler(row),
								},
							]
						: [];
				const trashActions =
					row.status === 'trash'
						? [
								{
									type: 'button',
									label: __('Restore', 'academy'),
									hasBorder: true,
									icon: (
										<span className="academy-icon academy-icon--reset" />
									),
									isDisabled: !canUpdateQuiz,
									title: !canUpdateQuiz
										? permissionDeniedMessage(
												'academy.quizzes.update'
											)
										: undefined,
									onClick: () => restoreHandler(row.id),
								},
								{
									type: 'button',
									label: __('Delete', 'academy'),
									suffix: 'trash',
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteQuiz,
									title: !canDeleteQuiz
										? permissionDeniedMessage(
												'academy.quizzes.delete'
											)
										: undefined,
									onClick: () => deleteHandler(row),
								},
							]
						: [];
				return (
					<div className="academy-table-item-control">
						<OptionMenu
							options={[
								{
									type: 'button',
									label: <span>{__('Edit', 'academy')}</span>,
									icon: (
										<span className="academy-icon academy-icon--edit-two" />
									),
									isDisabled: !canUpdateQuiz,
									title: !canUpdateQuiz
										? permissionDeniedMessage(
												'academy.quizzes.update'
											)
										: undefined,
									onClick: () => quizFormHandler(row),
								},
								// Upgrade prompt: only an admin can buy Pro.
								...(is_pro || can_manage_addons
									? [
										{
											type: 'button',
											label: (
												<span>
													<span>
														{__('Duplicate', 'academy')}
													</span>
													{!is_pro && (
														<span className="academy-pro-badge">
															{__('PRO', 'academy')}
														</span>
													)}
												</span>
											),
											hasBorder: true,
											icon: (
												<span className="academy-icon academy-icon--copy-two" />
											),
											isDisabled: !canCreateQuiz,
											title: !canCreateQuiz
												? permissionDeniedMessage(
														'academy.quizzes.create'
													)
												: undefined,
											onClick: () =>
												is_pro
													? duplicateHandler(row)
													: dispatch(upgradeProModal(true)),
										}
										]
									: []),
								...publishedActions,
								...trashActions,
							]}
						/>
					</div>
				);
			},
		},
	];

	const noDataText =
		quizzes?.data?.length === 0 && !searchText
			? __(
					'Your quizzes will show here.',
					'academy'
				)
			: __(
					'No matching results found. Please try a different search.',
					'academy'
				);

	return (
		<>
			<ListTable
				columns={columns}
				data={quizzes?.data ? quizzes?.data : []}
				showSubHeader={true}
				subHeaderComponent={subHeaderComponentMemo}
				isRowSelectable={true}
				showColumnFilter={true}
				noDataText={noDataText}
				getSelectRowValue={(selectedRow) => {
					setSelectedItems(selectedRow);
					setResetSelectedItems(false);
				}}
				showPagination={true}
				onChangePage={handlePageChange}
				onChangeItemsPerPage={handleItemsPage}
				totalItems={quizzes?.totalItems}
				totalRows={quizzes?.data?.length}
				dataFetchingStatus={dataFetchingStatus}
				resetSelected={resetSelectedItems}
				rowsPerPage={
					quizzes?.itemPerPage ? quizzes?.itemPerPage : perPage
				}
				suffix="quizzes"
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
		</>
	);
}

QuizzesListTable.propTypes = propTypes;
