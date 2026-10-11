import React, { useState, useEffect } from 'react';
import ReactModal from '@Components/Modal/ReactModal';
import { makeRequest } from '@Utils/helper';

export default function WishList() {
	const [modalIsOpen, setIsOpen] = useState(false);
	const [previewContent, setPreviewContent] = useState(false);
	const openModal = (button, target) => {
		const oldInnerHTMLContent = button.innerHTML;
		button.innerHTML =
			'<i class="academy-icon academy-icon--spinner" aria-hidden="true"></i>';
		const courseId = target.getAttribute('data-course-id');
		const showLabel = target.getAttribute('data-show-label');
		makeRequest({
			action: 'academy/course_add_to_wishlist',
			course_id: courseId,
		}).then((res) => {
			if (res.data.success) {
				if (showLabel) {
					button.innerHTML = `<i class="academy-icon academy-icon--${
						res.data?.data?.is_added ? 'heart' : 'heart-o'
					}" aria-hidden="true"></i>${
						res.data?.data?.is_added ? 'WishListed' : 'WishList'
					}`;
				} else {
					button.innerHTML = `<i class="academy-icon academy-icon--${
						res.data?.data?.is_added ? 'heart' : 'heart-o'
					}" aria-hidden="true"></i>`;
				}
			} else {
				button.innerHTML = oldInnerHTMLContent;
				if (res.data?.data?.redirect_url) {
					window.location =
						res.data?.data?.redirect_url + '?nocache=' + Date.now();
				} else {
					setIsOpen(true);
					setPreviewContent(res.data?.data?.markup);
				}
			}
		});
	};

	useEffect(() => {
		const buttons = document.querySelectorAll('.academy-add-wishlist-btn');

		buttons.forEach((button) => {
			const handleClick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				openModal(button, e.target);
			};

			button.addEventListener('click', handleClick);

			return () => {
				button.removeEventListener('click', handleClick);
			};
		});
	}, []);

	const closeModal = () => setIsOpen(false);

	return (
		<React.Fragment>
			<ReactModal
				isOpen={modalIsOpen}
				onRequestClose={closeModal}
				suffix="popup-login"
				isEnabledHeader={false}
				size="medium"
				style={{
					overlay: {
						background: 'rgba(35, 40, 45, 0.62)',
						overflow: 'visible',
						display: 'flex',
						justifyContent: 'center',
						zIndex: 9999,
					},
					content: {
						inset: 'unset',
						padding: 0,
						border: 0,
						marginTop: '50px',
						overflow: 'visible',
					},
				}}
			>
				<div dangerouslySetInnerHTML={{ __html: previewContent }}></div>
			</ReactModal>
		</React.Fragment>
	);
}
