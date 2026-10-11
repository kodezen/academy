import React, { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@Components/Button';
import { admin_url, route_path, getAddonActiveStatus, toplevel_menu_title } from '@Utils/helper';
import { saveAddon } from '@Redux/Slices/addonSlice/addonSlice';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

/**
 * First-run empty state for the Courses list.
 *
 * Shown in place of the list table when there are zero courses (fresh install,
 * "All" tab, no search). Instead of an empty table it invites the user to
 * create their first course or explore with a demo course.
 *
 * Demo data lives behind the free `seeder` addon (Tools → Dummy Data). If the
 * addon is off we turn it on first, then hard-redirect — the seeder's AJAX
 * handlers only register on a PHP page load where the addon is active, so a
 * client-side navigate straight after activation would hit unregistered
 * endpoints.
 */

const PERKS = [
	{
		icon: 'video',
		title: __('Every lesson type', 'academy'),
		note: __('Text, YouTube, Vimeo, self-hosted, embed & more', 'academy'),
	},
	{
		icon: 'add-quiz',
		title: __('Quiz & questions', 'academy'),
		note: __('A quiz covering every question type', 'academy'),
	},
	{
		icon: 'course-cap',
		title: __('Full curriculum', 'academy'),
		note: __('Modules, lessons and topics ready to explore', 'academy'),
	},
];

const EmptyCourses = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const allAddons = useSelector((state) => state.addons);
	const [isPreparingDemo, setIsPreparingDemo] = useState(false);

	const dummyDataPath = `${route_path}admin.php?page=academy-tools&path=dummy-data`;

	const goToDummyData = () => {
		// Hard reload (not SPA navigate): see the file-level note — the seeder's
		// endpoints register only on a page load where the addon is active.
		window.location.href = `${admin_url}admin.php?page=academy-tools&path=dummy-data`;
	};

	const handleImportDemo = async () => {
		// Already active this page load — its Tools tab and endpoints are live,
		// so a plain SPA navigate is enough.
		if (getAddonActiveStatus(allAddons, 'seeder')) {
			navigate(dummyDataPath);
			return;
		}

		setIsPreparingDemo(true);
		try {
			const { payload: response } = await dispatch(
				saveAddon({
					addon: {
						label: __('Dummy Data Seeder', 'academy'),
						name: 'seeder',
						required_plugin: false,
					},
					status: true,
				})
			);

			if (response?.success && response?.data?.seeder) {
				dispatch(
					showNotification({
						message: __(
							'Demo data tool enabled. Opening the importer…',
							'academy'
						),
						isShow: true,
						type: 'success',
					})
				);
				goToDummyData();
				return;
			}

			setIsPreparingDemo(false);
			dispatch(
				showNotification({
					message: __(
						'Could not activate the demo data tool. Enable “Dummy Data Seeder” from Add-ons and try again.',
						'academy'
					),
					isShow: true,
					type: 'error',
				})
			);
		} catch (e) {
			setIsPreparingDemo(false);
		}
	};

	return (
		<div className="flex justify-center px-6 py-10">
			<div className="w-full max-w-[620px] rounded-lg border border-solid border-academy-border bg-academy-surface p-8 text-center sm:p-10">
				<span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-academy-secondary-color text-[30px] text-academy-primary">
					<span
						className="academy-icon academy-icon--course"
						aria-hidden={true}
					/>
				</span>

				<h2 className="text-[24px] font-bold tracking-tight text-academy-text-black m-0">
					{__('No courses yet', 'academy')}
				</h2>
				<p className="mx-auto mt-2 mb-0 max-w-[440px] text-sm text-academy-gray-2">
					{sprintf(
						/* translators: %s: plugin title (white-label aware). */
						__(
							'Your catalog is empty. Create your first course to start teaching, or load a demo course to explore what %s can do.',
							'academy'
						),
						toplevel_menu_title
					)}
				</p>

				<div className="mt-6 grid gap-2.5 text-left sm:grid-cols-3">
					{PERKS.map((perk) => (
						<div
							key={perk.title}
							className="rounded-lg border border-solid border-academy-border bg-academy-gray p-3"
						>
							<span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-academy-secondary-color text-15 text-academy-primary">
								<span
									className={`academy-icon academy-icon--${perk.icon}`}
									aria-hidden={true}
								/>
							</span>
							<span className="block text-13 font-semibold text-academy-text-black">
								{perk.title}
							</span>
							<span className="mt-0.5 block text-xs text-academy-gray-2">
								{perk.note}
							</span>
						</div>
					))}
				</div>

				<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
					<Link
						to={`${route_path}admin.php?page=academy-courses&action=new`}
						className="academy-empty-courses__create"
					>
						<Button
							suffix="first-course"
							preset="purple"
							label={__('Create your first course', 'academy')}
							icon={
								<span className="academy-icon academy-icon--plus" />
							}
							iconPosition="left"
						/>
					</Link>
					<Button
						preset="transparent"
						border="gray"
						icon={
							<span className="academy-icon academy-icon--import" />
						}
						iconPosition="left"
						isLoading={isPreparingDemo}
						loadingLabel={__('Opening demo importer…', 'academy')}
						label={__('Import demo course', 'academy')}
						onClick={handleImportDemo}
					/>
				</div>

				<p className="mt-4 mb-0 text-xs text-academy-gray-2">
					{__(
						'Demo courses are sample data you can safely remove anytime from Tools → Dummy Data.',
						'academy'
					)}
				</p>
			</div>
		</div>
	);
};

export default EmptyCourses;
