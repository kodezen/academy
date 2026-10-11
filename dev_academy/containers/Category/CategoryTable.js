import React, { useEffect, useRef, useState } from 'react';

import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import ListTable from '@Components/ListTable';
import PropTypes from 'prop-types';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import { sliceString } from '@Utils/helper';
import OptionMenu from '@Components/OptionMenu';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchAllCategories,
	updateItemPerPage,
	updateCurrentPage,
	fetchInCludedCategory,
} from '@Redux/Slices/categorySlice/categorySlice';
import {
	fetchAllBookingCategories,
	fetchBookingInCludedCategory,
} from '@Redux/Slices/bookingSlice/bookingSlice';

const propTypes = {
	deleteHandler: PropTypes.func,
};

export default function CategoryTable({
	viewFrom,
	editItemHandler,
	deleteHandler = () => {},
}) {
	const [dataFetchingStatus, setDataFetchingStatus] = useState(false);
	const courseCategory = useSelector((state) => state.categories);
	const bookingCategory = useSelector((state) => state.bookings.categories);
	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	const [searchKey, setSearchKey] = useState('');
	const dispatch = useDispatch();
	// Every fetch-triggering action below (mount/page/search, for either the
	// course-category or booking-category list) bumps this before
	// dispatching, then only clears its own loading flag if it's still the
	// *latest* one when its request resolves. Clicking around quickly fires
	// several overlapping fetches with no guarantee they resolve in the
	// order they were sent — without this guard, an older request finishing
	// after a newer one flips the loading indicator off (or back on) while
	// the newer request is still the one that matters, so the spinner could
	// disappear mid-load or never settle correctly.
	const requestSeqRef = useRef(0);

	const publishAction = [
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
	];
	const snackbarOptions = [...publishAction];

	useEffect(() => {
		if (viewFrom === 'course') {
			if (
				!courseCategory.data ||
				(courseCategory.data && courseCategory.data.length <= 1)
			) {
				const seq = ++requestSeqRef.current;
				setDataFetchingStatus(true);
				dispatch(fetchAllCategories()).then(({ payload: { data } }) => {
					const usedParentIds = new Set(
						data.map((cat) => cat.parent).filter((id) => id !== 0)
					);
					console.log({ usedParentIds });
					if (usedParentIds.size > 0) {
						dispatch(
							fetchInCludedCategory([...usedParentIds])
						).then(() => {
							if (seq === requestSeqRef.current) {
								setDataFetchingStatus(false);
							}
						});
					} else if (seq === requestSeqRef.current) {
						setDataFetchingStatus(false);
					}
				});
			}
		} else if (
			!bookingCategory ||
			(bookingCategory && bookingCategory.length <= 1)
		) {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			dispatch(fetchAllBookingCategories()).then(
				({ payload: { data } }) => {
					const usedParentIds = new Set(
						data.map((cat) => cat.parent).filter((id) => id !== 0)
					);
					if (usedParentIds.size > 0) {
						dispatch(
							fetchBookingInCludedCategory([...usedParentIds])
						).then(() => {
							if (seq === requestSeqRef.current) {
								setDataFetchingStatus(false);
							}
						});
					} else if (seq === requestSeqRef.current) {
						setDataFetchingStatus(false);
					}
				}
			);
		}
	}, [viewFrom]);

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = () => {
		selectedItems.forEach((item) => {
			deleteHandler(item?.id);
		});
		handleReset();
	};

	const handleTableDataFetch = (page = 1, perPage = 10) => {
		const seq = ++requestSeqRef.current;
		setDataFetchingStatus(true);
		dispatch(fetchAllCategories()).then(() => {
			if (seq === requestSeqRef.current) {
				setDataFetchingStatus(false);
			}
		});
	};

	const handlePageChange = (page = 1, perPage = 10) => {
		dispatch(updateCurrentPage(page));
		handleTableDataFetch(page, perPage);
	};

	const handleItemsPage = (itemsPerPage, page) => {
		dispatch(updateItemPerPage(itemsPerPage));
		handleTableDataFetch(page, itemsPerPage);
	};

	React.useMemo(() => {
		if (confirm) {
			snackbarActionHandler(snackbarOption.value);
		} else {
			handleReset();
		}
	}, [confirm]);

	const categoryDeleteHandler = (item) => {
		// eslint-disable-next-line
		if (
			window.confirm(
				__(
					'Are you sure you want to permanently delete selected course category?',
					'academy'
				)
			)
		) {
			deleteHandler(item.id);
		}
	};

	const columns = [
		{
			name: __('Name', 'academy'),
			cell: (row) => {
				return (
					<div className="academy-table-title-wrap academy-category-title-stack">
						{row.category_image_url && (
							<img
								src={row.category_image_url}
								alt=""
								className="academy-table-title__category-thumb"
							/>
						)}
						<div className="academy-category-title-stack__row">
							<div
								onClick={() => editItemHandler(row)}
								className="academy-table-title"
								role="presentation"
							>
								<p>{sliceString(row.name)}</p>
							</div>
							<a href={row.link} target="_blank" rel="noreferrer">
								<span className="academy-icon academy-icon--go-on"></span>
							</a>
						</div>
						<span className="academy-table-title__category-id">
							{__('ID: ', 'academy')}
							{row.id}
						</span>
					</div>
				);
			},
		},
		{
			name: __('Description', 'academy'),
			cell: (row) => (
				<span>
					{row?.description !== ''
						? sliceString(row.description, 30)
						: '-'}
				</span>
			),
		},
		{
			name: __('Count', 'academy'),
			cell: (row) => <span>{row.count}</span>,
		},
		{
			name: __('Parent', 'academy'),
			cell: (row) => {
				const parentCat =
					data && data?.filter((item) => item.id === row.parent);
				if (parentCat?.length) {
					return <span>{parentCat[0]?.name}</span>;
				}
				return '-';
			},
		},
		{
			name: __('Action', 'academy'),
			cell: (row) => (
				<div className="academy-table-item-control">
					<OptionMenu
						options={[
							{
								type: 'button',
								label: __('Edit', 'academy'),
								icon: (
									<span className="academy-icon academy-icon--edit-two" />
								),
								onClick: () => editItemHandler(row),
							},
							{
								type: 'link',
								label: __('View', 'academy'),
								hasBorder: true,
								icon: (
									<span className="academy-icon academy-icon--eye" />
								),
								link: row.link,
								target: '_blank',
							},
							{
								type: 'button',
								label: __('Delete', 'academy'),
								suffix: 'trash',
								icon: (
									<span className="academy-icon academy-icon--trash-delete" />
								),
								onClick: () => categoryDeleteHandler(row),
							},
						]}
					/>
				</div>
			),
		},
	];

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (searchKeyword) => {
			setSearchKey(searchKeyword);
			const seq = ++requestSeqRef.current;
			if (viewFrom === 'course') {
				setDataFetchingStatus(true);
				dispatch(fetchAllCategories(searchKeyword)).then(() => {
					if (seq === requestSeqRef.current) {
						setDataFetchingStatus(false);
					}
				});
			} else {
				setDataFetchingStatus(true);
				dispatch(fetchAllBookingCategories(searchKeyword)).then(() => {
					if (seq === requestSeqRef.current) {
						setDataFetchingStatus(false);
					}
				});
			}
		};

		return (
			<>
				<div className="academy-table__sub-header-actions-left"></div>
				<div className="academy-table-sub-header-actions-right">
					<Search
						placeholder={__('Search Category', 'academy')}
						onSearchHandler={searchHandler}
						defaultValue={searchKey ?? ''}
					/>
					<div className="academy-table-sub-header-actions-right--border" />
				</div>
			</>
		);
	}, [searchKey]);

	const data = viewFrom === 'course' ? courseCategory?.data : bookingCategory;

	const noDataText =
		data?.length === 0 && !searchKey
			? __(
					'Your categories will show here.',
					'academy'
				)
			: __(
					'No matching results found. Please try a different search.',
					'academy'
				);

	return (
		<>
			{/* Always mounted — see ListTable/index.js's data-normalization
			comment. Swapping this for a <Preloader/> while dataFetchingStatus
			is true (ListTable already takes that flag and shows its own
			internal loader) unmounts it and discards its copyDataArr state;
			a fetch that was already in flight when that happened then has
			nowhere to land, leaving the table stuck on its empty state even
			after the data loaded successfully. */}
			<ListTable
				columns={columns}
				data={data ? data : []}
				showSubHeader={true}
				subHeaderComponent={subHeaderComponentMemo}
				isRowSelectable={true}
				showColumnFilter={true}
				getSelectRowValue={(selectedRow) => {
					setSelectedItems(selectedRow);
					setResetSelectedItems(false);
				}}
				noDataText={noDataText}
				showPagination={false}
				onChangePage={handlePageChange}
				onChangeItemsPerPage={handleItemsPage}
				totalItems={courseCategory?.totalItems}
				totalRows={courseCategory?.data?.length}
				dataFetchingStatus={dataFetchingStatus}
				resetSelected={resetSelectedItems}
				suffix={`${viewFrom}-category`}
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

CategoryTable.propTypes = propTypes;
