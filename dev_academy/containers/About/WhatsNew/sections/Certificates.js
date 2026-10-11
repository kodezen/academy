import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row } from '../parts';
import { Carousel } from '../media';
import { MockCertificate } from '../mocks/Builders';

// Designed slides: they carry their own background, so no browser bar.
const SLIDES = [
	{
		file: 'certificate-hero.webp',
		className: 'awn-shot--bare',
		alt: __('A certificate of completion with an Academy LMS badge, signatures and details, in front of other certificate designs', 'academy'),
		caption: {
			title: __('Certificates that look the part.', 'academy'),
			body: __('Start from a ready design and make it yours with your logo, signatures and course details.', 'academy'),
		},
	},
	{
		file: 'certificate-builder-art.webp',
		className: 'awn-shot--bare',
		alt: __('Certificate Builder blocks panel beside a Certificate of Appreciation design', 'academy'),
		caption: {
			title: __('A real canvas.', 'academy'),
			body: __('Drag text, headings, images, shapes, QR codes, signatures and dates into place.', 'academy'),
		},
	},
	{
		file: 'certificate-list-art-v2.webp',
		className: 'awn-shot--bare',
		alt: __('All Certificates list with status and actions, and the Add New Certificate button', 'academy'),
		caption: {
			title: __('Every certificate in one list.', 'academy'),
			body: __('Add new ones, choose which one is primary, and publish or reset from the same screen.', 'academy'),
		},
	},
];

const Certificates = () => (
	<Chapter
		id="awn-certificates"
		tone="wash"
		head={{
			eyebrow: __('Certificates', 'academy'),
			title: __('Certificates worth', 'academy'),
			accent: __('putting on a profile.', 'academy'),
			accentBreak: true,
			desc: __(
				'A new Certificate Builder with a real canvas. Drag text, logos, signatures and QR codes exactly where you want them.',
				'academy'
			),
		}}
	>
		<Carousel
			label={__('Certificate Builder screenshots', 'academy')}
			slides={SLIDES}
			autoPlay={4000}
		/>

		<Row
			kicker={__('Certificate Builder', 'academy')}
			title={__('Design on a canvas, preview the PDF', 'academy')}
			body={__(
				'Start from the create wizard or edit the default. Pick courses and see the design live, then check the PDF before anyone earns it.',
				'academy'
			)}
			bullets={[
				__('Create wizard and a safe reset to the default', 'academy'),
				__('Images and signatures from the Media Library', 'academy'),
				__('Live design while you pick courses', 'academy'),
				__('PDF preview', 'academy'),
				__('New {{verification_code}} merge tag', 'academy'),
			]}
			media={
				<div className="awn-frame">
					<MockCertificate />
				</div>
			}
		/>
	</Chapter>
);

export default Certificates;
