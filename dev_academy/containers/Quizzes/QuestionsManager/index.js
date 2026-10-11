import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { __, _n, sprintf } from '@wordpress/i18n';
import ListTable from '@Components/ListTable';
import Search from '@Components/Search';
import Select from '@Components/AcademySelect';
import Button from '@Components/Button';
import TopBar from '@Components/TopBar';
import QuizTabs from '../QuizTabs';
import ReactModal from '@Components/Modal/ReactModal';
import Preloader from '@Components/Loader/Preloader';
import SubTopBar from '@Components/SubTopBar';
import OptionMenu from '@Components/OptionMenu';
import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import MathJaxLateX from '@Components/MathJaxLateX';
import { API, namespace } from '@Utils/helper';
import {
	fetchQuestionBank,
	importQuestions,
} from '@Redux/Slices/quizQuestionSlice/quizQuestionSlice';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import { questionTypeOption, questionLevelOption } from '../helper';
import QuestionEditor from './QuestionEditor';
import { ExportIcon, ImportIcon } from './helper';

import './styles.scss';

// CSV shape shared with the server import/export endpoints.
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
		headers.forEach((h, idx) => {
			row[h] = values[idx] ?? '';
		});
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
	const blob = new window.Blob([content], { type });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
}

const ORDER_OPTIONS = [
	{ value: 'question_created_at:DESC', label: __('Newest', 'academy') },
	{ value: 'question_created_at:ASC', label: __('Oldest', 'academy') },
	{ value: 'question_title:ASC', label: __('A → Z', 'academy') },
	{ value: 'question_title:DESC', label: __('Z → A', 'academy') },
];

const typeLabel = (value) =>
	questionTypeOption.find((opt) => opt.value === value)?.label || value;

const levelLabel = (value) =>
	questionLevelOption.find((opt) => opt.value === value)?.label || value;

/*
 * Standalone question bank (Quizzes → Questions). Lists every question row —
 * the same pool quizzes draw from via "Reuse Content" — with a "Used in" column
 * powered by the reverse-lookup endpoint. Create/edit reuse the shared
 * QuestionForm with quiz_id 0 (unowned); delete is global and strips the id
 * from every quiz that references it (handled server-side).
 */
