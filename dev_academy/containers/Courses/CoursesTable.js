import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import {
	admin_url,
	getAddonActiveStatus,
	route_path,
	sliceString,
	is_admin,
	makeRequest,
	is_pro,
	can_manage_addons,
	capitalizeFirstLetter,
	hideHtmlTags,
	can,
	permissionDeniedMessage,
} from '@Utils/helper';
import { useDispatch, useSelector } from 'react-redux';
import { upgradeProModal } from '@Redux/Slices/upgradeToProSlice/upgradeToProSlice';
import Button from '@Components/Button';

import SnackbarAction from '@Components/BulkAction/SnackbarAction';
import ListTable from '@Components/ListTable';
import Search from '@Components/Search';
import { __, _n } from '@wordpress/i18n';
import StatusOptions from '@Components/StatusOptions';
import {
	deleteCourse,
	fetchAllCourse,
	updateCourseCurrentPage,
	updateCourseItemPerPage,
	moveCourseToTrash,
	restoreCourse,
	courseStatusUpdate,
} from '@Redux/Slices/courseSlice/courseSlice';
import moment from 'moment';
import OptionMenu from '@Components/OptionMenu';
import Tooltip from '@Components/Tooltip';
import { fetchAllCategories } from '@Redux/Slices/categorySlice/categorySlice';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import EmptyCourses from './EmptyCourses';

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
		label: __('Private', 'academy'),
		value: 'private',
	},
	{
		label: __('Schedule', 'academy'),
		value: 'future',
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

const CoursesTable = ({ redirectUrl, openModalHandler }) => {
	const allAddons = useSelector((state) => state.addons);
	const courses = useSelector((state) => state.courses);
	const categories = useSelector((state) => state.categories);

	const [dataFetchingStatus, setDataFetchingStatus] = useState(
		!courses.data || !categories?.data ? true : false
	);
	const [onSearchLoder, setOnSearchLoder] = useState(false);

	const [selectedItems, setSelectedItems] = useState([]);
	const [snackbarOption, setSnackbarOption] = useState({});
	const [confirm, setConfirm] = useState(false);
	const [resetSelectedItems, setResetSelectedItems] = useState(false);
	// Every fetch-triggering action below (mount/page/status tab/search) bumps
	// this before dispatching, then only clears its own loading flag if it's
	// still the *latest* one when its request resolves. Clicking through tabs
	// quickly fires several overlapping fetches with no guarantee they
	// resolve in the order they were sent — without this guard, an older
	// request finishing after a newer one flips the loading indicator off
	// (or back on) while the newer request is still the one that matters, so
	// the spinner could disappear mid-load or never settle correctly.
	const requestSeqRef = useRef(0);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const location = useQuery();
	const courseStatus = location.get('status');
	const coursePerPage = location.get('coursePerPage');
	const searchText = location.get('search');

	const [status, setStatus] = useState(courseStatus ? courseStatus : 'all');

	// Mirrors the exact slugs RestGuard/AjaxGuard enforce server-side (see
	// Permissions::write_route_map()) so a button is disabled if and only if
	// the matching request would actually be rejected.
	const canUpdateCourse = can('academy.courses.update');
	const canCreateCourse = can('academy.courses.create');
	const canDeleteCourse = can('academy.courses.delete');
	// "Live Now" indicator — courses with a currently-running meeting (Pro
	// Notifications addon). Fetched once; the row set itself is already
	// scoped to "courses this viewer can see" by the REST query above, so no
	// further scoping is needed here — see academy-pro's Meeting\Ajax class.
	const [liveCourseIds, setLiveCourseIds] = useState([]);
	useEffect(() => {
		if (!getAddonActiveStatus(allAddons, 'notifications', true)) {
			return;
		}
		makeRequest({
			action: 'academy_pro_notifications_meeting/get_live_course_ids',
		})
			.then((res) => {
				if (res.data.success) {
					setLiveCourseIds(res.data.data || []);
				}
			})
			.catch(() => {});
	}, []);

	// "Try a different search" only makes sense once someone has searched.
	let noDataText = __(
		'No matching results found. Please try a different search.',
		'academy'
	);
	if (!searchText) {
		noDataText =
			status && status !== 'all'
				? __('No courses with this status yet.', 'academy')
				: __('Your courses will show here.', 'academy');
	}

	const handleNavigate = (tableStatus = '', text = '', options = {}) => {
		let url = is_admin
			? `${route_path}admin.php?page=academy-courses`
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

		navigate(url, options);
	};

	const publishAction =
		status !== 'trash'
			? [
					{
						suffix: 'trash',
						label: __('Trash', 'academy'),
						isDisabled: !can('academy.courses.delete'),
						title: !can('academy.courses.delete')
							? permissionDeniedMessage('academy.courses.delete')
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
						isDisabled: !can('academy.courses.update'),
						title: !can('academy.courses.update')
							? permissionDeniedMessage('academy.courses.update')
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
						isDisabled: !can('academy.courses.delete'),
						title: !can('academy.courses.delete')
							? permissionDeniedMessage('academy.courses.delete')
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

	const handleReset = () => {
		setSelectedItems([]);
		setSnackbarOption({});
		setResetSelectedItems(true);
		setConfirm(false);
	};

	const snackbarActionHandler = (option) => {
		if (status !== 'trash' && option === 'trash') {
			selectedItems.forEach((item) => {
				dispatch(
					moveCourseToTrash({
						ID: item.id ? item.id : item.ID,
					})
				);
			});
			handleReset();
		} else if (option === 'restore') {
			selectedItems.forEach((item) => {
				dispatch(restoreCourse(item));
			});
			handleReset();
		} else {
			selectedItems.forEach((item) => {
				dispatch(
					deleteCourse({
						ID: item.id ? item.id : item.ID,
					})
				);
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
		handleNavigate(courseStatus, searchText, { replace: true });
	}, [courseStatus, searchText]);

	useEffect(() => {
		if (!categories.data) {
			dispatch(fetchAllCategories());
		}

		if (!courses.data || (courses.data && courses.data.length <= 1)) {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			if (coursePerPage !== null) {
				dispatch(updateCourseItemPerPage(coursePerPage));
			}
			// This dispatch is intentionally not awaited: the previous
			// version wrapped this whole effect in a try/finally, and the
			// `finally` ran as soon as this promise was *issued* (nothing
			// here ever awaited it), clearing the loading flag almost
			// instantly instead of once the fetch actually resolved — the
			// table briefly showed empty with no visible loading indicator
			// at all. This `.then()` is the only thing that should clear it.
			dispatch(fetchAllCourse({ status })).then(() => {
				if (seq === requestSeqRef.current) {
					setDataFetchingStatus(false);
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleTableDataFetch = (page = 1, perPage = 10) => {
		const seq = ++requestSeqRef.current;
		setDataFetchingStatus(true);
		dispatch(fetchAllCourse({ status, page, per_page: perPage })).then(
			() => {
				if (seq === requestSeqRef.current) {
					setDataFetchingStatus(false);
				}
			}
		);
	};

	const handlePageChange = (page = 1, perPage = 10) => {
		dispatch(updateCourseCurrentPage(page));
		handleTableDataFetch(page, perPage);
	};

	const handleItemsPage = (itemsPerPage = 10, page = 1) => {
		dispatch(updateCourseItemPerPage(itemsPerPage));
		handleTableDataFetch(page, itemsPerPage);
		handleNavigate(courseStatus);
	};

	const restoreHandler = (item) => {
		// eslint-disable-next-line
		dispatch(restoreCourse(item));
	};

	const deleteHandler = (item) => {
		// eslint-disable-next-line
		if (item.status !== 'trash') {
			dispatch(
				moveCourseToTrash({
					ID: item.id ? item.id : item.ID,
				})
			);
		} else if (
			// eslint-disable-next-line
			window.confirm(__('Are you sure you want to permanently delete this item?', 'academy'))) {
			dispatch(
				deleteCourse({
					ID: item.id ? item.id : item.ID,
				})
			);
		}
	};

	const duplicateHandler = (item, duplicateCurriculum = false) => {
		makeRequest({
			action: 'academy_pro/duplicate_course',
			course_id: item?.id,
			name: duplicateCurriculum ? 'academy-curriculum' : '',
		}).then((res) => {
			if (res.data.success) {
				const seq = ++requestSeqRef.current;
				setDataFetchingStatus(true);
				dispatch(fetchAllCourse({ status })).then(() => {
					if (seq === requestSeqRef.current) {
						setDataFetchingStatus(false);
					}
				});
			}
			// `setDataFetchingStatus(true)` used to run unconditionally right
			// here, before checking `res.data.success` — on a failed
			// duplicate, nothing ever set it back to `false`, leaving the
			// table stuck showing its loading state indefinitely.
			dispatch(
				showNotification({
					message: res.data.data,
					isShow: true,
					type: res.data.success ? 'success' : 'error',
				})
			);
		});
	};

	const lessonCount = (curriculum) => {
		const totalTopics = curriculum?.reduce((acc, item) => {
			acc = [...acc, ...item.topics];
			return acc;
		}, []);

		const filteredItems = totalTopics?.reduce(
			(acc, item) => {
				if (item.type === 'sub-curriculum') {
					acc.subCurriculum = [...acc.subCurriculum, item];
				} else if (item.type === 'lesson') {
					acc.lessons = [...acc.lessons, item];
				} else if (item.type === 'quiz') {
					acc.quiz = [...acc.quiz, item];
				} else if (item.type === 'assignment') {
					acc.assignment = [...acc.assignment, item];
				} else if (item.type === 'meeting') {
					acc.meeting = [...acc.meeting, item];
				} else if (item.type === 'booking') {
					acc.booking = [...acc.booking, item];
				}
				return (acc = { ...acc });
			},
			{
				lessons: [],
				quiz: [],
				assignment: [],
				meeting: [],
				booking: [],
				subCurriculum: [],
			}
		);

		return (
			<>
				{filteredItems?.subCurriculum?.length !== 0 && (
					<div className="academy-table-sub-title__item">
						<span className="academy-table-sub-title__item--separator__topic">
							&#x25cf;
						</span>
						<span className="academy-table-sub-title__item--length">
							{filteredItems?.subCurriculum?.length}
						</span>
						<span className="academy-table-sub-title__item--text__topic">
							{__('Sub Curriculum', 'academy')}
						</span>
					</div>
				)}
				{filteredItems?.lessons?.length !== 0 && (
					<div className="academy-table-sub-title__item">
						<span className="academy-table-sub-title__item--separator__topic">
							&#x25cf;
						</span>
						<span className="academy-table-sub-title__item--length">
							{filteredItems?.lessons?.length}
						</span>
						<span className="academy-table-sub-title__item--text__topic">
							{__('Lesson', 'academy')}
						</span>
					</div>
				)}
				{getAddonActiveStatus(allAddons, 'quizzes') &&
					filteredItems?.quiz?.length !== 0 && (
						<div className="academy-table-sub-title__item">
							<span className="academy-table-sub-title__item--separator__topic">
								&#x25cf;
							</span>
							<span className="academy-table-sub-title__item--length">
								{filteredItems?.quiz?.length}
							</span>
							<span className="academy-table-sub-title__item--text__topic">
								{__('Quiz', 'academy')}
							</span>
						</div>
					)}
				{getAddonActiveStatus(allAddons, 'assignments') &&
					filteredItems?.assignment?.length !== 0 && (
						<div className="academy-table-sub-title__item">
							<span className="academy-table-sub-title__item--separator__topic">
								&#x25cf;
							</span>
							<span className="academy-table-sub-title__item--length">
								{filteredItems?.assignment?.length}
							</span>
							<span className="academy-table-sub-title__item--text__topic">
								{__('Assignment', 'academy')}
							</span>
						</div>
					)}
				{getAddonActiveStatus(allAddons, 'meeting', true) &&
					filteredItems?.meeting?.length !== 0 && (
						<div className="academy-table-sub-title__item">
							<span className="academy-table-sub-title__item--separator__topic">
								&#x25cf;
							</span>
							<span className="academy-table-sub-title__item--length">
								{filteredItems?.meeting?.length}
							</span>
							<span className="academy-table-sub-title__item--text__topic">
								{__('Meeting', 'academy')}
							</span>
						</div>
					)}
				{getAddonActiveStatus(allAddons, 'tutor-booking') &&
					filteredItems?.booking?.length !== 0 && (
						<div className="academy-table-sub-title__item">
							<span className="academy-table-sub-title__item--separator__topic">
								&#x25cf;
							</span>
							<span className="academy-table-sub-title__item--length">
								{filteredItems?.booking?.length}
							</span>
							<span className="academy-table-sub-title__item--text__topic">
								{__('Booking', 'academy')}
							</span>
						</div>
					)}
			</>
		);
	};

	const categoryColumn = is_admin
		? [
				{
					name: __('Categories', 'academy'),
					cell: (row) => {
						if (!categories?.data) {
							return '...';
						}
						const courseCategories = categories?.data.filter(
							(item) =>
								row.academy_courses_category.includes(item.id)
						);
						return (
							<span className="academy-list-wrap__term-lists">
								{courseCategories.length
									? courseCategories.map((item, index) => (
											<span key={index}>
												<a
													href={item.link}
													target="_blank"
													rel="noreferrer"
													className="academy-category-items"
												>
													{sliceString(
														item.name,
														15,
														''
													)}
												</a>
												{courseCategories.length - 1 >
												index
													? ', '
													: ''}
											</span>
										))
									: '...'}
							</span>
						);
					},
				},
			]
		: [];

	const columns = [
		{
			name: __('Title', 'academy'),
			cell: (row) => {
				const fullTitle = hideHtmlTags(
					row.title.raw ?? row.title?.rendered
				);
				const isTitleTruncated = (fullTitle?.length ?? 0) > 25;

				return (
					<div className="academy-table-title-wrap">
						<div className="academy-table-title">
							{liveCourseIds.includes(row.id) && (
								<span
									style={{
										background: '#e53935',
										color: '#fff',
										fontSize: '10px',
										fontWeight: 600,
										lineHeight: 1,
										padding: '3px 6px',
										borderRadius: '3px',
										textTransform: 'uppercase',
										marginRight: '6px',
										display: 'inline-block',
									}}
								>
									{__('Live', 'academy')}
								</span>
							)}
							{is_admin ? (
								<Link
									to={`${route_path}admin.php?page=academy-courses&id=${row.id}&action=edit`}
								>
									<span
										className={`academy-table-title${
											isTitleTruncated
												? ' academy-tooltip'
												: ''
										}`}
										data-tooltip={
											isTitleTruncated
												? sliceString(fullTitle, 80)
												: undefined
										}
										dangerouslySetInnerHTML={{
											__html: sliceString(
												row.title.raw ??
													row.title?.rendered
											),
										}}
									></span>
								</Link>
							) : (
								<div
									role="presentation"
									className="academy-table-title"
									dangerouslySetInnerHTML={{
										__html: sliceString(
											row?.title?.rendered
										),
									}}
									onClick={() => {
										openModalHandler(row.id);
									}}
								></div>
							)}
							<a href={row.link} target="_blank" rel="noreferrer">
								<span className="academy-icon academy-icon--go-on" />
							</a>
						</div>
						<div className="academy-table-sub-title">
							<div className="academy-table-sub-title__item">
								<span className="academy-table-sub-title__item--label">
									{__('ID', 'academy')}
								</span>
								{row.id}
							</div>
							{row.meta?.academy_course_curriculum?.length !==
								0 && (
								<div className="academy-table-sub-title__item">
									<span className="academy-table-sub-title__item--separator">
										&#x25cf;
									</span>
									{
										row.meta?.academy_course_curriculum
											?.length
									}
									<span className="academy-table-sub-title__item--text">
										{_n(
											'Topic',
											'Topics',
											row.meta?.academy_course_curriculum
												?.length || 0,
											'academy'
										)}
									</span>
								</div>
							)}
							{row.meta?.academy_course_curriculum?.length >
								0 && (
								<Tooltip>
									{lessonCount(
										row.meta?.academy_course_curriculum
									)}
								</Tooltip>
							)}
						</div>
					</div>
				);
			},
		},
		...categoryColumn,
		{
			name: __('Price', 'academy'),
			cell: (row) => (
				<p
					className={`academy-table-course-${row.meta?.academy_course_type}`}
				>
					{row.academy_course_price ? (
						<span>
							{row.academy_course_price.split('|').join(', ')}
						</span>
					) : (
						<span>
							{capitalizeFirstLetter(
								row.meta?.academy_course_type
							)}
						</span>
					)}
				</p>
			),
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
			name: __('Author', 'academy'),
			cell: (row) => <span>{row.author_name}</span>,
		},
		{
			name: __('Status', 'academy'),
			cell: (row) => {
				const courseStatusHandler = (itemStatus) => {
					// eslint-disable-next-line
					const data = { id: row.id ? row.id : row.ID, status: itemStatus }
					if (itemStatus === 'trash') {
						dispatch(
							moveCourseToTrash({
								ID: row.id ? row.id : row.ID,
							})
						);
					} else {
						dispatch(courseStatusUpdate(data));
					}
				};

				const scheduleStatus = [
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

				const restStatus =
					row.status !== 'future'
						? [
								{
									label: __('Published', 'academy'),
									value: 'publish',
								},
								{
									label: __('Private', 'academy'),
									value: 'private',
								},
							]
						: [];
				return (
					<StatusOptions
						value={row?.status}
						options={{
							items: [...restStatus, ...scheduleStatus],
						}}
						onChangeHandler={courseStatusHandler}
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
								// Upgrade prompt: only an admin can buy Pro.
								...(is_pro || can_manage_addons
									? [
										{
											type: 'button',
											label: (
												<span>
													{__('Duplicate', 'academy')}
													{!is_pro && (
														<span className="academy-pro-badge">
															{__('PRO', 'academy')}
														</span>
													)}
												</span>
											),
											icon: (
												<span className="academy-icon academy-icon--copy-two" />
											),
											isDisabled: !canCreateCourse,
											title: !canCreateCourse
												? permissionDeniedMessage(
														'academy.courses.create'
													)
												: undefined,
											onClick: () =>
												is_pro
													? duplicateHandler(row)
													: dispatch(upgradeProModal(true)),
										}
										]
									: []),
								// Upgrade prompt: only an admin can buy Pro.
								...(is_pro || can_manage_addons
									? [
										{
											type: 'button',
											hasBorder: true,
											label: (
												<span>
													{__(
														'Duplicate with Curriculum',
														'academy'
													)}
													{!is_pro && (
														<span className="academy-pro-badge">
															{__('PRO', 'academy')}
														</span>
													)}
												</span>
											),
											icon: (
												<span className="academy-icon academy-icon--duplicate-content" />
											),
											isDisabled: !canCreateCourse,
											title: !canCreateCourse
												? permissionDeniedMessage(
														'academy.courses.create'
													)
												: undefined,
											onClick: () =>
												is_pro
													? duplicateHandler(row, true)
													: dispatch(upgradeProModal(true)),
										}
										]
									: []),
								{
									type: 'button',
									suffix: 'trash',
									label: __('Trash', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteCourse,
									title: !canDeleteCourse
										? permissionDeniedMessage(
												'academy.courses.delete'
											)
										: undefined,
									onClick: () =>
										dispatch(
											moveCourseToTrash({ ID: row.id })
										),
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
									isDisabled: !canUpdateCourse,
									title: !canUpdateCourse
										? permissionDeniedMessage(
												'academy.courses.update'
											)
										: undefined,
									onClick: () => restoreHandler(row),
								},
								{
									type: 'button',
									suffix: 'trash',
									label: __('Delete', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--trash-delete" />
									),
									isDisabled: !canDeleteCourse,
									title: !canDeleteCourse
										? permissionDeniedMessage(
												'academy.courses.delete'
											)
										: undefined,
									onClick: () => deleteHandler(row),
								},
							]
						: [];
				return (
					<div className="academy-flex-2 academy-table-action ">
						<Button
							icon={
								<span className="academy-icon academy-icon--wp-editor" />
							}
							onClick={() => {
								window.open(
									`${admin_url}post.php?post=${row.id}&action=edit`
								);
							}}
							preset="transparent"
							border="gray"
							suffix="academy-wordpress-button"
							isDisabled={!canUpdateCourse}
							title={
								!canUpdateCourse
									? permissionDeniedMessage(
											'academy.courses.update'
										)
									: undefined
							}
						/>
						<OptionMenu
							options={[
								{
									type: 'button',
									label: __('Edit', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--edit-two" />
									),
									isDisabled: !canUpdateCourse,
									title: !canUpdateCourse
										? permissionDeniedMessage(
												'academy.courses.update'
											)
										: undefined,
									onClick: () => {
										if (is_admin) {
											navigate(
												`${route_path}admin.php?page=academy-courses&id=${row.id}&action=edit`
											);
										} else {
											openModalHandler(row.id);
										}
									},
								},
								{
									type: 'link',
									hasBorder: true,
									label: __('View', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--eye"></span>
									),
									link: row.link,
									target: '_blank',
								},
								{
									type: 'link',
									label: __('WordPress Editor', 'academy'),
									icon: (
										<span className="academy-icon academy-icon--wp-editor" />
									),
									link: `${admin_url}post.php?post=${row.id}&action=edit`,
									target: '_self',
									isDisabled: !canUpdateCourse,
									title: !canUpdateCourse
										? permissionDeniedMessage(
												'academy.courses.update'
											)
										: undefined,
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

	const subHeaderComponentMemo = React.useMemo(() => {
		const searchHandler = (value) => {
			const seq = ++requestSeqRef.current;
			setOnSearchLoder(true);
			dispatch(
				fetchAllCourse({ status, page: 1, per_page: 10, search: value })
			).then(() => {
				if (seq === requestSeqRef.current) {
					setOnSearchLoder(false);
				}
				handleNavigate(courseStatus, value);
			});
		};
		const dataFetchHandler = (itemStatus) => {
			const seq = ++requestSeqRef.current;
			setDataFetchingStatus(true);
			handleNavigate(itemStatus);
			// `coursePerPage` comes from the URL, but `handleNavigate` never
			// writes that param there — it's always `null` here, and
			// destructuring defaults only kick in for `undefined`, not
			// `null`, so this was sending a literal `per_page: null` on
			// every tab switch instead of falling back to a real page size.
			// `courses?.itemPerPage` is the same "current page size" every
			// other fetch in this file (`handleTableDataFetch`,
			// `handlePageChange`) already uses.
			dispatch(
				fetchAllCourse({
					status: itemStatus,
					page: 1,
					per_page: courses?.itemPerPage || 10,
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
									// Rows selected on the previous tab
									// aren't this tab's rows — carrying them
									// over just meant whichever new rows
									// land in the same table positions
									// showed up pre-checked.
									setSelectedItems([]);
									setResetSelectedItems(true);
								}}
							>
								{item.label}
							</span>
						))}
					</div>
				</div>
				<div className="academy-table-sub-header-actions-right">
					<Search
						placeholder={__('Search Course', 'academy')}
						onSearchHandler={searchHandler}
						defaultValue={searchText ? searchText : ''}
					/>
					<div className="academy-table-sub-header-actions-right--border" />
				</div>
			</>
		);
	}, [status, searchText]);

	// First-run empty state (admin only): no courses at all, on the "All" tab,
	// with no active search. Anything filtered/searched falls through to the
	// table's own "no matching results" message instead.
	const showEmptyState =
		is_admin &&
		!dataFetchingStatus &&
		!onSearchLoder &&
		!searchText &&
		status === 'all' &&
		courses?.data?.length === 0;

	return (
		<>
			{showEmptyState ? (
				<EmptyCourses />
			) : (
				// Always mounted — see ListTable/index.js's data-normalization
				// comment. Swapping this for a <Preloader/> while
				// dataFetchingStatus is true (ListTable already takes that
				// flag and shows its own internal loader) unmounts it and
				// discards its copyDataArr state; a fetch that was already
				// in flight when that happened then has nowhere to land,
				// leaving the table stuck on its empty state even after the
				// data loaded successfully — this is what made the table
				// have no visible initial loading state and, combined with
				// the mount effect's premature setDataFetchingStatus(false)
				// above, sometimes show no data at all.
				<ListTable
					columns={columns}
					data={courses?.data ? courses?.data : []}
					showSubHeader={true}
					subHeaderComponent={subHeaderComponentMemo}
					isRowSelectable={true}
					showColumnFilter={true}
					noDataText={noDataText}
					getSelectRowValue={(selectedRow) => {
						setSelectedItems(selectedRow);
						setResetSelectedItems(false);
					}}
					showPagination={true}
					onChangePage={handlePageChange}
					onChangeItemsPerPage={handleItemsPage}
					totalItems={courses?.totalItems}
					totalRows={courses?.data ? courses.data.length : 0}
					dataFetchingStatus={dataFetchingStatus || onSearchLoder}
					resetSelected={resetSelectedItems}
					rowsPerPage={courses?.itemPerPage}
					currentPageNumber={courses?.currentPage}
					suffix="course"
				/>
			)}
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
export default CoursesTable;
