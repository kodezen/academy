import React, { useCallback, useEffect, useRef, useState } from 'react';
import Select from '@Components/AcademySelect';
import ReactModal from '@Components/Modal/ReactModal';
import Button from '@Components/Button';
import Search from '@Components/Search';
import ListTable from '@Components/ListTable';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchQuestionBank,
	importQuestions,
} from '@Redux/Slices/quizQuestionSlice/quizQuestionSlice';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import MathJaxLateX from '@Components/MathJaxLateX';
import { API, namespace } from '@Utils/helper';
import { questionTypeOption } from '../helper';
import { ExportIcon, ImportIcon } from '../QuestionsManager/helper';
import './styles.scss';

const ORDER_OPTIONS = [
	{ value: 'question_created_at:DESC', label: __('Newest', 'academy') },
	{ value: 'question_created_at:ASC', label: __('Oldest', 'academy') },
	{ value: 'question_title:ASC', label: __('A → Z', 'academy') },
	{ value: 'question_title:DESC', label: __('Z → A', 'academy') },
];

const CSV_COLUMNS = [
	'question_title',
	'question_content',
	'question_explanation',
	'question_type',
	'question_level',
	'question_score',
	'question_negative_score',
	'question_settings',
	'question_answers',
];

function parseCSV(text) {
	const lines = text.trim().split(/\r?\n/);
	if (lines.length < 2) return [];
	const headers = lines[0]
		.split(',')
		.map((h) => h.replace(/^"|"$/g, '').trim());
	return lines.slice(1).map((line) => {
		const values = [];
		let inQuote = false;
		let current = '';
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"') {
				if (inQuote && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuote = !inQuote;
				}
			} else if (ch === ',' && !inQuote) {
				values.push(current);
				current = '';
			} else {
				current += ch;
			}
		}
		values.push(current);
		const row = {};
		headers.forEach((h, idx) => (row[h] = values[idx] ?? ''));
		return row;
	});
}

function buildCSV(rows) {
	const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
	const header = CSV_COLUMNS.join(',');
	const body = rows.map((r) =>
		CSV_COLUMNS.map((c) => escape(r[c])).join(',')
	);
	return [header, ...body].join('\r\n');
}

