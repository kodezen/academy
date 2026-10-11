import React from 'react';
import { plugin_root_url } from '@Utils/helper';
import { __ } from '@wordpress/i18n';

const reviewData = [
	{
		id: 1,
		logo: plugin_root_url + 'assets/images/review.svg',
		username: 'lucanitro94',
		handle: '@lucanitro94',
		review: __(
			'I am very pleased that I purchased the Academy LMS Pro plugin for my websites… The plugin is very well done, is simple to use and works great! I really liked the…',
			'academy'
		),
	},
	{
		id: 2,
		logo: plugin_root_url + 'assets/images/review2.svg',
		username: 'larsritter',
		handle: '@larsritter',
		review: __(
			'AcademyLMS is an excellent learning management tool known for its user-friendliness and reliability. One standout feature is the regular updates…',
			'academy'
		),
	},
	{
		id: 3,
		logo: plugin_root_url + 'assets/images/review3.svg',
		username: 'temorali',
		handle: '@temorali',
		review: __(
			'I am delighted to share my experience with the exceptional service provided by the Satodhru and Academy LMS team. We requested assistance with fixing an…',
			'academy'
		),
	},
	{
		id: 4,
		logo: plugin_root_url + 'assets/images/review4.svg',
		username: 'reimo2023',
		handle: '@reimo2023',
		review: __(
			'Unfortunately I can’t say that everything is easy and well. I have had many problems, but then again – it is always something that comes along with programmes…',
			'academy'
		),
	},
];

const Reviews = () => {
	return (
		<div className="academy-whatsnew__reviews">
			<div className="academy-whatsnew__reviews-title text-2xl font-medium leading-8 text-center mt-[60px] mb-8">
				<span>
					{__('Upgrade to Academy LMS Pro and Maximize', 'academy')}
				</span>
				<br />
				<span>{__('Your Revenue Potential!', 'academy')}</span>
			</div>

			<div className="academy-whatsnew__reviews-all flex flex-row flex-wrap items-center gap-6 mb-8">
				{reviewData.map((review) => (
					<div
						key={review.id}
						className="academy-whatsnew__reviews-card bg-academy-surface w-[calc(50%-62px)] rounded-xl p-6 border border-academy-border"
					>
						<div className="academy-whatsnew__reviews-header flex items-center gap-3 mb-5">
							<img
								src={review.logo}
								alt={review.username}
								className="academy-whatsnew__reviews-logo w-14 rounded-full object-cover shrink-0"
							/>
							<div className="academy-whatsnew__reviews-user-info flex flex-col gap-0.5 flex-1">
								<span className="academy-whatsnew__reviews-username text-academy-heading text-xl font-medium leading-7">
									{review.username}
								</span>
								<span className="academy-whatsnew__reviews-handle text-[#3E3E3E] text-sm font-normal leading-[19px]">
									{review.handle}
								</span>
							</div>
							<div className="academy-whatsnew__reviews-rating flex items-center gap-0.5 shrink-0">
								<span className="academy-icon academy-icon--star"></span>
								<span className="academy-icon academy-icon--star"></span>
								<span className="academy-icon academy-icon--star"></span>
								<span className="academy-icon academy-icon--star"></span>
								<span className="academy-icon academy-icon--star"></span>
							</div>
						</div>
						<span className="academy-whatsnew__reviews-review overflow-hidden text-academy-secondary-gray-color text-ellipsis text-base font-normal leading-6">
							{review.review}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Reviews;
