import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { CheckboxControl } from '@wordpress/components';
import Search from '@Components/Search';
import Select from '@Components/AcademySelect';
import Pagination from '@Components/Pagination';
import Preloader from '@Components/Loader/Preloader';
import CustomTableMessage from '@Components/Oops/CustomTableMessage';
import { fetchQuestionBank } from '@Redux/Slices/quizQuestionSlice/quizQuestionSlice';
import MathJaxLateX from '@Components/MathJaxLateX';
import { sliceString } from '@Utils/helper';
import { questionTypeOption, questionLevelOption } from '../helper';
import './QuestionReuse.scss';

// Map a stored question_type value to its human label (falls back to the raw
// value for any type not in the list).
const typeLabel = (type) =>
	questionTypeOption.find((opt) => opt.value === type)?.label ?? type;

// Same lookup for question_level (mirrors typeLabel above).
const levelLabel = (level) =>
	questionLevelOption.find((opt) => opt.value === level)?.label ?? level;

// A long title wraps past its row, so the list shows a shortened one. A cut
// that lands inside a $$…$$ formula would leave it half open, so the
// formula is dropped from the shortened title instead.
const TITLE_LENGTH = 60;
const shortTitle = (title) => {
	const short = sliceString(title, TITLE_LENGTH, '');
	if (short === title) {
		return title;
	}
	const open = (short.match(/\$\$/g) || []).length % 2;
	return (open ? short.slice(0, short.lastIndexOf('$$')).trim() : short) + '...';
};

/*
 * Inline "Reuse Content" picker for quiz questions — mirrors the course
 * builder's reuse dropdown (search + checkbox list + pagination), no modal.
 * Toggling a checkbox adds/removes that question from the quiz immediately.
 */
const PER_PAGE = 10;

const QuestionReuse = ({ existingIds = [], onAdd, onRemove }) => {
	const dispatch = useDispatch();
	const bank = useSelector((state) => state.quizQuestions.bank);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [showPagination, setShowPagination] = useState(true);
	const [search, setSearch] = useState('');
	const [questionLevel, setQuestionLevel] = useState('');

	const load = (opts = {}) => {
		setLoading(true);
		return dispatch(
			fetchQuestionBank({ page: 1, per_page: PER_PAGE, ...opts })
		).finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const searchHandler = (value) => {
		// Pagination is meaningless while a search narrows the list.
		setShowPagination(value === '');
		setPage(1);
		setSearch(value);
		load({ search: value, question_level: questionLevel, page: 1 });
	};

	const levelHandler = (value) => {
		setPage(1);
		setQuestionLevel(value ?? '');
		load({ search, question_level: value ?? '', page: 1 });
	};

	const paginationFetchHandler = (nextPage) => {
		setPage(nextPage);
		load({ search, question_level: questionLevel, page: nextPage });
	};

	return (
		<div className="academy-reuse-questions">
			<div className="academy-reuse-questions__filters">
				<div className="academy-topics-search">
					<Search
						placeholder={__('Search questions…', 'academy')}
						onSearchHandler={searchHandler}
					/>
				</div>
				<Select
					className="academy-select academy-reuse-questions__level-filter"
					suffix="reuse-level-filter"
					placeholder={__('All Levels', 'academy')}
					isClearable={true}
					isSearchable={false}
					options={questionLevelOption}
					value={
						questionLevelOption.find(
							(opt) => opt.value === questionLevel
						) ?? ''
					}
					onChangeHandler={levelHandler}
				/>
			</div>
			{loading || !bank.data ? (
				<div className="academy-info">
					<Preloader size="md" />
				</div>
			) : (
				<div className="academy-items">
					{bank.data.length > 0 ? (
						bank.data.map((item) => {
							const isChecked = existingIds.includes(
								parseInt(item.question_id)
							);
							return (
								<div
									className="academy-item"
									key={item.question_id}
								>
									<CheckboxControl
										label={
											item.question_title ? (
												<span title={item.question_title}>
													<MathJaxLateX
														text={shortTitle(
															item.question_title
														)}
													/>
												</span>
											) : (
												__('Untitled Question', 'academy')
											)
										}
										checked={isChecked}
										onChange={() =>
											isChecked
												? onRemove(item.question_id)
												: onAdd({
														id: item.question_id,
														title: item.question_title,
													})
										}
									/>
									<span className="academy-reuse-questions__meta">
										{item.question_type && (
											<span className="academy-reuse-questions__type">
												{typeLabel(item.question_type)}
											</span>
										)}
										{item.question_level && (
											<span className="academy-reuse-questions__level">
												{levelLabel(
													item.question_level
												)}
											</span>
										)}
									</span>
								</div>
							);
						})
					) : (
						<div className="academy-info">
							<CustomTableMessage
								title={__('No questions found!', 'academy')}
							/>
						</div>
					)}
				</div>
			)}
			{showPagination && bank.total > PER_PAGE && (
				<Pagination
					currentPageNumber={page}
					fetchHandler={paginationFetchHandler}
					totalItems={bank.total}
					rowsPerPage={PER_PAGE}
					suffix="!m-0 !mt-4"
				/>
			)}
		</div>
	);
};

export default QuestionReuse;
