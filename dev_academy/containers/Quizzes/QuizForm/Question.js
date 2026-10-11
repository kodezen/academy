import { API, namespace, sliceString } from '@Utils/helper';
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import OptionMenu from '@Components/OptionMenu';
import { useDispatch } from 'react-redux';
import { showNotification } from '@Redux/Slices/notificationSlice/notificationSlice';

const propTypes = {};

export default function Question({
	data,
	openQuestionModalHandler,
	arrayHelpers,
	index,
	editBtnLoading,
}) {
	const [deleteBtnLoader, setDeleteBtnLoader] = useState(false);
	const dispatch = useDispatch();
	const onClickDeleteHandler = () => {
		setDeleteBtnLoader(true);
		// eslint-disable-next-line
		if (window.confirm(__('Are you sure?', 'academy'))) {
			API.post(
				`${namespace}quiz_questions/${parseInt(data.id)}`,
				{},
				{
					headers: {
						'X-HTTP-Method-Override': 'DELETE',
					},
				}
			).then(() => {
				setDeleteBtnLoader(false);
				arrayHelpers.remove(index);
				dispatch(
					showNotification({
						message: __('Question Deleted', 'academy'),
						isShow: true,
						type: 'success',
					})
				);
			});
		} else {
			setDeleteBtnLoader(false);
		}
	};

	return (
		<React.Fragment>
			<div className="academy-question" key={index}>
				<div className="academy-question-title">
					<span className="academy-icon academy-icon--drag"></span>
					<span className="test">{`${index + 1}. ${sliceString(
						data?.title,
						50,
						'...'
					)}`}</span>
				</div>
				<OptionMenu
					icon="three-dots-menu"
					suffix="question"
					options={[
						{
							type: 'button',
							label: __('Edit', 'academy'),
							icon: (
								<span className="academy-icon academy-icon--edit-two"></span>
							),
							isLoading:
								editBtnLoading === data.id ? true : false,
							onClick: () => openQuestionModalHandler(data),
						},
						{
							type: 'button',
							label: __('Delete', 'academy'),
							suffix: 'trash',
							icon: (
								<span className="academy-icon academy-icon--trash-delete" />
							),
							isLoading: deleteBtnLoader,
							onClick: () => onClickDeleteHandler(),
						},
					]}
				/>
			</div>
		</React.Fragment>
	);
}

Question.propTypes = propTypes;
