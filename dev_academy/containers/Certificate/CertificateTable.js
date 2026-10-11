import React, { useEffect, useRef, useState } from 'react';
import {
	deleteCertificate,
	fetchAllCertificates,
	restoreCertificate,
	updateCertificate,
	updateItemPerPage,
	updateCurrentPage,
	makePrimaryCertificate,
	moveCertificateToTrash,
} from '@Redux/Slices/certificateSlice/certificateSlice';
import { useDispatch, useSelector } from 'react-redux';
import StatusOptions from '@Components/StatusOptions';

import ListTable from '@Components/ListTable';
import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import {
	makeRequest,
	sliceString,
	admin_url,
	route_path,
	plugin_root_url,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import OptionMenu from '@Components/OptionMenu';
import { fetchSettings } from '@Redux/Slices/settingsSlice/settingsSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

const CertificateTable = () => {
	const certificates = useSelector((state) => state.certificates);
	const settings = useSelector((state) => state.settings.data);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	const [dataFetchingStatus, setDataFetchingStatus] = useState(
		!settings || !certificates?.data ? true : false
	);
	const [onSearchLoader, setOnSearchLoader] = useState(false);
	// Every fetch-triggering action below (page/status tab/search) bumps this
	// before dispatching, then only clears its own loading flag if it's
	// still the *latest* one when its request resolves. Clicking through
	// tabs quickly fires several overlapping fetches with no guarantee they
	// resolve in the order they were sent — without this guard, an older
	// request finishing after a newer one flips the loading indicator off
	// (or back on) while the newer request is still the one that matters,
	// so the spinner could disappear mid-load or never settle correctly.
	const requestSeqRef = useRef(0);

	const location = useQuery();
	const certificateStatus = location.get('status');
	const searchText = location.get('search');

	const [status, setStatus] = useState(
		certificateStatus ? certificateStatus : 'all'
	);

	const canUpdateCertificate = can('academy.certificates.update');
	const canCreateCertificate = can('academy.certificates.create');
	const canDeleteCertificate = can('academy.certificates.delete');

	const handleNavigate = (tableStatus = '', text = '', options = {}) => {
		let url = `${route_path}admin.php?page=academy-certificates`;

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
						isDisabled: !canDeleteCertificate,
						title: !canDeleteCertificate
							? permissionDeniedMessage(
									'academy.certificates.delete'
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
						isDisabled: !canUpdateCertificate,
						title: !canUpdateCertificate
							? permissionDeniedMessage(
									'academy.certificates.update'
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
						isDisabled: !canDeleteCertificate,
						title: !canDeleteCertificate
							? permissionDeniedMessage(
									'academy.certificates.delete'
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
		// `settings` starts out `null` in the redux store until `fetchSettings`
		// resolves once anywhere in the app — landing on this page first (e.g.
		// a direct link or reload) hits that null before it's ever populated,
		// and `Object.keys(null)` throws instead of short-circuiting.
		if (!settings || Object.keys(settings).length === 0) {
			dispatch(fetchSettings()).then(() => handleTableDataFetch());
		} else {
			handleTableDataFetch();
		}
	}, []);

	const duplicateHandler = (item) => {
		setDataFetchingStatus(true);

		makeRequest({
			action: 'academy_pro/duplicate_certificate',
			certificate_id: item?.id,
		})
			.then((res) => {
				if (res.data.success) {
					console.log('hello i am fetch block');
					dispatch(fetchAllCertificates({ status })).then(() => {
						setDataFetchingStatus(false);
					});
				}
			})
			.catch((err) => {
				setDataFetchingStatus(false);
				dispatch(
					showNotification({
						message: err.message || 'Request failed',
						isShow: true,
						type: 'error',
					})
				);
			});
	};

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = (option) => {
		if (status !== 'trash' && option === 'trash') {
			selectedItems.forEach((item) => {
				dispatch(moveCertificateToTrash(item));
			});
			handleReset();
		} else if (option === 'restore') {
			selectedItems.forEach((item) => {
				dispatch(restoreCertificate({ ...item, status: 'draft' }));
			});
			handleReset();
		} else {
			selectedItems.forEach((item) => {
				dispatch(deleteCertificate(item));
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

	useEffect(() => {
		// Re-syncs the URL with the current filters; replace, not push,
		// or each visit adds a duplicate history entry and Back stalls.
		handleNavigate(certificateStatus, searchText, { replace: true });
	}, [certificateStatus, searchText]);

	const handleTableDataFetch = (page = 1, perPage = 10) => {
		const seq = ++requestSeqRef.current;
		setDataFetchingStatus(true);
		dispatch(
			fetchAllCertificates({ status, page, per_page: perPage })
		).then(() => {
			if (seq === requestSeqRef.current) {
				setDataFetchingStatus(false);
			}
		});
	};

	const handlePageChange = (page, perPage = 10) => {
		dispatch(updateCurrentPage(page));
		handleTableDataFetch(page, perPage);
	};
	const handleItemsPage = (itemsPerPage, page) => {
		dispatch(updateItemPerPage(itemsPerPage));
		handleTableDataFetch(page, itemsPerPage);
		handleNavigate(certificateStatus);
	};

	const deleteHandler = (item) => {
		// eslint-disable-next-line
		if (item.status !== 'trash') {
			dispatch(moveCertificateToTrash(item));
		} else if (
			// eslint-disable-next-line
			window.confirm(
				__(
					'Are you sure you want to permanently delete selected certificates?',
					'academy'
				)
			)
		) {
			dispatch(deleteCertificate(item));
		}
	};

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			const seq = ++requestSeqRef.current;
			setOnSearchLoader(true);
			dispatch(
				fetchAllCertificates({
					status,
					page: 1,
					per_page: 10,
					search: value,
				})
			).then(() => {
				if (seq === requestSeqRef.current) {
					setOnSearchLoader(false);
				}
				handleNavigate(certificateStatus, value);
			});
		};
		const dataFetchHandler = (itemStatus) => {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			handleNavigate(itemStatus);
			dispatch(fetchAllCertificates({ status: itemStatus })).then(() => {
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
						placeholder={__('Search certificates', 'academy')}
						onSearchHandler={searchHandler}
						defaultValue={searchText ? searchText : ''}
					/>
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
						<div className="academy-table-title">
							{canUpdateCertificate ? (
								<Link
									to={`${route_path}admin.php?page=academy-certificates&id=${row.id}`}
								>
									{sliceString(row.title.rendered, 30)}
								</Link>
							) : (
								sliceString(row.title.rendered, 30)
							)}
						</div>
					</div>
				);
			},
		},
		{
			name: __('Date', 'academy'),
			cell: (row) => (
				<div>
					{moment(row.date).format('h:mm A')}
					<span></span>
					<br />
					<span className="academy-table-time">
						{moment(row.date).format('MMMM DD, YYYY')}
					</span>
				</div>
			),
		},
		{
			name: __('Author', 'academy'),

			cell: (row) => <span>{row.author_name}</span>,
		},
		{
			name: __('Primary', 'academy'),
			cell: (row) => {
				const isPrimary =
					row?.id === settings?.academy_primary_certificate_id;

				return (
					<span
						className={`academy-${isPrimary ? 'success' : 'draft'}`}
					>
						{isPrimary ? __('Primary', 'academy') : '---'}
					</span>
				);
			},
		},

		{
			name: __('Status', 'academy'),
			cell: (row) => {
				const statusHandler = (itemStatus) => {
					if ('trash' === itemStatus) {
						dispatch(moveCertificateToTrash(row));
					} else {
						const data = {
							status: itemStatus,
							content: row?.content?.raw ?? '',
						};
						dispatch(
							updateCertificate({ ID: row.id, formData: data })
						);
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
									isDisabled: !canDeleteCertificate,
									title: !canDeleteCertificate
										? permissionDeniedMessage(
												'academy.certificates.delete'
											)
										: undefined,
									onClick: () =>
										dispatch(moveCertificateToTrash(row)),
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
										<span className="academy-icon academy-icon--reset"></span>
									),
									isDisabled: !canUpdateCertificate,
									title: !canUpdateCertificate
										? permissionDeniedMessage(
												'academy.certificates.update'
											)
										: undefined,
									onClick: () =>
										dispatch(
											restoreCertificate({
												...row,
												status: 'draft',
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
									isDisabled: !canDeleteCertificate,
									title: !canDeleteCertificate
										? permissionDeniedMessage(
												'academy.certificates.delete'
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
									type: 'link',
									label: <span>{__('Edit', 'academy')}</span>,
									icon: (
										<span className="academy-icon academy-icon--edit" />
									),
									link: `${admin_url}admin.php?page=academy-certificates&id=${row.id}`,
									isDisabled: !canUpdateCertificate,
									title: !canUpdateCertificate
										? permissionDeniedMessage(
												'academy.certificates.update'
											)
										: undefined,
								},
								{
									type: 'button',
									label: (
										<span>
											{__('Duplicate', 'academy')}
										</span>
									),
									icon: (
										<span className="academy-icon academy-icon--copy-two" />
									),
									isDisabled: !canCreateCertificate,
									title: !canCreateCertificate
										? permissionDeniedMessage(
												'academy.certificates.create'
											)
										: undefined,
									onClick: () => {
										duplicateHandler(row);
									},
								},
								{
									type: 'button',
									label: __('Make Primary', 'academy'),
									icon: (
										<img
											className="academy-icon-slash"
											src={
												plugin_root_url +
												'assets/images/set_primary.svg'
											}
											alt={__('disable', 'academy')}
										/>
									),
									hasBorder: true,
									// Make Primary writes
									// academy_primary_certificate_id via the
									// settings endpoint, not a certificate
									// write — gated on academy.settings, not
									// any of the academy.certificates.* slugs.
									isDisabled: !can('academy.settings'),
									title: !can('academy.settings')
										? permissionDeniedMessage(
												'academy.settings'
											)
										: undefined,
									onClick: () => {
										setDataFetchingStatus(true);
										dispatch(
											makePrimaryCertificate(row.id)
										).then((response) => {
											if (response?.data?.success) {
												setDataFetchingStatus(false);
											} else {
												setDataFetchingStatus(false);
											}
										});
									},
								},
								...publishedActions,
								...trashActions,
							]}
						/>
					</div>
				);
			},
		},
	];

	return (
		<>
			{/* Always mounted (not swapped for a <Preloader/> while
			dataFetchingStatus is true) — ListTable already takes that flag
			and shows its own internal loader via TableBody, which is the
			only correct way to represent "loading" here: unmounting this
			component discards its copyDataArr state, and if a fetch that
			was already in flight when that happened resolves afterward, the
			resulting setCopyDataArr(...) call lands on nothing — the newly
			(re)mounted instance never sees it, so the table is stuck
			showing "Nothing here yet" despite the row data having loaded
			successfully. */}
			<ListTable
				columns={columns}
				data={certificates?.data ? certificates.data : []}
				showSubHeader={true}
				noDataText={__(
					'Your certificates will show here.',
					'academy'
				)}
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
				rowsPerPage={
					certificates?.itemPerPage
						? certificates?.itemPerPage
						: 10
				}
				totalItems={certificates?.totalItems}
				totalRows={certificates?.data?.length}
				dataFetchingStatus={dataFetchingStatus || onSearchLoader}
				resetSelected={resetSelectedItems}
				currentPageNumber={certificates?.currentPage}
				suffix="certificate"
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

export default CertificateTable;
