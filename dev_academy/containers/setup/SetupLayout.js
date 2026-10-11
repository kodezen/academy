import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { admin_url, plugin_root_url } from '@Utils/helper';

import './layout.scss';

export const SETUP_STEPS = [
	{ key: 'business', title: __( 'Business type', 'academy' ), description: __( 'One instructor or many', 'academy' ) },
	{ key: 'general', title: __( 'General', 'academy' ), description: __( 'Dashboard page and login', 'academy' ) },
	{ key: 'roles', title: __( 'Roles & access', 'academy' ), description: __( 'Instructors and students', 'academy' ) },
	{ key: 'payments', title: __( 'Payments', 'academy' ), description: __( 'How you get paid', 'academy' ) },
];

// The setup wizard's frame: the steps down the left, the step on the right.
export default function SetupLayout( { current = 0, children } ) {
	return (
		<div className="academy-setup-layout">
			<aside className="academy-setup-sidebar">
				<img
					className="academy-setup-sidebar__logo"
					src={ `${ plugin_root_url }assets/images/logo-full.svg` }
					alt={ __( 'Academy LMS', 'academy' ) }
				/>
				<p className="academy-setup-sidebar__intro">
					{ __( 'A few choices to get your site ready. You can change any of them later in Settings.', 'academy' ) }
				</p>

				<ol className="academy-setup-steps" aria-label={ __( 'Setup steps', 'academy' ) }>
					{ SETUP_STEPS.map( ( step, index ) => {
						const state = index < current ? 'done' : index === current ? 'current' : 'upcoming';
						return (
							<li
								key={ step.key }
								className={ `academy-setup-steps__item is-${ state }` }
								aria-current={ 'current' === state ? 'step' : undefined }
							>
								<span className="academy-setup-steps__marker" aria-hidden="true">
									{ 'done' === state ? <span className="academy-icon academy-icon--check" /> : index + 1 }
								</span>
								<span className="academy-setup-steps__text">
									<span className="academy-setup-steps__title">{ step.title }</span>
									<span className="academy-setup-steps__description">{ step.description }</span>
								</span>
								{ 'done' === state && (
									<span className="academy-setup-visually-hidden">{ __( '(completed)', 'academy' ) }</span>
								) }
							</li>
						);
					} ) }
				</ol>

				<a className="academy-setup-sidebar__exit" href={ `${ admin_url }admin.php?page=academy-about` }>
					<span className="academy-icon academy-icon--angle-left" aria-hidden="true" />
					{ __( 'Exit setup', 'academy' ) }
				</a>
			</aside>

			<main className="academy-setup-main">
				<div className="academy-setup-main__inner">
					<span className="academy-setup-main__count">
						{ sprintf(
							/* translators: 1: current step, 2: number of steps. */
							__( 'Step %1$d of %2$d', 'academy' ),
							Math.min( current + 1, SETUP_STEPS.length ),
							SETUP_STEPS.length
						) }
					</span>
					{ children }
				</div>
			</main>
		</div>
	);
}
