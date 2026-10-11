import React from 'react';
import Checkbox from '@Components/Formik/Checkbox';
import FormHeading from '../Component/FormHeading';
import PostSelect from '@Components/PostSelect';
import { __ } from '@wordpress/i18n';
import AcademySeparator from '@Components/AcademySeparator';
import { plugin_root_url } from '@Utils/helper';

import './styles.scss';

export default function Instructor() {
	return (
		<>
			<FormHeading
				title={__('Roles & access', 'academy')}
				subtitle={__(
					'Manage access and capabilities for instructors and students.',
					'academy'
				)}
				imgUrl={`${plugin_root_url}assets/images/setup/role_management.svg`}
			/>
			<div className="academy-setup-screen--fourth__body">
				<PostSelect
					title={__('Instructor Registration Page', 'academy')}
					name="frontend_instructor_reg_page"
					postType="page"
				/>

				<Checkbox
					name="is_show_public_profile"
					title={__('Public Profile', 'academy')}
					subtitle={__(
						'Enable Instructor Public Profile.',
						'academy'
					)}
				/>

				<Checkbox
					name="is_instructor_can_publish_course"
					title={__('Allow Publishing Course', 'academy')}
					subtitle={__(
						'Enable instructors to publish course directly.',
						'academy'
					)}
				/>

				<AcademySeparator />

				<PostSelect
					title={__('Student Registration Page', 'academy')}
					name="frontend_student_reg_page"
					postType="page"
				/>
				<Checkbox
					name="is_student_can_upload_files"
					title={__('Allow Upload Files', 'academy')}
					subtitle={__('Enable student upload files ', 'academy')}
				/>
			</div>
		</>
	);
}
