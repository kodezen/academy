import React, { useEffect, useState } from 'react';
import {
	deleteLesson,
	fetchAllLessons,
	restoreLesson,
	updateLesson,
	updateItemPerPage,
	updateCurrentPage,
} from '@Redux/Slices/lessonSlice/lessonSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import StatusOptions from '@Components/StatusOptions';
import Button from '@Components/Button';

import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';
import ListTable from '@Components/ListTable';
import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import {
	sliceString,
	makeRequest,
	is_pro,
	can_manage_addons,
	route_path,
	is_admin,
	admin_url,
	academy_is_hp_lesson_active,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import OptionMenu from '@Components/OptionMenu';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import Tooltip from '../../components/Tooltip';

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

const LessonsTable = (props) => {
	const { lessonFormOpenHandler, redirectUrl } = props;
	const { data, loading, itemPerPage, totalItems } = useSelector(
		(state) => state.lessons
	);
	const dispatch = useDispatch();
	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	const [dataFetchingStatus, setDataFetchingStatus] = useState(
		loading ?? false
	);

	const navigate = useNavigate();
	const location = useQuery();
	const lessonStatus = location.get('status');
	const perPage = location.get('perPage');
	const searchText = location.get('search');

	const [status, setStatus] = useState(lessonStatus ? lessonStatus : 'all');

	const canUpdateLesson = can('academy.lessons.update');
	const canCreateLesson = can('academy.lessons.create');
	const canDeleteLesson = can('academy.lessons.delete');

	const handleNavigate = (tableStatus = '', text = '') => {
		let url = is_admin
			? `${route_path}admin.php?page=academy-lessons`
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

		navigate(url);
	};

	const publishAction =
		status !== 'trash'
			? [
					{
						suffix: 'trash',
						label: __('Trash', 'academy'),
						// Trash is a status update (POST to the item route),
						// not the DELETE route — Lessons has no native REST
						// controller of its own, so RestGuard gates this
						// endpoint on .update regardless of the resulting
						// status.
						isDisabled: !canUpdateLesson,
						title: !canUpdateLesson
							? permissionDeniedMessage('academy.lessons.update')
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
						isDisabled: !canUpdateLesson,
						title: !canUpdateLesson
							? permissionDeniedMessage('academy.lessons.update')
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
						isDisabled: !canDeleteLesson,
						title: !canDeleteLesson
							? permissionDeniedMessage('academy.lessons.delete')
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
		if (!data || (data && data.length <= 1)) {
			setDataFetchingStatus(true);
			dispatch(fetchAllLessons({ status })).then(() => {
				setDataFetchingStatus(false);
			});
		}
	}, []);

	useEffect(() => {
		handleNavigate(lessonStatus, searchText);
	}, [lessonStatus, searchText]);

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
					updateLesson({
						ID: item.ID,
						formData: {
							...item,
							lesson_status: 'trash',
							lesson_content: item?.lesson_content?.raw ?? '',
						},
					})
				);
			});
			handleReset();
		} else if (option === 'restore') {
			selectedItems.forEach((item) => {
				dispatch(
					restoreLesson({
						formData: { ...item, lesson_status: 'draft' },
					})
				);
			});
			handleReset();
		} else {
			selectedItems.forEach((item) => {
				dispatch(deleteLesson({ ID: item.ID }));
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
			fetchAllLessons({ status: 'all', page, per_page: itemPerPage })
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
		handleNavigate(lessonStatus);
	};

	const duplicateHandler = (item) => {
		makeRequest({
			action: 'academy_pro/duplicate_lesson',
			lesson_id: item.id ? item.id : item.ID,
		}).then((res) => {
			if (res.data.success) {
				dispatch(
					showNotification({
						message: __('Lesson Duplicated', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				setDataFetchingStatus(true);
				dispatch(fetchAllLessons({ status: 'all' })).then(() => {
					setDataFetchingStatus(false);
				});
			}
		});
	};

	const deleteHandler = (item) => {
		// eslint-disable-next-line
		if (item.lesson_status !== 'trash') {
			dispatch(
				restoreLesson({ formData: { ...item, lesson_status: 'draft' } })
			);
		} else if (
			// eslint-disable-next-line
			window.confirm(
				__(
					'Are you sure you want to permanently delete selected lessons?',
					'academy'
				)
			)
		) {
			dispatch(deleteLesson({ ID: item.ID }));
		}
	};

	const columns = [
		{
			name: __('Title', 'academy'),
			cell: (row) => {
				return (
					<div className="academy-table-title-wrap">
						<div
							onClick={() => lessonFormOpenHandler(row)}
							className="academy-table-title"
							role="presentation"
						>
							{sliceString(row.lesson_title, 30)}
						</div>
					</div>
				);
			},
		},
		{
			name: __('Date', 'academy'),

			cell: (row) => (
				<div>
					<span>
						{moment(row.lesson_date).format('MMMM DD, YYYY')}
					</span>
					<br />
					<span className="academy-table-time">
						{moment(row.lesson_date).format('h:mm A')}
					</span>
				</div>
			),
		},
		{
			name: __('Author', 'academy'),

			cell: (row) => <span>{row.author_name}</span>,
		},
		{
			name: __('Status', 'academy'),

			cell: (row) => {
				const statusHandler = (itemStatus) => {
					const data = {
						...row,
						lesson_status: itemStatus,
						lesson_content: row?.lesson_content?.raw ?? '',
					};
					dispatch(updateLesson({ ID: data.ID, formData: data }));
				};
				return (
					<StatusOptions
						value={row?.lesson_status}
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
					row.lesson_status !== 'trash'
						? [
								{
									type: 'button',
									label: __('Trash', 'academy'),
									suffix: 'trash',
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canUpdateLesson,
									title: !canUpdateLesson
										? permissionDeniedMessage(
												'academy.lessons.update'
											)
										: undefined,
									onClick: () =>
										dispatch(
											updateLesson({
												ID: row.ID,
												formData: {
													...row,
													lesson_status: 'trash',
													lesson_content:
														row?.lesson_content
															?.raw ?? '',
												},
											})
										),
								},
							]
						: [];
				const trashActions =
					row.lesson_status === 'trash'
						? [
								{
									type: 'button',
									label: __('Restore', 'academy'),
									hasBorder: true,
									icon: (
										<span className="academy-icon academy-icon--reset"></span>
									),
									isDisabled: !canUpdateLesson,
									title: !canUpdateLesson
										? permissionDeniedMessage(
												'academy.lessons.update'
											)
										: undefined,
									onClick: () =>
										dispatch(
											restoreLesson({
												formData: {
													...row,
													lesson_status: 'draft',
												},
											})
										),
								},
								{
									type: 'button',
									label: __('Delete', 'academy'),
									suffix: 'trash',
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteLesson,
									title: !canDeleteLesson
										? permissionDeniedMessage(
												'academy.lessons.delete'
											)
										: undefined,
									onClick: () => deleteHandler(row),
								},
							]
						: [];
				const editWithWPEditor = !academy_is_hp_lesson_active
					? [
							{
								type: 'link',
								label: __('WordPress Editor', 'academy'),
								icon: (
									<span className="academy-icon academy-icon--wp-editor" />
								),
								link: `${admin_url}post.php?post=${row.ID}&action=edit`,
								target: '_self',
								isDisabled: !canUpdateLesson,
								title: !canUpdateLesson
									? permissionDeniedMessage(
											'academy.lessons.update'
										)
									: undefined,
							},
						]
					: [];
				return (
					<div className="academy-flex-2 academy-table-action">
						{!academy_is_hp_lesson_active && (
							<Button
								icon={
									<span className="academy-icon academy-icon--wp-editor" />
								}
								onClick={() => {
									window.open(
										`${admin_url}post.php?post=${row.ID}&action=edit`
									);
								}}
								preset="transparent"
								border="gray"
								suffix="academy-wordpress-button"
								isDisabled={!canUpdateLesson}
								title={
									!canUpdateLesson
										? permissionDeniedMessage(
												'academy.lessons.update'
											)
										: undefined
								}
							/>
						)}
						<OptionMenu
							options={[
								{
									type: 'button',
									label: <span>{__('Edit', 'academy')}</span>,
									icon: (
										<span className="academy-icon academy-icon--edit-two" />
									),
									isDisabled: !canUpdateLesson,
									title: !canUpdateLesson
										? permissionDeniedMessage(
												'academy.lessons.update'
											)
										: undefined,
									onClick: () => lessonFormOpenHandler(row),
								},
								...editWithWPEditor,
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
											isDisabled: !canCreateLesson,
											title: !canCreateLesson
												? permissionDeniedMessage(
														'academy.lessons.create'
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

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			setDataFetchingStatus(true);
			dispatch(
				fetchAllLessons({
					status,
					page: 1,
					per_page: 10,
					search: value,
				})
			).then(() => {
				handleNavigate(lessonStatus, value);
				setDataFetchingStatus(false);
			});
		};
		const dataFetchHandler = (itemStatus) => {
			setDataFetchingStatus(true);
			handleNavigate(itemStatus);
			dispatch(
				fetchAllLessons({
					status: itemStatus,
					page: 1,
					per_page: itemPerPage,
				})
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
						placeholder={__('Search Lesson', 'academy')}
						onSearchHandler={searchHandler}
						defaultValue={searchText ? searchText : ''}
					/>
					<div className="academy-table-sub-header-actions-right--border" />
				</div>
			</>
		);
	}, [status, searchText]);

	const noDataText =
		data?.length === 0 && !searchText
			? __(
					'Your lessons will show here.',
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
				data={data ? data : []}
				showSubHeader={true}
				noDataText={noDataText}
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
				totalItems={totalItems}
				totalRows={data?.length}
				dataFetchingStatus={dataFetchingStatus}
				resetSelected={resetSelectedItems}
				rowsPerPage={itemPerPage ? itemPerPage : perPage}
				suffix="lesson"
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
};
export default LessonsTable;
