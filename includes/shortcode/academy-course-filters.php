<?php
namespace Academy\Shortcode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AcademyCourseFilters {
	public function __construct() {
		add_shortcode( 'academy_course_filters', array( $this, 'academy_course_filters' ) );
		add_shortcode( 'academy_course_header_filters', array( $this, 'archive_course_header_filters' ) );
	}
	public function academy_course_filters( $atts, $content = '' ) {
		ob_start();
		echo '<div class="academy-course-filters">';
			do_action( 'academy/templates/archive/course_sidebar_content' );
		echo '</div>';
		$output = ob_get_clean();
		return apply_filters( 'academy/templates/shortcode/course_filters', $output );
	}

	public function archive_course_header_filters( $atts, $content = '' ) {
		ob_start();
		\Academy\Helper::get_template( 'archive/header.php' );
		$output = ob_get_clean();
		return apply_filters( 'academy/templates/shortcode/archive_course_header_filters', $output );
	}
}
