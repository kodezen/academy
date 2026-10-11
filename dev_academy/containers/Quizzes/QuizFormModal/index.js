import Preloader from '@Components/Loader/Preloader';
import QuizForm from '../QuizForm';
import QuizFormContext from '../context/QuizFormContext';
import React from 'react';
import ReactModal from '@Components/Modal/ReactModal';
import { __ } from '@wordpress/i18n';
import './styles.scss';

const QuizFormModal = ({
	isOpenQuizForm,
	closeQuizFormModal,
	formData,
	dripContentType,
	topics,
	currentItemId,
	isDripContentEnable,
	isLoading,
	topicUpdateHandler,
	// The modal always closes after a save (no persistent route to clobber),
	// so renaming can safely reuse the same handler as create/close.
	topicRenameHandler = topicUpdateHandler,
	updateTopic = false,
	itemIndex,
	subCurriculumIndex,
	subTopicUpdateHandler,
	isSubCurriculum,
	closeModal,
	isAddNewItem,
}) => {
	return (
		<QuizFormContext.Provider
			value={{
				dripContentType,
				topics,
				currentItemId,
				isDripContentEnable,
				topicUpdateHandler,
				topicRenameHandler,
				updateTopic,
				itemIndex,
				subCurriculumIndex,
				subTopicUpdateHandler,
				isSubCurriculum,
				closeModal,
				isAddNewItem,
			}}
		>
			<ReactModal
				title={__('Quiz', 'academy')}
				isOpen={isOpenQuizForm}
				onRequestClose={closeQuizFormModal}
				isSmallAvailable={false}
				suffix={'quiz-form'}
				size="medium"
			>
				{isLoading ? (
					<div className="academy-quiz-loader h-[150px]">
						<Preloader />
					</div>
				) : (
					<QuizForm
						cancelHandler={closeQuizFormModal}
						data={formData}
					/>
				)}
			</ReactModal>
		</QuizFormContext.Provider>
	);
};

export default QuizFormModal;
