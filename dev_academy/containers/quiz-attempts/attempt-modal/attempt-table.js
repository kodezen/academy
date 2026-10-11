import React from 'react';
import ListTable from '@Components/ListTable';
import { __ } from '@wordpress/i18n';
import { getTranslatedStatus, getAddonActiveStatus } from '@Utils/helper';
import { useSelector } from 'react-redux';

const AttemptTable = ({ data }) => {
	const allAddons = useSelector((state) => state.addons);

	const finalGrade = getAddonActiveStatus(allAddons, 'grade_book', true)
		? [
			{
				name: __('Final Grade', 'academy'),
				sortable: true,
				cell: (row) => (
					<div className="academy-table-title-wrap">
						<div className="academy-table-title">
							<div
								className="academy-grade-color"
								style={{
									background:
										row?.grade_details?.grade_config
											?.grade_color,
									width: '12px',
									height: '12px',
									borderRadius: '50%',
									display: 'inline-block',
									flexShrink: 0,
								}}
							></div>
							<span>
								{row?.grade_details?.grade_name} (
								{row.grade_details?.user_grade_point})
							</span>
						</div>
					</div>
				),
			},
		]
		: [];

	const columns = [
		{
			name: __('Date', 'academy'),
			sortable: true,
			cell: (row) => <span>{row.attempt_started_at.split(' ')[0]}</span>,
		},
		{
			name: __('Questions', 'academy'),
			sortable: true,
			cell: (row) => (
				<p>
					<span>
						<strong>{__('Total:', 'academy')}</strong>{' '}
						{row?.total_questions}
					</span>
					<br />
					<span>
						<strong>{__('Answered:', 'academy')}</strong>{' '}
						{row.total_answered_questions}
					</span>
				</p>
			),
		},
		{
			name: __('Marks', 'academy'),
			sortable: true,
			cell: (row) => (
				<p>
					<span>
						<strong>{__('Total:', 'academy')}</strong>{' '}
						{row.total_marks}
					</span>
					<br />
					<span>
						<strong>{__('Earned:', 'academy')}</strong>{' '}
						{row.earned_marks}
					</span>
				</p>
			),
		},
		{
			name: __('Answers', 'academy'),
			sortable: true,
			cell: (row) => {
				const parsedInfo =
					row?.attempt_info !== '' &&
						typeof row?.attempt_info !== 'object'
						? JSON.parse(row?.attempt_info)
						: row?.attempt_info;

				const correct = parsedInfo?.total_correct_answers;
				const inCorrect =
					row?.total_answered_questions -
					parsedInfo?.total_correct_answers;

				return (
					<p>
						<span>
							<strong>{__('Correct:', 'academy')}</strong>{' '}
							{correct}
						</span>
						<br />
						<span>
							<strong>{__('Incorrect:', 'academy')}</strong>{' '}
							{inCorrect}
						</span>
					</p>
				);
			},
		},
		{
			name: __('Result', 'academy'),
			sortable: true,
			cell: (row) => (
				<div className="academy-quiz">
					<span className={`academy-${row?.attempt_status}`}>
						{getTranslatedStatus(row?.attempt_status)}
					</span>
				</div>
			),
		},
		...finalGrade,
	];

	return (
		<ListTable
			columns={columns}
			noDataText={__(
				'Nothing to show yet.',
				'academy'
			)}
			data={data ? data : []}
			showSubHeader={false}
			suffix="quizzes-attempt"
		/>
	);
};

export default AttemptTable;
