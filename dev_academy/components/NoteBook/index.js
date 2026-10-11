import React, { useState, useEffect, useCallback, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import debounce from 'just-debounce-it';
import { current_user_id, makeRequest } from '@Utils/helper';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';
import './styles.scss';

const NoteBook = ({ courseID, isLesson = false }) => {
	const dispatch = useDispatch();
	const [showNotes, setShowNotes] = useState(false);
	const [expended, isExpended] = useState(false);
	const [largeWindow, isLargeWindow] = useState(true);
	const [notes, setNotes] = useState('');
	const editorRef = useRef(null);

	useEffect(() => {
		// Only populate editor when it's first shown
		if (showNotes && editorRef.current) {
			editorRef.current.innerHTML = notes || '';
		}
	}, [showNotes]);

	const handleGetLessonNote = async () => {
		let params = {
			user_id: current_user_id,
		};

		if (isLesson) params = { ...params, course_id: courseID };

		try {
			const response = await makeRequest({
				action: 'academy/get_lesson_note',
				...params,
			});
			const note = response?.data?.data;
			setNotes(typeof note === 'string' ? note : '');
		} catch (error) {
			console.error(error);
		}
	};

	const handleSaveLessonNote = async (note) => {
		let params = {
			note,
			user_id: current_user_id,
		};
		if (isLesson) params = { ...params, course_id: courseID };
		await makeRequest({ action: 'academy/save_lesson_note', ...params });
	};

	const debouncedAPICall = useCallback(
		debounce((keyword) => {
			handleSaveLessonNote(keyword);
		}, 1000),
		[handleSaveLessonNote]
	);

	const handleInput = () => {
		if (editorRef.current) {
			setNotes(editorRef.current.innerHTML);
			debouncedAPICall(editorRef.current.innerHTML);
		}
	};

	useEffect(() => {
		handleGetLessonNote();
	}, []);

	useEffect(() => {
		const checkWindowHeight = () => {
			if (window.innerHeight < 800) {
				isLargeWindow(false);
			} else {
				isLargeWindow(true);
			}
		};

		checkWindowHeight();

		window.addEventListener('resize', checkWindowHeight);

		return () => window.removeEventListener('resize', checkWindowHeight);
	}, [window.innerHeight]);

	const isFloating = expended && largeWindow;
	const isLoggedIn = parseInt(current_user_id, 10) !== 0;

	const toggleNotes = () => {
		if (!isLoggedIn) {
			dispatch(
				showNotification({
					message: __(
						'You are not logged in to do that.',
						'academy'
					),
					isShow: true,
					type: 'error',
				})
			);
			return;
		}
		setShowNotes((v) => !v);
	};

	return (
		<React.Fragment>
			<div className="academy-notes-wrapper">
				{!showNotes && !isLesson && (
					<Button
						label={__('Notes', 'academy')}
						onClick={toggleNotes}
						suffix={'note-book'}
						preset="light-purple"
					/>
				)}
				{isLesson && (
					<Button
						label={__('Take Note', 'academy')}
						onClick={toggleNotes}
						suffix={'lesson-note'}
						preset="light-purple"
					/>
				)}

				{showNotes && (
					<div
						className={`academy-notes-wrapper__content ${
							isFloating && 'academy-notes-wrapper__floating'
						}`}
					>
						<div className="academy-notes-wrapper__header">
							<div className="academy-notes-wrapper__title">
								<span>{__('Notes', 'academy')}</span>
							</div>
							<div className="academy-notes-wrapper__actions">
								{largeWindow && (
									<Button
										icon={
											<span
												className={`academy-icon ${
													expended
														? 'academy-icon--large-collaps'
														: 'academy-icon--large-expand'
												}`}
											></span>
										}
										onClick={() => isExpended(!expended)}
										preset="white"
										border="gray"
										suffix="notes-header"
									/>
								)}
								<Button
									icon={
										<span className="academy-icon academy-icon--minus-two"></span>
									}
									onClick={() => setShowNotes(false)}
									preset="white"
									border="gray"
									suffix="notes-header"
								/>
							</div>
						</div>
						<div className="academy-notes-wrapper__input">
							<div
								id="editor"
								ref={editorRef}
								className="academy-notes-wrapper__editable"
								contentEditable={true}
								onInput={handleInput}
							></div>
						</div>
					</div>
				)}
			</div>
		</React.Fragment>
	);
};

export default NoteBook;