function triggerDownload(content, filename, type = 'text/csv') {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export default function QuestionBank({
	isOpen,
	onClose,
	onAddQuestions,
	existingIds = [],
}) {
	const dispatch = useDispatch();
	const bank = useSelector((s) => s.quizQuestions.bank);

	const [search, setSearch] = useState('');
	const [questionType, setQuestionType] = useState('');
	const [sortValue, setSortValue] = useState('question_created_at:DESC');
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [selected, setSelected] = useState([]);
	const [importing, setImporting] = useState(false);
	const [exporting, setExporting] = useState(false);
	const importInputRef = useRef(null);

	// ListTable snapshots `columns` only on mount, so its rendered
	// checkboxes go stale once `selected` changes. Remounting it here
	// forces it to re-read the latest column closures.
	const [tableInstanceKey, setTableInstanceKey] = useState(0);
	useEffect(() => {
		setTableInstanceKey((k) => k + 1);
	}, [selected]);

	const [orderby, order] = sortValue.split(':');

	const fetchBank = useCallback(() => {
		dispatch(
			fetchQuestionBank({
				search,
				question_type: questionType,
				orderby,
				order,
				page,
				per_page: itemsPerPage,
			})
		);
	}, [dispatch, search, questionType, orderby, order, page, itemsPerPage]);

	useEffect(() => {
		if (isOpen) fetchBank();
	}, [isOpen, fetchBank]);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
		setSelected([]);
	}, [search, questionType, sortValue]);

	const toggleSelect = (id) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const toggleSelectAll = () => {
		const pageIds = bank.data.map((q) => q.question_id);
		const allSelected = pageIds.every((id) => selected.includes(id));
		if (allSelected) {
			setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
		} else {
			setSelected((prev) => [...new Set([...prev, ...pageIds])]);
		}
	};

	const handleAddSelected = () => {
		const toAdd = bank.data
			.filter(
				(q) =>
					selected.includes(q.question_id) &&
					!existingIds.includes(q.question_id)
			)
			.map((q) => ({ id: q.question_id, title: q.question_title }));

		if (toAdd.length === 0) {
			dispatch(
				showNotification({
					message: __('No new questions to add.', 'academy'),
					isShow: true,
					type: 'warning',
				})
			);
			return;
		}
		onAddQuestions(toAdd);
		setSelected([]);
		onClose();
	};

	const handleExport = async () => {
		setExporting(true);
		try {
			const res = await API.get(`${namespace}quiz_questions/export`);
			if (res.status === 200 && res.data?.length) {
				triggerDownload(
					buildCSV(res.data),
					`academy-questions-${new Date().toISOString().slice(0, 10)}.csv`
				);
			} else {
				dispatch(
					showNotification({
						message: __('No questions to export.', 'academy'),
						isShow: true,
						type: 'warning',
					})
				);
			}
		} catch {
			dispatch(
				showNotification({
					message: __('Export failed.', 'academy'),
					isShow: true,
					type: 'error',
				})
			);
		} finally {
			setExporting(false);
		}
	};

	const handleImportFile = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new window.FileReader();
		reader.onload = async (ev) => {
			setImporting(true);
			try {
				const rows = parseCSV(ev.target.result);
				if (!rows.length) {
					dispatch(
						showNotification({
							message: __(
								'CSV is empty or has no data rows.',
								'academy'
							),
							isShow: true,
							type: 'error',
						})
					);
					return;
				}
				const result = await dispatch(importQuestions(rows)).unwrap();
				const msg = result.errors?.length
					? sprintf(
							/* translators: 1: number of imported questions, 2: number of errors. */
							__(
								'Imported %1$d question(s). %2$d error(s).',
								'academy'
							),
							result.imported,
							result.errors.length
						)
					: sprintf(
							/* translators: %d: number of imported questions. */
							__(
								'Successfully imported %d question(s).',
								'academy'
							),
							result.imported
						);
				dispatch(
					showNotification({
						message: msg,
						isShow: true,
						type: result.errors?.length ? 'warning' : 'success',
					})
				);
				fetchBank();
			} catch (err) {
				dispatch(
					showNotification({
						message:
							err?.message ?? __('Import failed.', 'academy'),
						isShow: true,
						type: 'error',
					})
				);
			} finally {
				setImporting(false);
				e.target.value = '';
			}
		};
		reader.readAsText(file);
	};

	const handleChangePage = (newPage) => setPage(newPage);

	const handleChangeItemsPerPage = (newPerPage) => {
		setItemsPerPage(newPerPage);
		setPage(1);
	};

	const pageIds = bank.data.map((q) => q.question_id);
	const allChecked =
		pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
	const someChecked = pageIds.some((id) => selected.includes(id));

	const columns = [
		{
			name: (
				<span className="academy-question-bank__checkbox-wrap">
					<input
						type="checkbox"
						aria-label={__('Select all questions', 'academy')}
						checked={allChecked}
						disabled={pageIds.length === 0}
						ref={(el) => {
							if (el)
								el.indeterminate = !allChecked && someChecked;
						}}
						onChange={toggleSelectAll}
					/>
				</span>
			),
			cell: (row) => {
				const isExisting = existingIds.includes(row.question_id);
				const isChecked = selected.includes(row.question_id);
				return (
					<input
						id={`academy-question-bank-item-${row.question_id}`}
						type="checkbox"
						checked={isChecked}
						disabled={isExisting}
						onChange={() => toggleSelect(row.question_id)}
						className="academy-question-bank__item-checkbox"
					/>
				);
			},
		},
		{
			name: __('Question', 'academy'),
			cell: (row) => {
				const isExisting = existingIds.includes(row.question_id);
				return (
					<label
						htmlFor={`academy-question-bank-item-${row.question_id}`}
						className={`academy-question-bank__item-title${
							isExisting
								? ' academy-question-bank__item-title--added'
								: ''
						}`}
					>
						<MathJaxLateX text={row.question_title} />
						{isExisting && (
							<span className="academy-question-bank__badge">
								{__('Added', 'academy')}
							</span>
						)}
					</label>
				);
			},
		},
		{
			name: __('Type', 'academy'),
			cell: (row) => (
				<span className="academy-question-bank__item-type">
					{questionTypeOption.find(
						(opt) => opt.value === row.question_type
					)?.label ?? row.question_type}
				</span>
			),
		},
		{
			name: __('Level', 'academy'),
			cell: (row) => (
				<span className="academy-question-bank__item-level">
					{row.question_level || '—'}
				</span>
			),
		},
	];

	const subHeaderComponent = (
		<>
			<div className="academy-table__sub-header-actions-left" />
			<div className="academy-table-sub-header-actions-right">
				<Search
					placeholder={__('Search questions…', 'academy')}
					defaultValue={search}
					onSearchHandler={setSearch}
				/>

				<Select
					className="academy-select"
					suffix="bank-type-filter"
					placeholder={__('All Types', 'academy')}
					isClearable={true}
					isSearchable={false}
					options={questionTypeOption}
					value={
						questionTypeOption.find(
							(opt) => opt.value === questionType
						) ?? ''
					}
					onChangeHandler={(val) => setQuestionType(val ?? '')}
				/>

				<Select
					className="academy-select"
					suffix="bank-sort"
					isSearchable={false}
					options={ORDER_OPTIONS}
					value={ORDER_OPTIONS.find((opt) => opt.value === sortValue)}
					onChangeHandler={(val) => setSortValue(val)}
				/>

				<div className="academy-table-sub-header-actions-right--border" />

				<Button
					preset="border-purple"
					borderRadius="rounded"
					label={__('Import', 'academy')}
					size="sm"
					icon={<ImportIcon size={16} />}
					isLoading={importing}
					loadingLabel={__('Importing…', 'academy')}
					onClick={() => importInputRef.current?.click()}
					suffix="header-btns"
				/>
				<input
					type="file"
					accept=".csv"
					ref={importInputRef}
					onChange={handleImportFile}
					hidden
				/>

				<Button
					preset="border-purple"
					borderRadius="rounded"
					size="sm"
					label={__('Export', 'academy')}
					icon={<ExportIcon size={16} />}
					suffix="header-btns"
					isLoading={exporting}
					loadingLabel={__('Exporting…', 'academy')}
					onClick={handleExport}
				/>
			</div>
		</>
	);

	const noDataText = search
		? __(
				'No matching results found. Please try a different search.',
				'academy'
			)
		: __('No questions available to reuse yet.', 'academy');

	return (
		<ReactModal
			isOpen={isOpen}
			onRequestClose={onClose}
			title={__('Reuse Content', 'academy')}
			subtitle={
				bank.total
					? `${bank.total} ${bank.total > 1 ? __('questions', 'academy') : __('question', 'academy')}`
					: ''
			}
			suffix="question-bank"
			size="medium"
			isEnabledHeader={true}
		>
			<div className="academy-question-bank">
				<ListTable
					key={tableInstanceKey}
					columns={columns}
					data={bank.data}
					showSubHeader={true}
					subHeaderComponent={subHeaderComponent}
					showColumnFilter={false}
					isRowSelectable={false}
					showPagination={true}
					onChangePage={handleChangePage}
					onChangeItemsPerPage={handleChangeItemsPerPage}
					totalItems={bank.total}
					dataFetchingStatus={bank.loading}
					currentPageNumber={page}
					rowsPerPage={itemsPerPage}
					suffix="question-bank"
					noDataText={noDataText}
				/>

				<div className="academy-question-bank__footer">
					<span className="academy-question-bank__selected-count">
						{selected.length > 0
							? sprintf(
									/* translators: %d: number of selected questions. */
									__('%d selected', 'academy'),
									selected.length
								)
							: ''}
					</span>
					<div className="academy-question-bank__footer-btns">
						<Button
							preset="border-purple"
							borderRadius="rounded"
							label={__('Cancel', 'academy')}
							onClick={onClose}
						/>
						<Button
							borderRadius="rounded"
							preset={selected.length === 0 ? 'gray' : 'purple'}
							label={sprintf(
								/* translators: %d: number of selected questions. */
								__('Add %d to Quiz', 'academy'),
								selected.length
							)}
							isDisabled={selected.length === 0}
							onClick={handleAddSelected}
						/>
					</div>
				</div>
			</div>
		</ReactModal>
	);
}