export default function QuestionsManager() {
	const dispatch = useDispatch();
	const bank = useSelector((state) => state.quizQuestions.bank);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Route-based create/edit editor (replaces the modal). `question_form` is
	// new|edit; `item_id` carries the question id when editing.
	const questionForm = searchParams.get('question_form');
	const isEditorRoute = ['new', 'edit'].includes(questionForm);
	const editingId = searchParams.get('item_id');

	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [questionType, setQuestionType] = useState('');
	const [questionLevel, setQuestionLevel] = useState('');
	const [sortValue, setSortValue] = useState('question_created_at:DESC');

	// "Used in" quizzes modal.
	const [usageOpen, setUsageOpen] = useState(false);
	const [usageLoading, setUsageLoading] = useState(false);
	const [usageData, setUsageData] = useState({ title: '', quizzes: [] });

	const [deletingId, setDeletingId] = useState(false);
	const [importing, setImporting] = useState(false);
	const [exporting, setExporting] = useState(false);
	const importInputRef = useRef(null);

	// Bulk row selection.
	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);

	const [orderby, order] = sortValue.split(':');

	const fetchBank = () => {
		dispatch(
			fetchQuestionBank({
				search,
				question_type: questionType,
				question_level: questionLevel,
				orderby,
				order,
				page,
				per_page: perPage,
			})
		);
	};

	useEffect(() => {
		fetchBank();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, questionType, questionLevel, sortValue, page, perPage]);

	// Filters reset to page 1 so results aren't hidden on a stale page.
	const onSearch = (value) => {
		setPage(1);
		setSearch(value);
	};

	const openCreate = () => {
		const sp = new URLSearchParams(searchParams);
		sp.set('question_form', 'new');
		sp.delete('item_id');
		navigate(`?${sp.toString()}`);
	};

	const openEdit = (row) => {
		const sp = new URLSearchParams(searchParams);
		sp.set('question_form', 'edit');
		sp.set('item_id', String(row.question_id));
		navigate(`?${sp.toString()}`);
	};

	const goToList = () => {
		const sp = new URLSearchParams(searchParams);
		sp.delete('question_form');
		sp.delete('item_id');
		navigate(`?${sp.toString()}`);
	};

	// After a save, refresh the list data then return to it.
	const onSaved = () => {
		fetchBank();
		goToList();
	};

	const deleteRow = (row) => {
		// eslint-disable-next-line no-alert
		const confirmed = window.confirm(
			__(
				'Delete this question permanently? It will be removed from every quiz that uses it.',
				'academy'
			)
		);
		if (!confirmed) {
			return;
		}
		setDeletingId(row.question_id);
		API.post(
			`${namespace}quiz_questions/${parseInt(row.question_id)}`,
			{},
			{ headers: { 'X-HTTP-Method-Override': 'DELETE' } }
		)
			.then(() => {
				dispatch(
					showNotification({
						message: __('Question Deleted', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
				fetchBank();
			})
			.finally(() => setDeletingId(false));
	};

	const snackbarOptions = [
		{
			suffix: 'delete',
			label: __('Delete Permanently', 'academy'),
			onClick: () =>
				setSnackbarOption({
					value: 'delete',
					message: __(
						'Delete these questions permanently? They will be removed from every quiz that uses them.',
						'academy'
					),
				}),
		},
	];

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = () => {
		Promise.all(
			selectedItems.map((item) =>
				API.post(
					`${namespace}quiz_questions/${parseInt(item.question_id)}`,
					{},
					{ headers: { 'X-HTTP-Method-Override': 'DELETE' } }
				)
			)
		).then(() => {
			dispatch(
				showNotification({
					message: __('Questions Deleted', 'academy'),
					isShow: true,
					type: 'success',
				})
			);
			fetchBank();
		});
		handleReset();
	};

	React.useMemo(() => {
		if (confirm) {
			snackbarActionHandler();
		} else {
			handleReset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [confirm]);

	const handleExport = async () => {
		setExporting(true);
		try {
			const res = await API.get(`${namespace}quiz_questions/export`);
			if (res.status === 200 && res.data?.length) {
				triggerDownload(
					buildCSV(res.data),
					`academy-questions-${new Date()
						.toISOString()
						.slice(0, 10)}.csv`
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
		} catch (e) {
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
		if (!file) {
			return;
		}
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
							/* translators: 1: imported count, 2: error count. */
							__(
								'Imported %1$d question(s). %2$d error(s).',
								'academy'
							),
							result.imported,
							result.errors.length
						)
					: sprintf(
							/* translators: %d: imported count. */
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

	const openUsage = (row) => {
		setUsageData({ title: row.question_title, quizzes: [] });
		setUsageOpen(true);
		setUsageLoading(true);
		API.get(
			`${namespace}quiz_questions/${parseInt(row.question_id)}/quizzes`
		)
			.then((res) => {
				setUsageData({
					title: row.question_title,
					quizzes: res?.data || [],
				});
			})
			.finally(() => setUsageLoading(false));
	};

	const renderUsageBody = () => {
		if (usageLoading) {
			return (
				<div className="h-[120px]">
					<Preloader />
				</div>
			);
		}
		if (!usageData.quizzes.length) {
			return (
				<p className="text-academy-sub-title">
					{__(
						'This question is not used in any quiz yet.',
						'academy'
					)}
				</p>
			);
		}
		return (
			<ul className="flex flex-col gap-2">
				{usageData.quizzes.map((quiz) => (
					<li
						key={quiz.id}
						className="rounded-md border border-academy-border px-4 py-3"
					>
						{quiz.title ||
							sprintf(
								/* translators: %d: quiz id. */
								__('Quiz #%d', 'academy'),
								quiz.id
							)}
					</li>
				))}
			</ul>
		);
	};

	const columns = [
		{
			name: __('Question', 'academy'),
			cell: (row) => (
				<button
					type="button"
					className="academy-questions-manager__title"
					onClick={() => openEdit(row)}
				>
					<MathJaxLateX
						text={
							row.question_title ||
							__('Untitled Question', 'academy')
						}
					/>
				</button>
			),
		},
		{
			name: __('Type', 'academy'),
			cell: (row) => <span>{typeLabel(row.question_type)}</span>,
		},
		{
			name: __('Level', 'academy'),
			cell: (row) => (
				<span>
					{row.question_level ? levelLabel(row.question_level) : '—'}
				</span>
			),
		},
		{
			name: __('Points', 'academy'),
			cell: (row) => <span>{row.question_score}</span>,
		},
		{
			name: __('Used in', 'academy'),
			cell: (row) => {
				const count = parseInt(row.used_in_count || 0, 10);
				if (!count) {
					return (
						<span className="academy-questions-manager__usage academy-questions-manager__usage--none">
							{__('Unused', 'academy')}
						</span>
					);
				}
				return (
					<button
						type="button"
						className="academy-questions-manager__usage"
						onClick={() => openUsage(row)}
					>
						{sprintf(
							/* translators: %d: number of quizzes. */
							_n('%d quiz', '%d quizzes', count, 'academy'),
							count
						)}
					</button>
				);
			},
		},
		{
			name: __('Actions', 'academy'),
			cell: (row) => (
				<OptionMenu
					icon="three-dots-menu"
					suffix="question"
					options={[
						{
							type: 'button',
							label: __('Edit', 'academy'),
							icon: (
								<span className="academy-icon academy-icon--edit-two" />
							),
							onClick: () => openEdit(row),
							hasBorder: true,
						},
						{
							type: 'button',
							label: __('Delete', 'academy'),
							suffix: 'trash',
							icon: (
								<span className="academy-icon academy-icon--trash-delete" />
							),
							isLoading: deletingId === row.question_id,
							onClick: () => deleteRow(row),
						},
					]}
				/>
			),
		},
	];

	const subHeaderComponent = (
		<div className="academy-qm-toolbar">
			<div className="academy-qm-toolbar__left">
				<Button
					preset="border-purple"
					borderRadius="rounded"
					size="sm"
					label={__('Import', 'academy')}
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
					isLoading={exporting}
					loadingLabel={__('Exporting…', 'academy')}
					onClick={handleExport}
					suffix="header-btns"
				/>
			</div>
			<div className="academy-qm-toolbar__right">
				<Search
					placeholder={__('Search questions…', 'academy')}
					defaultValue={search}
					onSearchHandler={onSearch}
				/>
				<Select
					className="academy-select"
					suffix="qm-type-filter"
					placeholder={__('All Types', 'academy')}
					isClearable={true}
					isSearchable={false}
					options={questionTypeOption}
					value={
						questionTypeOption.find(
							(opt) => opt.value === questionType
						) ?? ''
					}
					onChangeHandler={(val) => {
						setPage(1);
						setQuestionType(val ?? '');
					}}
				/>
				<Select
					className="academy-select"
					suffix="qm-level-filter"
					placeholder={__('All Levels', 'academy')}
					isClearable={true}
					isSearchable={false}
					options={questionLevelOption}
					value={
						questionLevelOption.find(
							(opt) => opt.value === questionLevel
						) ?? ''
					}
					onChangeHandler={(val) => {
						setPage(1);
						setQuestionLevel(val ?? '');
					}}
				/>
				<Select
					className="academy-select"
					suffix="qm-sort"
					isSearchable={false}
					options={ORDER_OPTIONS}
					value={ORDER_OPTIONS.find((opt) => opt.value === sortValue)}
					onChangeHandler={(val) => {
						setPage(1);
						setSortValue(val);
					}}
				/>
			</div>
		</div>
	);

	if (isEditorRoute) {
		return (
			<QuestionEditor
				questionId={questionForm === 'edit' ? editingId : null}
				onBack={goToList}
				onSaved={onSaved}
			/>
		);
	}

	return (
		<>
			<TopBar
				render={() => (
					<h3 className="academy-topbar-heading">
						<span className="academy-icon academy-icon--angle-right" />
						{__('Questions', 'academy')}
					</h3>
				)}
				centerContent={() => <QuizTabs value="questions" />}
			/>
			{/* The page's main action sits on its title row. */}
			<SubTopBar heading={__('Questions', 'academy')}>
				<Button
					type="button"
					label={__('Add Question', 'academy')}
					onClick={openCreate}
					suffix="add-question"
				/>
			</SubTopBar>

			<div className="academy-page-content academy-questions-manager">
				<ListTable
					columns={columns}
					data={bank.data}
					showSubHeader={true}
					subHeaderComponent={subHeaderComponent}
					showColumnFilter={false}
					isRowSelectable={true}
					getSelectRowValue={(selectedRow) => {
						setSelectedItems(selectedRow);
						setResetSelectedItems(false);
					}}
					resetSelected={resetSelectedItems}
					showPagination={true}
					onChangePage={setPage}
					onChangeItemsPerPage={(pp) => {
						setPerPage(pp);
						setPage(1);
					}}
					totalItems={bank.total}
					dataFetchingStatus={bank.loading}
					currentPageNumber={page}
					rowsPerPage={perPage}
					suffix="questions-manager"
					noDataText={
						search
							? __('No matching questions found.', 'academy')
							: __(
									'No questions yet. Add one to build your question bank.',
									'academy'
								)
					}
				/>
			</div>

			{selectedItems.length > 0 && (
				<SnackbarAction
					actionButtons={snackbarOptions}
					itemsLength={selectedItems?.length}
					confirmHandler={setConfirm}
					isActionSelected={snackbarOption}
					resetHandler={handleReset}
				/>
			)}

			{/* Used-in quizzes */}
			<ReactModal
				isOpen={usageOpen}
				onRequestClose={() => setUsageOpen(false)}
				title={__('Used in quizzes', 'academy')}
				subtitle={usageData.title}
				suffix="question-usage"
				size="small"
				isEnabledHeader={true}
			>
				<div className="academy-questions-manager__usage-list p-4">
					{renderUsageBody()}
				</div>
			</ReactModal>
		</>
	);
}
