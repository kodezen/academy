import React, { useEffect, useRef, useState } from 'react';
import {
	fetchAllAnnouncements,
	updateAnnouncementStatus,
	deleteAnnouncement,
	restoreAnnouncement,
	moveAnnouncementToTrash,
	updateAnnouncementsCurrentPage,
	updateAnnouncementsItemPerPage,
} from '@Redux/Slices/announcementSlice/announcementSlice';
import ListTable from '@Components/ListTable';
import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import {
	sliceString,
	route_path,
	is_admin,
	hideHtmlTags,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import OptionMenu from '@Components/OptionMenu';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import StatusOptions from '@Components/StatusOptions';

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

const AnnouncementTable = (props) => {
	const { announcementFormOpenHandler, redirectUrl } = props;
	const announcements = useSelector((state) => state.announcement);
	const dispatch = useDispatch();
	const [dataFetchingStatus, setDataFetchingStatus] = useState(false);

	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	// Every fetch-triggering action below (mount/page/status tab/search) bumps
	// this before dispatching, then only clears its own loading flag if it's
	// still the *latest* one when its request resolves. Clicking through
	// tabs quickly fires several overlapping fetches with no guarantee they
	// resolve in the order they were sent — without this guard, an older
	// request finishing after a newer one flips the loading indicator off
	// (or back on) while the newer request is still the one that matters,
	// so the spinner could disappear mid-load or never settle correctly.
	const requestSeqRef = useRef(0);

	const navigate = useNavigate();
	const location = useQuery();
	const announcementStatus = location.get('status');
	const perPage = location.get('perPage');
	const searchText = location.get('search');

	const [status, setStatus] = useState(
		announcementStatus ? announcementStatus : 'all'
	);

	const canUpdateAnnouncement = can('academy.announcements.update');
	const canDeleteAnnouncement = can('academy.announcements.delete');

	const handleNavigate = (tableStatus = '', text = '') => {
		let url = is_admin
			? `${route_path}admin.php?page=academy-announcements`
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
						isDisabled: !canDeleteAnnouncement,
						title: !canDeleteAnnouncement
							? permissionDeniedMessage(
									'academy.announcements.delete'
								)
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
						isDisabled: !canUpdateAnnouncement,
						title: !canUpdateAnnouncement
							? permissionDeniedMessage(
									'academy.announcements.update'
								)
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
						isDisabled: !canDeleteAnnouncement,
						title: !canDeleteAnnouncement
							? permissionDeniedMessage(
									'academy.announcements.delete'
								)
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
		if (
			!announcements?.data ||
			(announcements?.data && announcements?.data.length <= 1)
		) {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			dispatch(fetchAllAnnouncements({ status })).then(() => {
				if (seq === requestSeqRef.current) {
					setDataFetchingStatus(false);
				}
			});
		}
	}, []);

	useEffect(() => {
		handleNavigate(announcementStatus, searchText);
	}, [announcementStatus, searchText]);

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = (option) => {
		if (status !== 'trash' && option === 'trash') {
			selectedItems.forEach((item) => {
				dispatch(moveAnnouncementToTrash({ ID: item.id }));
			});
			handleReset();
		} else if (option === 'restore') {
			selectedItems.forEach((item) => {
				dispatch(restoreAnnouncement(item));
			});
			handleReset();
		} else {
			selectedItems.forEach((item) => {
				dispatch(deleteAnnouncement({ ID: item.id }));
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
		const seq = ++requestSeqRef.current;
		setDataFetchingStatus(true);
		dispatch(
			fetchAllAnnouncements({
				status: 'any',
				page,
				per_page: itemPerPage,
			})
		).then(() => {
			if (seq === requestSeqRef.current) {
				setDataFetchingStatus(false);
			}
		});
	};

	const handlePageChange = (page = 1, itemPerPage = 10) => {
		dispatch(updateAnnouncementsCurrentPage(page));
		handleTableDataFetch(page, itemPerPage);
	};

	const handleItemsPage = (itemsPerPage = 10, page = 1) => {
		dispatch(updateAnnouncementsItemPerPage(itemsPerPage));
		handleTableDataFetch(page, itemsPerPage);
		handleNavigate(announcementStatus);
	};

	const restoreHandler = (item) => {
		// eslint-disable-next-line
		dispatch(
			restoreAnnouncement(item)
		);
	};

	const deleteHandler = (item) => {
		if (item.status !== 'trash') {
			dispatch(moveAnnouncementToTrash({ ID: item.id }));
			// eslint-disable-next-line
		} else if (window.confirm(__('Are you sure want to delete Announcement?', 'academy'))) {
			dispatch(deleteAnnouncement({ ID: item.id }));
		}
	};

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			dispatch(
				fetchAllAnnouncements({
					status,
					page: 1,
					per_page: 10,
					search: value,
				})
			).then(() => {
				if (seq === requestSeqRef.current) {
					setDataFetchingStatus(false);
				}
				handleNavigate(announcementStatus, value);
			});
		};

		const dataFetchHandler = (itemStatus) => {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			handleNavigate(itemStatus);
			dispatch(
				fetchAllAnnouncements({
					status: itemStatus,
					page: 1,
					per_page: perPage,
				})
			).then(() => {
				if (seq === requestSeqRef.current) {
					setDataFetchingStatus(false);
				}
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
						placeholder={__('Search Announcements', 'academy')}
						onSearchHandler={searchHandler}
						defaultValue={searchText ? searchText : ''}
					/>
					<div className="academy-table-sub-header-actions-right--border" />
				</div>
			</>
		);
	}, [status, searchText]);

	const columns = [
		{
			name: __('Title', 'academy'),

			cell: (row) => {
				return (
					<div className="academy-table-title-wrap">
						<div
							onClick={() => announcementFormOpenHandler(row)}
							className="academy-table-title"
							role="presentation"
							dangerouslySetInnerHTML={{
								__html: sliceString(row?.title?.rendered),
							}}
						></div>
					</div>
				);
			},
		},
		{
			name: __('Description', 'academy'),

			cell: (row) => {
				return (
					<div className="academy-table-title-wrap">
						<div
							role="presentation"
							dangerouslySetInnerHTML={{
								__html: sliceString(row?.content?.rendered),
							}}
						></div>
					</div>
				);
			},
		},
		{
			name: __('Courses', 'academy'),

			cell: (row) => {
				const courses = row.meta.academy_announcements_course_ids;
				return (
					<span
						className="academy-list-wrap__term-lists"
						dangerouslySetInnerHTML={{
							__html: courses?.length
								? courses
										.map(
											(item, index) =>
												`${sliceString(
													hideHtmlTags(item.label),
													12
												)}${
													courses.length - 1 > index
														? ', '
														: ''
												}`
										)
										.join('')
								: '...',
						}}
					/>
				);
			},
		},
		{
			name: __('Date', 'academy'),
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
			name: __('Status', 'academy'),

			cell: (row) => {
				const statusHandler = (itemStatus) => {
					// eslint-disable-next-line
					if(itemStatus === 'trash') {
						dispatch(moveAnnouncementToTrash({ ID: row.id }));
					} else {
						dispatch(
							updateAnnouncementStatus({
								ID: row.id,
								itemStatus,
							})
						);
					}
				};
				return (
					<StatusOptions
						value={row?.status}
						options={{
							items: [
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
									label: __('Edit', 'academy'),
									hasBorder: true,
									icon: (
										<span className="academy-icon academy-icon--edit-two"></span>
									),
									isDisabled: !canUpdateAnnouncement,
									title: !canUpdateAnnouncement
										? permissionDeniedMessage(
												'academy.announcements.update'
											)
										: undefined,
									onClick: () =>
										announcementFormOpenHandler(row),
								},
								{
									type: 'button',
									label: __('Trash', 'academy'),
									suffix: 'trash',
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteAnnouncement,
									title: !canDeleteAnnouncement
										? permissionDeniedMessage(
												'academy.announcements.delete'
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
									icon: (
										<span className="academy-icon academy-icon--reset"></span>
									),
									isDisabled: !canUpdateAnnouncement,
									title: !canUpdateAnnouncement
										? permissionDeniedMessage(
												'academy.announcements.update'
											)
										: undefined,
									onClick: () => restoreHandler(row),
								},
								{
									type: 'button',
									label: __('Delete', 'academy'),
									suffix: 'trash',
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteAnnouncement,
									title: !canDeleteAnnouncement
										? permissionDeniedMessage(
												'academy.announcements.delete'
											)
										: undefined,
									onClick: () => deleteHandler(row),
								},
							]
						: [];
				return (
					<div className="academy-table-item-control">
						<OptionMenu
							options={[...publishedActions, ...trashActions]}
						/>
					</div>
				);
			},
		},
	];

	const noDataText =
		announcements?.data?.length === 0 && !searchText
			? __(
					'Your announcements will show here.',
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
				data={announcements?.data ? announcements?.data : []}
				showSubHeader={true}
				subHeaderComponent={subHeaderComponentMemo}
				isRowSelectable={true}
				showColumnFilter={true}
				getSelectRowValue={(selectedRow) => {
					setSelectedItems(selectedRow);
					setResetSelectedItems(false);
				}}
				showPagination={true}
				noDataText={noDataText}
				onChangePage={handlePageChange}
				onChangeItemsPerPage={handleItemsPage}
				totalItems={announcements?.totalItems}
				totalRows={announcements?.data?.length}
				dataFetchingStatus={dataFetchingStatus}
				resetSelected={resetSelectedItems}
				rowsPerPage={
					announcements?.itemPerPage
						? announcements?.itemPerPage
						: perPage || 10
				}
				suffix="announcement"
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
export default AnnouncementTable;
