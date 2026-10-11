import React, { useState, useEffect } from 'react';
import ReactModal from '@Components/Modal/ReactModal';
import { API, namespace, is_pro, current_permalink } from '@Utils/helper';
import { reCaptcha } from '@Utils/frontendssr';

export default function PopupLogin() {
	const [modalIsOpen, setModalOpen] = useState(false);
	const [previewContent, setPreviewContent] = useState(false);
	const [portal, hasPortal] = useState(false);

	const openModalHandler = async (button) => {
		const oldInnerHTMLContent = button.innerHTML;
		button.innerHTML =
			'<i class="academy-icon academy-icon--spinner" aria-hidden="true"></i>';
		await API.get(
			`${namespace}popup-login?current_permalink=${current_permalink}`
		).then((res) => {
			button.innerHTML = oldInnerHTMLContent;
			setPreviewContent(res?.data?.markup);
			setModalOpen(true);
		});
	};

	useEffect(() => {
		const buttons = document.querySelectorAll('.academy-btn-popup-login');

		buttons.forEach((button) => {
			button.addEventListener('click', () => {
				openModalHandler(button);
			});

			return () => {
				button.removeEventListener('click');
			};
		});
	}, []);

	useEffect(() => {
		if (
			modalIsOpen &&
			is_pro &&
			window.AcademyGlobal.is_enabled_recaptcha
		) {
			reCaptcha(window.AcademyGlobal.recaptcha_type);
		}
	}, [modalIsOpen]);

	const closeModal = () => setModalOpen(false);

	useEffect(() => {
		if (previewContent) {
			hasPortal(document.querySelector('.ReactModalPortal'));
			if (portal) {
				window.AcademyGlobal.hooks?.doAction(
					'after_dispatch_popup_login_content'
				);
				const toggleIcon = document.querySelector('#password-icon');
				const passwordInput = document.querySelector('#password');
				function togglePasswordVisibility() {
					if (passwordInput.type === 'password') {
						passwordInput.type = 'text';
						toggleIcon.classList.remove('academy-icon--eye');
						toggleIcon.classList.add('academy-icon--lock');
					} else {
						passwordInput.type = 'password';
						toggleIcon.classList.remove('academy-icon--lock');
						toggleIcon.classList.add('academy-icon--eye');
					}
				}
				toggleIcon?.addEventListener('click', function () {
					togglePasswordVisibility();
				});
			}
		}
	}, [previewContent, portal]);

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
						overflowY: 'auto',
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
