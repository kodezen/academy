import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Shown when a block is placed outside a course (for example in a template
 * that is not tied to one course yet), so the preview is never empty.
 */
export const SAMPLE_COURSE = {
	price: '$49.00',
	is_paid: true,
	reviews_enabled: true,
	rating: { average: 4.5, count: 12 },
	instructors: [ { id: 0, name: __( 'Instructor name', 'academy' ), avatar: '', url: '' } ],
	lessons: 12,
	duration: '4 hr 30 mins',
	level: __( 'Beginner', 'academy' ),
	enrolled: 120,
	is_enrolled: false,
};

/**
 * Course facts for a block's preview, from the `academy_card` REST field.
 *
 * @param {Object} context Block context with postId and postType.
 * @return {{course: Object|null, isSample: boolean}} Course facts.
 */
export default function useCourse( context ) {
	const postId = context?.postId;
	const postType = context?.postType;
	const courseTypes = window.academyBlocks?.courseTypes ?? [ 'academy_courses' ];
	const isCourse = courseTypes.includes( postType ) && !! postId;

	// Only the card field, in view context: cheap, and available to anyone who
	// can read the course (not only people who can edit it).
	const record = useSelect(
		( select ) =>
			isCourse
				? select( coreStore ).getEntityRecord( 'postType', postType, postId, {
						_fields: 'id,academy_card',
						context: 'view',
				  } )
				: null,
		[ isCourse, postType, postId ]
	);

	if ( ! isCourse ) {
		return { course: SAMPLE_COURSE, isSample: true };
	}

	return { course: record?.academy_card ?? null, isSample: false };
}
