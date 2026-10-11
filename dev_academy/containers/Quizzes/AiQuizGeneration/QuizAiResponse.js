import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import AcademySeparator from '@Components/AcademySeparator';

export const QuizAiResponse = ({ data, setQuiz }) => {
	const [selectedQuestions, setSelectedQuestions] = useState([]);

	const handleCheckboxChange = (index) => {
		setSelectedQuestions((prev) => {
			let newSelected;
			if (prev.includes(index)) {
				newSelected = prev.filter((i) => i !== index);
			} else {
				newSelected = [...prev, index];
			}

			if (newSelected.length === 0) {
				setQuiz(data);
			} else {
				setQuiz({
					...data,
					questions: newSelected.map((i) => data.questions[i]),
				});
			}

			return newSelected;
		});
	};

	return (
		<div className="academy-quiz-generate--response academy-column-items academy-separator-wrap">
			<h3 className="academy-column-items academy-mb-2">
				{__('Quiz Title', 'academy')}
			</h3>
			<span>{data?.title}</span>
			<AcademySeparator />
			<h3 className="academy-column-items academy-mb-2">
				{__('Quiz Content', 'academy')}
			</h3>
			{data.questions.map((question, index) => (
				<li
					key={index}
					className="academy-quiz-generate__question-item flex items-center gap-2"
				>
					<input
						type="checkbox"
						checked={selectedQuestions.includes(index)}
						onChange={() => handleCheckboxChange(index)}
					/>
					<div className="academy-quiz-generate__question-content flex-1 flex flex-col gap-1">
						<span className="academy-quiz-generate__question-text text-base font-medium text-academy-text">
							{question.question}
						</span>
						<span className="academy-quiz-generate__question-type">
							{question.type}
						</span>
					</div>
					<AcademySeparator />
				</li>
			))}
		</div>
	);
};
