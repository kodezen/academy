import React from 'react';
import Button from '@Components/Button';
import { Dropdown } from '@Components/ui';
import { __ } from '@wordpress/i18n';
import ReuseContent from './ReuseContent';
import NewTabContent from './NewTabContent';
import './styles.scss';

const TopicsSelectModal = ({
	isSubCurriculum,
	subCurriculumIndex,
	subCurriculumItemIndex,
	subItemRemoveHandler,
	itemIndex,
	showSubCurriculum,
	setShowTopicButton,
	updateTopic,
}) => {
	return (
		<div className="academy-content-picker-wrap">
			<div className="academy-content-picker-actions">
				{/* Add New Content → dropdown of content types to create. */}
				<Dropdown
					contentClassName="academy-content-dropdown academy-content-dropdown--new"
					// Picking a type (e.g. "Add Lesson") opens its own react-modal,
					// whose local open-state lives inside NewTabContent's subtree —
					// unmounting that on close would close the new-item modal too.
					keepMounted={true}
					renderToggle={({ isOpen, onToggle }) => (
						<Button
							type="button"
							onClick={onToggle}
							aria-expanded={isOpen}
							icon={
								<span className="academy-icon academy-icon--simple-add" />
							}
							label={__('Add New Content', 'academy')}
							size="medium"
							suffix="add-content"
							preset="transparent"
						/>
					)}
					renderContent={({ onClose }) => (
						<NewTabContent
							itemIndex={itemIndex}
							setShowTopicButton={setShowTopicButton}
							showSubCurriculum={showSubCurriculum}
							isSubCurriculum={isSubCurriculum}
							subCurriculumIndex={subCurriculumItemIndex}
							updateTopic={updateTopic}
							closeModal={onClose}
							isAddNewItem={true}
						/>
					)}
				/>

				{/* Reuse Content → dropdown to pick existing content. */}
				<Dropdown
					contentClassName="academy-content-dropdown academy-content-dropdown--reuse"
					align="right"
					// Editing/creating an item from here (e.g. the "Lesson 1" edit
					// icon) opens its own react-modal, portaled to its own node
					// under <body> — a sibling of this panel, not a descendant, so
					// closing this dropdown normally would unmount ReuseContent
					// and destroy that modal's state along with it. Mirrors the
					// "Add New Content" dropdown above.
					keepMounted={true}
					renderToggle={({ isOpen, onToggle }) => (
						<Button
							type="button"
							onClick={onToggle}
							aria-expanded={isOpen}
							icon={
								<span className="academy-icon academy-icon--duplicate-content" />
							}
							label={__('Reuse Content', 'academy')}
							size="medium"
							suffix="reuse-content"
							preset="transparent"
						/>
					)}
					renderContent={({ onClose }) => (
						<ReuseContent
							isSubCurriculum={isSubCurriculum}
							subCurriculumIndex={subCurriculumIndex}
							subItemRemoveHandler={subItemRemoveHandler}
							closeModal={onClose}
						/>
					)}
				/>

				{showSubCurriculum && (
					<Button
						onClick={() => setShowTopicButton(true)}
						label={__('Add Sub-curriculum', 'academy')}
						icon={
							<span className="academy-icon academy-icon--simple-add" />
						}
						size="medium"
						suffix="add-sub-curriculum"
						preset="transparent"
					/>
				)}
			</div>
		</div>
	);
};

export default TopicsSelectModal;
