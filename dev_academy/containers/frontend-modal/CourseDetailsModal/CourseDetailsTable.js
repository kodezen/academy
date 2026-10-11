import React, { useEffect, useState } from 'react';
import ListTable from '@Components/ListTable';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { getAddonActiveStatus, makeRequest } from '@Utils/helper';
import moment from 'moment';
import Preloader from '@Components/Loader/Preloader';

const CourseDetailsTable = ({ courseID }) => {
	const [data, setData] = useState([]);
	const [isScormFileAdded, setIsScormFileAdded] = useState(false);
	const [isLoading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		makeRequest({
			action: `academy/get_course_details`,
			courseID,
		}).then((res) => {
			setLoading(false);
			setData(res.data.data.enrolled_info);
			setIsScormFileAdded(res.data.data);
		});
	}, []);

	const addons = useSelector((state) => state.addons);

	const isScormActive = getAddonActiveStatus(addons, 'scorm', true);
	const scromRender = isScormActive
		? [
				{
					name: __('Total Topics', 'academy'),
					sortable: true,
					cell: (row) => (
						<span>{`${
							isScormFileAdded.scorm_total_topics ?? 0
						}`}</span>
					),
				},
				{
					name: __('Completed Topics', 'academy'),
					sortable: true,
					cell: (row) => (
						<span>{`${
							isScormFileAdded.scorm_completed_topics ?? 0
						}`}</span>
					),
				},
			]
		: [];

	const isAssignmentActive = getAddonActiveStatus(addons, 'assignments')
		? [
				{
					name: __('Assignments', 'academy'),
					sortable: true,
					cell: (row) => (
						<span>{`${row.number_of_assignments}/${
							row?.completed_topics?.assignment
								? Object.keys(row?.completed_topics?.assignment)
										.length
								: 0
						}`}</span>
					),
				},
			]
		: [];
	const isQuizzesActive = getAddonActiveStatus(addons, 'quizzes')
		? [
				{
					name: __('Quizzes', 'academy'),
					sortable: true,
					cell: (row) => (
						<span>{`${row.number_of_quizzes}/${
							row?.completed_topics?.quiz
								? Object.keys(row?.completed_topics?.quiz)
										.length
								: 0
						}`}</span>
					),
				},
			]
		: [];
	const isBookingActive = getAddonActiveStatus(addons, 'tutor-booking')
		? [
				{
					name: __('Bookings', 'academy'),
					sortable: true,
					cell: (row) => (
						<span>
							{`${row.number_of_tutor_bookings}/${
								row?.completed_topics?.booking
									? Object.keys(
											row?.completed_topics?.booking
										)?.length
									: 0
							}`}
						</span>
					),
				},
			]
		: [];
	const isZoomActive = getAddonActiveStatus(addons, 'zoom')
		? [
				{
					name: __('Zoom Meetings', 'academy'),
					sortable: true,
					cell: (row) => (
						<span>
							{`${row.number_of_zoom_meetings}/${
								row?.completed_topics?.zoom
									? Object.keys(row?.completed_topics?.zoom)
											?.length
									: 0
							}`}
						</span>
					),
				},
			]
		: [];

	const handleScormRowRender = () => {
		if (isScormActive && isScormFileAdded?.is_scorm_file_added) {
			return [...scromRender];
		}
		const nonScormRender = [
			{
				name: __('Lessons', 'academy'),
				sortable: true,
				cell: (row) => (
					<span>{`${row.number_of_lessons}/${
						row?.completed_topics?.lesson
							? Object.keys(row?.completed_topics?.lesson).length
							: 0
					}`}</span>
				),
			},
			...isQuizzesActive,
			...isAssignmentActive,
			...isBookingActive,
			...isZoomActive,
		];
		return nonScormRender;
	};

	const isCourseCompleted = Boolean(data?.[0]?.is_course_completed);
	const hasFinalGrade = Boolean(data?.[0]?.grade_name);
	const gradebookComment =
		typeof data?.[0]?.gradebook_comment === 'string'
			? data[0].gradebook_comment.trim()
			: '';
	const hasOverallFeedback = isCourseCompleted && gradebookComment.length > 0;

	// Empty for a normal enrollment — filled in server-side (see
	// includes/ajax/course.php get_course_details()) by academy-pro's
	// WooCommerce Subscriptions addon for a subscription-linked course, e.g.
	// "Renews on ..." / "Access ends ...".
	const accessNote = data?.[0]?.access_note;
	const accessNoteColumn = accessNote
		? [
				{
					name: __('Access', 'academy'),
					sortable: true,
					cell: () => <span>{accessNote}</span>,
				},
			]
		: [];

	const finalGradeColumn =
		isCourseCompleted && hasFinalGrade
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
												row?.grade_config
													?.grade_color,
											width: '12px',
											height: '12px',
											borderRadius: '50%',
											display: 'inline-block',
											flexShrink: 0,
										}}
									></div>
									<span>{row.grade_name}</span>
								</div>
							</div>
						),
					},
				]
			: [];

	const columns = [
		{
			name: __('Course', 'academy'),
			sortable: true,
			cell: (row) => (
				<div className="academy-table-title-wrap">
					<div className="academy-table-title">
						<a href={row.course_link}>{row.title}</a>
					</div>
				</div>
			),
		},
		{
			name: __('Enroll Date', 'academy'),
			sortable: true,
			cell: (row) => {
				return <span>{moment(row.date).format('MMMM Do YYYY')}</span>;
			},
		},
		...accessNoteColumn,
		...handleScormRowRender(),
		{
			name: __('Progress', 'academy'),
			sortable: true,
			cell: (row) => <span>{row.progress_percentage}</span>,
		},
		...finalGradeColumn,
	];

	return (
		<>
			{isLoading ? (
				<Preloader />
			) : (
				<>
					<ListTable
						columns={columns}
						data={data ? data : false}
						showSubHeader={false}
						dataFetchingStatus={isLoading}
						suffix="dashboard-course-details"
					/>
					{hasOverallFeedback && (
						<div className="mt-6 w-full rounded-lg border border-academy-border p-6 text-center">
							<h3 className="m-0 mb-2 text-lg font-medium text-academy-text">
								{__('Overall Feedback', 'academy')}
							</h3>
							<p className="m-0 whitespace-pre-wrap break-words text-sm font-normal leading-relaxed text-academy-text">
								{data[0].gradebook_comment}
							</p>
						</div>
					)}
				</>
			)}
		</>
	);
};

export default CourseDetailsTable;
