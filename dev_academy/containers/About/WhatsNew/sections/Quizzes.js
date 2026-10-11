import React from 'react';
import { __ } from '@wordpress/i18n';
import { Chapter, Row } from '../parts';
import { Shot } from '../media';

const Quizzes = () => (
	<Chapter
		id="awn-quizzes"
		head={{
			eyebrow: __('Quizzes', 'academy'),
			title: __('Write a question once.', 'academy'),
			accent: __('Use it everywhere.', 'academy'),
			accentBreak: true,
			plainAccent: true,
			desc: __(
				'A new Questions menu holds every question in one library, and the quiz editor follows the same three-step flow as courses.',
				'academy'
			),
		}}
	>
		<Row
			title={__('One library for every question', 'academy')}
			body={__(
				'Filter by type and difficulty, see how many quizzes use each question, and import or export the whole bank.',
				'academy'
			)}
			bullets={[
				__('Easy, Medium and Hard difficulty levels', 'academy'),
				__('A “Used in” count on every question', 'academy'),
				__('Inline reuse from inside the quiz editor', 'academy'),
			]}
			media={
				<Shot
					file="questions.webp"
					url="Quizzes › Questions"
					alt={__('Question bank with type, level, points and usage columns', 'academy')}
				/>
			}
		/>

		<Row
			flip
			title={__('Quiz Info, Questions, Settings', 'academy')}
			body={__(
				'Quizzes are built on a full page with the same stepper and save controls as courses. New quizzes are published by default, and attempt details open on their own page.',
				'academy'
			)}
			bullets={[
				__('Richer question cards', 'academy'),
				__('Images with size and alignment', 'academy'),
				__('Attempt details on a dedicated page', 'academy'),
			]}
			media={
				<Shot
					file="quiz-editor.webp"
					url="Quizzes › Edit Quiz"
					alt={__('Quiz editor on the Quiz Info step', 'academy')}
				/>
			}
		/>
	</Chapter>
);

export default Quizzes;
