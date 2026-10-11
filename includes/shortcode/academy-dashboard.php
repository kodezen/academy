<?php
namespace Academy\Shortcode;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AcademyDashboard {

	public function __construct() {
		add_shortcode( 'academy_dashboard', array( $this, 'frontend_dashboard' ) );
	}
	public function frontend_dashboard() {
		// Redirects must happen before any output is buffered, so an `exit`
		// never leaves an output buffer open.
		$redirect_url = ! is_user_logged_in() ? $this->get_login_redirect_url() : '';
		if ( $redirect_url ) {
			wp_safe_redirect( $redirect_url );
			exit;
		}

		ob_start();
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo do_action( 'academy/shortcode/before_academy_dashboard' );

		if ( ! is_user_logged_in() ) {
			echo do_shortcode( '[academy_login_form form_title="' . esc_attr__( 'Sign in to Access Your Dashboard', 'academy' ) . '" show_logged_in_message="false"]' );
		} else {
			$instructor_status = get_user_meta( get_current_user_id(), 'academy_instructor_status', true );
			if ( 'pending' === $instructor_status ) {
				echo '<p class="academy-instructor-pending-status-message">' . esc_html__( 'Please wait for admin\'s to approve you as an instructor.', 'academy' ) . '</p>';
			}
			if ( \Academy\FrontendDashboard\Dashboard::uses_blocks() ) {
				// The block dashboard: its blocks, as arranged on Customize.
				printf(
					'<div class="%1$s academy-frontend-dashboard--blocks"><div class="%2$s">%3$s</div></div>',
					esc_attr( \Academy\FrontendDashboard\Dashboard::wrapper_class() ),
					esc_attr( \Academy\FrontendDashboard\Dashboard::inner_container_class() ),
					do_blocks( \Academy\FrontendDashboard\Layout::markup() ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				);
			} else {
				\Academy\Helper::get_template( 'shortcode/frontend-dashboard.php' );
			}
		}//end if
		$output = ob_get_clean();
		return apply_filters( 'academy/templates/shortcode/dashboard', $output );
	}

	/**
	 * Where a logged-out visitor should be sent instead of the inline login form,
	 * per the dashboard login setting; '' to render the form.
	 *
	 * @return string
	 */
	protected function get_login_redirect_url() {
		$login_redirect_page = \Academy\Helper::get_settings( 'academy_frontend_dashboard_redirect_login_page' ) ?? 'academy_login';
		switch ( $login_redirect_page ) {
			case 'academy_login':
				return \Academy\Helper::get_settings( 'is_enabled_academy_login' ) ? '' : wp_login_url( get_the_permalink() );
			case 'ablocks_login':
				if ( \Academy\Helper::is_active_ablocks() ) {
					$page_id = \Ablocks\Helper::get_settings( 'login_page' );
					return $page_id ? (string) get_page_link( (int) $page_id ) : '';
				}
				return '';
			case 'default':
				return wp_login_url( get_the_permalink() );
			case 'custom_login':
				return (string) \Academy\Helper::get_settings( 'academy_frontend_dashboard_redirect_login_url' );
			default:
				return '';
		}
	}
}
