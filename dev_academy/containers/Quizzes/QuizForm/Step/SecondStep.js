import React from 'react';
import Questions from '../Questions';

const propTypes = {};

export default function SecondStep({ values }) {
	return (
		<React.Fragment>
			<div className="academy-quiz-form__step">
				<Questions
					quizId={values.id}
					data={values.meta.academy_quiz_questions}
				/>
			</div>
		</React.Fragment>
	);
}

SecondStep.propTypes = propTypes;
