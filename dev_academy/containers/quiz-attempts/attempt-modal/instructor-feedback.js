import { Field, Form, Formik } from 'formik';
import React from 'react';
import { makeRequest } from '@Utils/helper';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import Button from '@Components/Button';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'react-redux';
import { updateQuizAttemptsFeedBack } from '@Redux/Slices/quizAttemptsSlice/quizAttemptsSlice';

const propTypes = {
	name: PropTypes.string,
	value: PropTypes.string,
	attemptId: PropTypes.number,
};

export default function InstructorFeedback({ name, value, attemptId }) {
	const dispatch = useDispatch();
	return (
		<React.Fragment>
			<Formik
				initialValues={{
					attempt_id: attemptId,
					[name]: value,
				}}
				onSubmit={(values, actions) => {
					actions.setSubmitting(true);
					makeRequest({
						action: 'academy_quizzes/update_quiz_attempt_instructor_feedback',
						...values,
					}).then((res) => {
						actions.setSubmitting(false);
						if (res.status === 200)
							dispatch(updateQuizAttemptsFeedBack(values));
						dispatch(
							showNotification({
								message: __('Feedback Updated', 'academy'),
								isShow: true,
								type: 'success',
							})
						);
					});
				}}
			>
				{({ isSubmitting }) => (
					<Form className="academy-instructor__feedback">
						<Field
							className="academy-instructor__field h-[150px] w-full border border-academy-border py-6 px-[30px]"
							id="message"
							as="textarea"
							name={name}
							placeholder={__('Feedback', 'academy')}
						/>
						<Button
							type="submit"
							label={__('Update Feedback', 'academy')}
							isLoading={isSubmitting}
						/>
					</Form>
				)}
			</Formik>
		</React.Fragment>
	);
}

InstructorFeedback.propTypes = propTypes;
