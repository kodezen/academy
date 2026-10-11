import React, { useEffect, useState } from 'react';
import { sliceString, getTranslatedStatus } from '@Utils/helper';

import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import ListTable from '@Components/ListTable';
import Search from '@Components/Search';
import { __ } from '@wordpress/i18n';
import {
	deleteQa,
	fetchAllQA,
	updateQAItemPerPage,
	updateQACurrentPage,
} from '@Redux/Slices/questionAndAnswerSlice/questionAndAnswerSlice';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import OptionMenu from '@Components/OptionMenu';
import AnswerFormModal from './AnswerFormModal';

import './styles.scss';

const statusArray = [
	{ value: 'all', label: __('All', 'academy') },
	{ value: 'answered', label: __('Answered', 'academy') },
	{ value: 'waiting_for_answer', label: __('Pending', 'academy') },
];

const QATable = () => {
	const [isOpenModal, setOpenModal] = useState(false);
	const [dataFetchingStatus, setDataFetchingStatus] = useState(false);
	const qa = useSelector((state) => state.questionAndAnswer);
	const [status, setStatus] = useState(qa.status ? qa.status : 'all');
	const [openQuestion, setOpenQuestion] = useState('');
	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	const [searchKey, setSearchKey] = useState('');

	const publishAction =
		status !== 'trash'
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

	const dispatch = useDispatch();

	useEffect(() => {
		if (!qa?.data || (qa?.data && qa?.data?.length <= 1) || status) {
			setDataFetchingStatus(true);
			dispatch(fetchAllQA({ status })).then(() => {
				setDataFetchingStatus(false);
			});
		}
	}, [status]);

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = () => {
		selectedItems.forEach((item) => {
			dispatch(
				deleteQa({
					ID: item.id ? item.id : item.ID,
				})
			);
		});
		handleReset();
	};

	React.useMemo(() => {
		if (confirm) {
			snackbarActionHandler(snackbarOption.value);
		} else {
			handleReset();
		}
	}, [confirm]);

	const handleTableDataFetch = (page = 1, perPage = 10) => {
		setDataFetchingStatus(true);
		dispatch(fetchAllQA({ status: 'any', page, per_page: perPage })).then(
			() => {
				setDataFetchingStatus(false);
			}
		);
	};

	const handlePageChange = (page = 1, itemPerPage = 10) => {
		dispatch(updateQACurrentPage(page));
		handleTableDataFetch(page, itemPerPage);
	};

	const handleItemsPage = (itemPerPage, page) => {
		dispatch(updateQAItemPerPage(itemPerPage));
		handleTableDataFetch(page, itemPerPage);
	};

	const deleteHandler = (item) => {
		// eslint-disable-next-line
		if (window.confirm(__('Are you sure you want to permanently delete selected Question?',
					'academy'
				)
			)
		) {
			dispatch(
				deleteQa({
					ID: item.id ? item.id : item.ID,
				})
			);
		}
	};

	const openModal = (item) => {
		setOpenQuestion(item);
		setOpenModal(true);
	};
	const closeModal = () => {
		setOpenQuestion('');
		setOpenModal(false);
	};

	const columns = [
		{
			name: __('Question', 'academy'),
			cell: (row) => (
				<div className="academy-table-title-wrap">
					<div
						className="academy-table-title"
						onClick={() => openModal(row)}
						dangerouslySetInnerHTML={{
							__html: sliceString(row.meta.question_title, 30),
						}}
						role="presentation"
					></div>
					<div
						className="academy-table-title"
						dangerouslySetInnerHTML={{
							__html: sliceString(row.content.rendered, 30),
						}}
					></div>
				</div>
			),
		},
		{
			name: __('Course', 'academy'),
			cell: (row) => (
				<a href={row._post.permalink} target="_blank" rel="noreferrer">
					{sliceString(row._post.title, 12)}
				</a>
			),
		},
		{
			name: __('Students', 'academy'),
			cell: (row) => <span>{row.author_name}</span>,
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

			cell: (row) => (
				<div className={`academy-${row.status}`}>
					{row.status === 'waiting_for_answer'
						? __('Waiting For Answer', 'academy')
						: getTranslatedStatus(row.status)}
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
								label:
									row.status === 'waiting_for_answer'
										? __('Give answer', 'academy')
										: __('Details', 'academy'),
								hasBorder: true,
								icon:
									row.status === 'waiting_for_answer' ? (
										<span className="academy-icon academy-icon--correct" />
									) : (
										<span className="academy-icon academy-icon--details" />
									),
								suffix:
									row.status === 'waiting_for_answer'
										? 'give-answer'
										: 'given-answer',
								onClick: () => openModal(row),
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

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			setDataFetchingStatus(true);
			dispatch(
				fetchAllQA({
					status: 'any',
					page: 1,
					per_pag: 10,
					search: value,
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
								onClick={() => setStatus(item.value)}
							>
								{item.label}
							</span>
						))}
					</div>
				</div>
				<div className="academy-table-sub-header-actions-right">
					<Search
						placeholder={__('Search Q&A', 'academy')}
						onSearchHandler={searchHandler}
					/>
					<div className="academy-table-sub-header-actions-right--border" />
				</div>
			</>
		);
	}, [status]);

	const noDataText =
		qa?.data?.length === 0 && !searchKey
			? __('Your questions will show here.', 'academy')
			: __(
					'No matching results found. Please try a different search.',
					'academy'
				);

	return (
		<>
			<ListTable
				columns={columns}
				data={qa?.data ? qa?.data : []}
				showSubHeader={true}
				subHeaderComponent={subHeaderComponentMemo}
				noDataText={noDataText}
				isRowSelectable={true}
				showColumnFilter={true}
				getSelectRowValue={(selectedRow) => {
					setSelectedItems(selectedRow);
					setResetSelectedItems(false);
				}}
				showPagination={true}
				onChangePage={handlePageChange}
				onChangeItemsPerPage={handleItemsPage}
				totalItems={qa?.totalItems}
				totalRows={qa?.data?.length}
				dataFetchingStatus={dataFetchingStatus}
				resetSelected={resetSelectedItems}
				rowsPerPage={qa?.itemPerPage ?? 10}
				suffix="qa"
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
			{isOpenModal && (
				<AnswerFormModal
					question={openQuestion}
					closeModal={closeModal}
				/>
			)}
		</>
	);
};
export default QATable;
