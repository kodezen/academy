import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import CurrentRelease from './CurrentRelease';
import OldRelease from './OldRelease';
import NewFeatures from './NewFeatures';

const currentFree = [
	{
		type: 'Free',
		items: [
			__(
				'Added: Setting to show the course review form only after a minimum completion percentage.',
				'academy'
			),
			__(
				'Added: Option to regenerate default certificates from the Tools page.',
				'academy'
			),
			__(
				'Added: New certificate variables: total topics, "What You Will Learn," "Course Requirements," and "Course Materials Included."',
				'academy'
			),
			__(
				'Fixed: "Next Topic" button alignment issue on the course learning page (mobile view).',
				'academy'
			),
			__(
				'Fixed: Enrolled course status display issue in the Students table.',
				'academy'
			),
		],
	},
];

const currentPro = [
	{
		type: 'Pro',
		items: [
			__(
				'Added: Booking table now hides private booking information.',
				'academy'
			),
			__(
				'Fixed: Google reCAPTCHA not working in the Reset Password form.',
				'academy'
			),
			__(
				'Fixed: Certificate signature and date image replaced with block-based code.',
				'academy'
			),
		],
	},
];

const oldFree = [
	{
		type: 'Free',
		version: '3.9.3',
		items: [
			__(
				'Added: Setting to show the course review form only after a minimum completion percentage.',
				'academy'
			),
			__(
				'Added: Option to regenerate default certificates from the Tools page.',
				'academy'
			),
			__(
				'Added: New certificate variables: total topics, "What You Will Learn," "Course Requirements," and "Course Materials Included."',
				'academy'
			),
			__(
				'Fixed: "Next Topic" button alignment issue on the course learning page (mobile view).',
				'academy'
			),
			__(
				'Fixed: Enrolled course status display issue in the Students table.',
				'academy'
			),
		],
	},
	{
		type: 'Free',
		version: '3.9.4',
		items: [
			__(
				'Added: Setting to show the course review form only after a minimum completion percentage.',
				'academy'
			),
			__(
				'Added: Option to regenerate default certificates from the Tools page.',
				'academy'
			),
			__(
				'Added: New certificate variables: total topics, "What You Will Learn," "Course Requirements," and "Course Materials Included."',
				'academy'
			),
			__(
				'Fixed: "Next Topic" button alignment issue on the course learning page (mobile view).',
				'academy'
			),
			__(
				'Fixed: Enrolled course status display issue in the Students table.',
				'academy'
			),
		],
	},
	{
		type: 'Free',
		version: '3.9.5',
		items: [
			__(
				'Added: Setting to show the course review form only after a minimum completion percentage.',
				'academy'
			),
			__(
				'Added: Option to regenerate default certificates from the Tools page.',
				'academy'
			),
			__(
				'Added: New certificate variables: total topics, "What You Will Learn," "Course Requirements," and "Course Materials Included."',
				'academy'
			),
			__(
				'Fixed: "Next Topic" button alignment issue on the course learning page (mobile view).',
				'academy'
			),
			__(
				'Fixed: Enrolled course status display issue in the Students table.',
				'academy'
			),
		],
	},
];

const oldPro = [
	{
		type: 'Pro',
		version: '3.9.3',
		items: [
			__(
				'Added: Booking table now hides private booking information.',
				'academy'
			),
			__(
				'Fixed: Google reCAPTCHA not working in the Reset Password form.',
				'academy'
			),
			__(
				'Fixed: Certificate signature and date image replaced with block-based code.',
				'academy'
			),
		],
	},
	{
		type: 'Pro',
		version: '3.9.5',
		items: [
			__(
				'Added: Booking table now hides private booking information.',
				'academy'
			),
			__(
				'Fixed: Google reCAPTCHA not working in the Reset Password form.',
				'academy'
			),
			__(
				'Fixed: Certificate signature and date image replaced with block-based code.',
				'academy'
			),
		],
	},
];

const newFeatureFree = [
	{
		type: 'Free',
		items: [
			__(
				'Added: Setting to show the course review form only after a minimum completion percentage.',
				'academy'
			),
			__(
				'Added: Option to regenerate default certificates from the Tools page.',
				'academy'
			),
			__(
				'Added: New certificate variables: total topics, "What You Will Learn," "Course Requirements," and "Course Materials Included."',
				'academy'
			),
			__(
				'Fixed: "Next Topic" button alignment issue on the course learning page (mobile view).',
				'academy'
			),
			__(
				'Fixed: Enrolled course status display issue in the Students table.',
				'academy'
			),
		],
	},
];

const newFeaturePro = [
	{
		type: 'Pro',
		items: [
			__(
				'Added: Booking table now hides private booking information.',
				'academy'
			),
			__(
				'Fixed: Google reCAPTCHA not working in the Reset Password form.',
				'academy'
			),
			__(
				'Fixed: Certificate signature and date image replaced with block-based code.',
				'academy'
			),
		],
	},
];

const ChangeLog = () => {
	const [tab, setTab] = useState('current');
	return (
		<div className="academy-whatsnew__changelog pb-6">
			<h2 className="academy-whatsnew__changelog-title text-[#20232D] text-center text-2xl font-medium leading-8 mt-0 mb-8">
				{__('Changelog', 'academy')}
			</h2>
			<div className="academy-whatsnew__changelog-tab flex p-[10px] items-center gap-10 bg-[#F2F0FD] rounded-md justify-between mb-[42px] cursor-pointer">
				<span
					onClick={() => setTab('old')}
					className={
						'w-[220px] py-[10px] px-5 text-center text-xl font-normal leading-7 rounded text-academy-gray-2' +
						(tab === 'old' ? ' text-academy-text-black bg-academy-surface' : '')
					}
				>
					{__('Old Release', 'academy')}
				</span>
				<span
					onClick={() => setTab('current')}
					className={
						'w-[220px] py-[10px] px-5 text-center text-xl font-normal leading-7 rounded text-academy-gray-2' +
						(tab === 'current' ? ' text-academy-text-black bg-academy-surface' : '')
					}
				>
					{__('Current Release', 'academy')}
				</span>
				<span
					onClick={() => setTab('new')}
					className={
						'w-[220px] py-[10px] px-5 text-center text-xl font-normal leading-7 rounded text-academy-gray-2' +
						(tab === 'new' ? ' text-academy-text-black bg-academy-surface' : '')
					}
				>
					{__('New Features', 'academy')}
				</span>
			</div>

			{tab === 'old' && <OldRelease oldFree={oldFree} oldPro={oldPro} />}
			{tab === 'current' && (
				<CurrentRelease
					currentFree={currentFree}
					currentPro={currentPro}
				/>
			)}
			{tab === 'new' && (
				<NewFeatures
					newFeatureFree={newFeatureFree}
					newFeaturePro={newFeaturePro}
				/>
			)}
			{/* <Button
                
                border="rounded"
                suffix="chevron"
                // type="link"
                target="blank"
                icon={
                    <span className="academy-icon academy-icon--arrow-down"/>
                }
                iconPosition="center"
                // className="academy-btn--chevron"
            />  */}
		</div>
	);
};

export default ChangeLog;
