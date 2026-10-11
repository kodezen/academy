/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { makeRequest, notification } from '@Utils/helper';
import CourseReview from '@Components/CourseReview';
import { useDispatch } from 'react-redux';

const propTypes = {};

export default function CompleteCourse() {
	const dispatch = useDispatch();
	const [courseId, setCourseId] = useState(0);
	const [isOpenModal, setOpenModal] = useState(false);

	const openModal = (form, isPopupReviewEnabled, reviewInSingleCourse) => {
		const formData = new FormData(form);
		const data = {};
		for (const [key, value] of formData.entries()) {
			data[key] = value;
		}
		setCourseId(data?.course_id);
		makeRequest({
			action: 'academy/complete_course',
			...data,
		}).then((res) => {
			if (
				res?.data?.success &&
				isPopupReviewEnabled &&
				reviewInSingleCourse
			) {
				setOpenModal(true);
			} else {
				notification(
					res?.data?.success ? 'success' : 'error',
					res?.data?.data,
					'lesson'
				);
				if (res?.data?.success) {
					setTimeout(() => {
						window.location.reload();
					}, 2000);
				}
			}
		});
	};

	useEffect(() => {
		const form = document.querySelector('#academy_course_complete_form');
		const body = document.querySelector('body');
		const reviewInSingleCourse = form?.getAttribute(
			'data-is-enabled-single-course-review'
		);
		const isPopupReviewEnabled = form?.getAttribute(
			'data-is-enabled-course-popup-review'
		);

		body.addEventListener('submit', (event) => {
			if (event.target.id === 'academy_course_complete_form') {
				event.preventDefault();
				openModal(form, isPopupReviewEnabled, !reviewInSingleCourse);
			}
		});

		return () => {
			body.removeEventListener('submit');
		};
	}, []);

	return (
		<React.Fragment>
			<CourseReview
				isOpenModal={isOpenModal}
				setOpenModal={setOpenModal}
				courseId={courseId}
				isCourseCompleted={true}
			/>
		</React.Fragment>
	);
}

CompleteCourse.propTypes = propTypes;
