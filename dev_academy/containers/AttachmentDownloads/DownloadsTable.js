import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import ListTable from '@Components/ListTable';
import Preloader from '@Components/Loader/Preloader';
import { API, namespace } from '@Utils/helper';

/**
 * Grouped download list (student, file, count, last downloaded) for one
 * object type, scoped to one course. Rendered inside the Course Details
 * modal's Lesson Downloads section; academy-pro's assignments addon reuses
 * it for the Assignment Downloads section by passing `type="assignment"`.
 *
 * @param {Object} props
 * @param {string} props.type     'lesson' or 'assignment'.
 * @param {number} props.courseId The course to scope downloads to.
 */
const DownloadsTable = ({ type, courseId }) => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!courseId) {
			return;
		}
		setLoading(true);
		API.get(`${namespace}attachment_downloads`, {
			params: { type, course_id: courseId },
		}).then(
			(res) => {
				setRows(res?.data || []);
				setLoading(false);
			},
			() => setLoading(false)
		);
	}, [type, courseId]);

	const columns = [
		{
			name: __('Student', 'academy'),
			cell: (row) => <span>{row.user_name}</span>,
		},
		{
			name: __('File', 'academy'),
			cell: (row) => <span>{row.attachment_title}</span>,
		},
		{
			name:
				'lesson' === type
					? __('Lesson', 'academy')
					: __('Assignment', 'academy'),
			cell: (row) => <span>{row.object_title}</span>,
		},
		{
			name: __('Downloads', 'academy'),
			cell: (row) => <span>{row.download_count}</span>,
		},
		{
			name: __('Last Downloaded', 'academy'),
			cell: (row) => (
				<span>
					{moment(row.last_downloaded_at).format(
						'MMMM DD, YYYY h:mm A'
					)}
				</span>
			),
		},
	];

	if (loading) {
		return (
			<div className="academy-attachment-downloads__loading h-[150px]">
				<Preloader />
			</div>
		);
	}

	return (
		<ListTable
			columns={columns}
			data={rows}
			isRowSelectable={false}
			showSubHeader={false}
			showColumnFilter={false}
			showPagination={false}
			noDataText={__('No downloads have been recorded yet.', 'academy')}
			suffix="attachment-downloads"
		/>
	);
};

export default DownloadsTable;
