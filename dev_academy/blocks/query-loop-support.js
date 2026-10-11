/**
 * Which Academy blocks can go inside a Query Loop.
 *
 * Inside a loop of courses, only the Course Card blocks (one course's facts:
 * price, rating, instructors…) make sense; course page sections (curriculum,
 * reviews…) and everything else from Academy stay out of its inserter. Inside
 * a loop of anything else, no course block is offered at all. Blocks from
 * WordPress and other plugins are left as they are.
 */
import { addFilter } from '@wordpress/hooks';

const COURSE_TYPES = window.academyBlocks?.courseTypes || [ 'academy_courses' ];

// Blocks that show one course's facts and read the loop's course.
export const COURSE_CARD_BLOCKS = [
	'academy/course-badge',
	'academy/course-enroll-button',
	'academy/course-instructors',
	'academy/course-meta',
	'academy/course-price',
	'academy/course-rating',
	'academy/course-wishlist',
];

/**
 * The Query Loop a block is being inserted into, if any.
 *
 * @param {string}   rootClientId                         Where the block goes.
 * @param {Object}   selectors                            Editor selectors.
 * @param {Function} selectors.getBlock                   Block by client ID.
 * @param {Function} selectors.getBlockParentsByBlockName Parents by name.
 * @return {Object|null} The core/query block.
 */
const enclosingQuery = ( rootClientId, { getBlock, getBlockParentsByBlockName } ) => {
	if ( ! rootClientId ) {
		return null;
	}
	const root = getBlock( rootClientId );
	if ( 'core/query' === root?.name ) {
		return root;
	}
	const [ queryId ] = getBlockParentsByBlockName( rootClientId, 'core/query', true ) || [];

	return queryId ? getBlock( queryId ) : null;
};

addFilter(
	'blockEditor.__unstableCanInsertBlockType',
	'academy/query-loop-support',
	( canInsert, blockType, rootClientId, selectors ) => {
		if ( ! canInsert || ! blockType?.name?.startsWith( 'academy/' ) ) {
			return canInsert;
		}
		const query = enclosingQuery( rootClientId, selectors );
		if ( ! query ) {
			return canInsert;
		}
		const { inherit, postType } = query.attributes?.query || {};
		// A loop that follows the page (a course archive template) may be a
		// course loop; one that names a post type is decided by it.
		const isCourseLoop = inherit || COURSE_TYPES.includes( postType );

		return isCourseLoop && COURSE_CARD_BLOCKS.includes( blockType.name );
	}
);
