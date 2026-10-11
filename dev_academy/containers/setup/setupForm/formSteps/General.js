import React from 'react';
import Checkbox from '@Components/Formik/Checkbox';
import PostSelect from '@Components/PostSelect';
import { toplevel_menu_title } from '@Utils/helper';
import { __, sprintf } from '@wordpress/i18n';
import FormHeading from '../Component/FormHeading';
import { plugin_root_url } from '@Utils/helper';

import './styles.scss';

export default function General() {
	return (
		<>
			<FormHeading
				title={__('General settings', 'academy')}
				subtitle={__(
					'Where students find their dashboard, and how they sign in.',
					'academy'
				)}
				imgUrl={`${plugin_root_url}assets/images/setup/briefcase.svg`}
			/>
			<div className="academy-setup-screen--fourth__body">
				<PostSelect
					title={__('Dashboard Page', 'academy')}
					name="frontend_dashboard_page"
					postType="page"
				/>
				<Checkbox
					name="is_enabled_academy_login"
					title={sprintf(
						// translators: %s: BrandingName
						__('Enable %s Login.', 'academy'),
						toplevel_menu_title
					)}
					subtitle={__(
						'Switch to the academy login instead of the default WordPress login page.',
						'academy'
					)}
				/>
			</div>
		</>
	);
}
