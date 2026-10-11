import React from 'react';
import { Field } from 'formik';
import { __ } from '@wordpress/i18n';

export default function Additional() {
	return (
		<React.Fragment>
			<div className="meta-field  meta-field--course-benefits">
				<label htmlFor="benefits" className="meta-field__label">
					<span className="academy-title">
						{__('Benefits of the course', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__(
							'Write benefits of this course. (one per line)',
							'academy'
						)}
					</span>
				</label>
				<div className="meta-field__body">
					<Field
						id="benefits"
						type="text"
						name="meta.academy_course_benefits"
						as="textarea"
						className="academy-input"
						placeholder={__(
							'e.g.\nBuild real-world projects from scratch\nMaster the fundamentals of the subject',
							'academy'
						)}
					/>
				</div>
			</div>

			<div className="meta-field  meta-field--target-audience">
				<label htmlFor="targeted" className="meta-field__label">
					<span className="academy-title">
						{__('Targeted Audience', 'academy')}
					</span>

					<span className="academy-sub-title">
						{__(
							'Specify the target audience that will benefit the most from the course. (one per line)',
							'academy'
						)}
					</span>
				</label>
				<div className="meta-field__body">
					<Field
						id="targeted"
						type="text"
						name="meta.academy_course_audience"
						as="textarea"
						className="academy-input"
						placeholder={__(
							'e.g.\nBeginners with no prior experience\nProfessionals looking to upskill',
							'academy'
						)}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--requirements">
				<label htmlFor="requirements" className="meta-field__label">
					<span className="academy-title">
						{__('Requirements', 'academy')}
					</span>

					<span className="academy-sub-title">
						{__(
							'Are there any course requirements? (one per line)',
							'academy'
						)}
					</span>
				</label>
				<div className="meta-field__body">
					<Field
						id="requirements"
						type="text"
						name="meta.academy_course_requirements"
						as="textarea"
						className="academy-input"
						placeholder={__(
							'e.g.\nA computer with internet access\nBasic knowledge of the subject',
							'academy'
						)}
					/>
				</div>
			</div>

			<div className="meta-field meta-field--materials">
				<label htmlFor="materials" className="meta-field__label">
					<span className="academy-title">
						{__('Materials Included', 'academy')}
					</span>
					<span className="academy-sub-title">
						{__(
							'A list of assets you will be providing for the students in this course (One per line)',
							'academy'
						)}
					</span>
				</label>
				<div className="meta-field__body">
					<Field
						id="materials"
						type="text"
						name="meta.academy_course_materials_included"
						as="textarea"
						className="academy-input"
						placeholder={__(
							'e.g.\nDownloadable source code\nSlides and course notes (PDF)',
							'academy'
						)}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}
