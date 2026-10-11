import React from 'react';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import RouteTabs from '@Components/TopBar/RouteTabs';

const TABS = [
	{ key: '', label: __('All Quizzes', 'academy'), icon: 'docs' },
	{ key: 'questions', label: __('Questions', 'academy'), icon: 'question' },
	{ key: 'attempts', label: __('Quiz Attempts', 'academy'), icon: 'stoke-checkmark' },
];

// All Quizzes / Questions / Quiz Attempts tabs for the wp-admin Quizzes top
// bar. Free-only (its useNavigate is the free bundle's router).
const QuizTabs = ({ value = '' }) => {
	const navigate = useNavigate();
	return (
		<RouteTabs
			page="academy-quizzes"
			tabs={TABS}
			value={value}
			navigate={navigate}
		/>
	);
};

export default QuizTabs;
