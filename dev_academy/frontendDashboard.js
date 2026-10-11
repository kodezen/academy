/* eslint-disable no-undef */
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@Redux/store';
import {
	runUploader,
	plugin_root_url,
	makeRequest,
	notification,
	is_pro,
} from '@Utils/helper';
import { BrowserRouter as Router } from 'react-router-dom';
import UserDashboard from '@Containers/frontend-dashboard';
import Notifications from '@Components/Notifications';
import FrontendModal from '@Containers/frontend-modal';
import './../assets/scss/frontendDashboard.scss';
import './tailwind.css';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('academyFrontendModalWrap');
	// frontendCommon and frontendDashboard both load on the dashboard; the
	// first one to get here mounts the modal, the other leaves it be.
	if (container && !container.dataset.academyMounted) {
		container.dataset.academyMounted = '1';
		const root = createRoot(container);
		root.render(
			<Provider store={store}>
				<FrontendModal />
			</Provider>
		);
	}
});

const frontendDashboard = () => {
	const container = document.getElementById(
		'academy_frontend_dashboard_react_render'
	);
	if (container) {
		const root = createRoot(container);
		root.render(
			<Provider store={store}>
				<Router>
					<UserDashboard
						path={container.getAttribute('path')}
						subPath={container.getAttribute('sub-path')}
					/>
				</Router>
			</Provider>
		);
	}
};

document.addEventListener('DOMContentLoaded', frontendDashboard);

// instructor menu toggle
document.addEventListener('DOMContentLoaded', () => {
	const sideBar = document.getElementById(
		'academy-frontend-dashboard-sidebar'
	);
	const menu = document.querySelectorAll('#academy-dashboard-menu')[0];
	const menuOpenButton = document.querySelectorAll(
		'#academy-collapsible-menu-open-button'
	)[0];
	const menuCloseButton = document.querySelectorAll(
		'#academy-collapsible-menu-close-button'
	)[0];
	const menuItemLabel = document.querySelectorAll(
		'.academy-dashboard-menu__item-label'
	);
	const userDropdownIcon = document.querySelectorAll(
		'#user-dropdown-icon'
	)[0];
	const userAvatar = document.querySelectorAll(
		'.academy-frontend-dashboard__user'
	)[0];
	// The block dashboard draws its own menu and runs its own script.
	if (!sideBar || !menu || !menuOpenButton || !menuCloseButton) {
		return;
	}

	// Customize → Student Dashboard can start the menu collapsed on large
	// screens; once someone opens or closes it, their choice wins.
	const startCollapsed = document.body.classList.contains(
		'academy-dashboard-body--collapsed'
	);
	let chosen = '';

	// Function to handle screen size change
	function handleResize() {
		if (window.innerWidth <= 1025) {
			handleMenuToggleClose();
		} else if ('open' === chosen || (!chosen && !startCollapsed)) {
			handleMenuToggleOpen();
		} else {
			handleMenuToggleClose();
		}
	}

	const handleMenuToggleClose = () => {
		// add class from menu
		menu.classList.add('academy-dashboard-menu--compact');
		userDropdownIcon.style.display = 'none';
		menuCloseButton.style.display = 'none';
		menuOpenButton.style.display = 'flex';

		if (window.innerWidth >= 768) {
			userAvatar.classList.add(
				'academy-frontend-dashboard--user-compact'
			);
		} else {
			sideBar.classList.add('academy-frontend-dashboard--mobile-view');
		}

		// hide menu item's label
		Object.entries(menuItemLabel).forEach((labelElement) => {
			labelElement[1].style.display = 'none';
		});
	};
	const handleMenuToggleOpen = () => {
		// remove class from menu
		menu.classList.remove('academy-dashboard-menu--compact');
		userDropdownIcon.style.display = 'block';
		menuOpenButton.style.display = 'none';
		menuCloseButton.style.display = 'flex';

		if (window.innerWidth >= 768) {
			userAvatar.classList.remove(
				'academy-frontend-dashboard--user-compact'
			);
		} else {
			sideBar.classList.remove('academy-frontend-dashboard--mobile-view');
		}

		// show menu item's label
		Object.entries(menuItemLabel).forEach((labelElement) => {
			labelElement[1].style.display = 'block';
		});
	};

	handleResize();
	// Event listener for screen resize
	window.addEventListener('resize', handleResize);
	menuCloseButton.addEventListener('click', () => {
		chosen = 'closed';
		handleMenuToggleClose();
	});
	menuOpenButton.addEventListener('click', () => {
		chosen = 'open';
		handleMenuToggleOpen();
	});
});

// avatar menu toggler
document.addEventListener('DOMContentLoaded', () => {
	const userAvatar = document.querySelectorAll('#user-avatar')[0];
	const userAvatarDropdown = document.querySelectorAll(
		'#user-avatar-dropdown'
	)[0];
	if (!userAvatar || !userAvatarDropdown) {
		return;
	}

	document.addEventListener('click', function isClickOutside(event) {
		if (
			!userAvatar.contains(event.target) &&
			!userAvatarDropdown.contains(event.target)
		) {
			userAvatarDropdown.classList.remove(
				'academy-frontend-dashboard__user-dropdown-visible'
			);
		}
	});

	userAvatar.addEventListener('click', () => {
		if (
			userAvatarDropdown.classList.contains(
				'academy-frontend-dashboard__user-dropdown-visible'
			)
		) {
			userAvatarDropdown.classList.remove(
				'academy-frontend-dashboard__user-dropdown-visible'
			);
		} else {
			userAvatarDropdown.classList.add(
				'academy-frontend-dashboard__user-dropdown-visible'
			);
		}
	});
});

// instructor profile photo and cover photo upload
document.addEventListener('DOMContentLoaded', function () {
	const paypal = document.querySelector('#paypal-label');
	const bank = document.querySelector('#bank-label');
	const eCheck = document.querySelector('#echeck-label');
	const paypalForm = document.querySelector('#paypal');
	const bankForm = document.querySelector('#bank');
	const eCheckForm = document.querySelector('#echeck');

	const handleActiveClassToggle = (elementOne, elementTwo, elementThree) => {
		if (elementOne) {
			elementOne.classList.add('academy-withdraw-method--selected');
		}
		if (elementTwo) {
			elementTwo.classList.remove('academy-withdraw-method--selected');
		}
		if (elementThree) {
			elementThree.classList.remove('academy-withdraw-method--selected');
		}
	};
	const handleActiveFormToggle = (elementOne, elementTwo, elementThree) => {
		if (elementOne) {
			elementOne.classList.add('academy-withdraw-method-form--active');
		}
		if (elementTwo) {
			elementTwo.classList.remove('academy-withdraw-method-form--active');
		}
		if (elementThree) {
			elementThree.classList.remove(
				'academy-withdraw-method-form--active'
			);
		}
	};

	if (paypal) {
		paypal.addEventListener('click', () => {
			handleActiveClassToggle(paypal, bank, eCheck);
			handleActiveFormToggle(paypalForm, bankForm, eCheckForm);
		});
	}

	if (bank) {
		bank.addEventListener('click', () => {
			handleActiveClassToggle(bank, paypal, eCheck);
			handleActiveFormToggle(bankForm, paypalForm, eCheckForm);
		});
	}
	if (eCheck) {
		eCheck.addEventListener('click', () => {
			handleActiveClassToggle(eCheck, paypal, bank);
			handleActiveFormToggle(eCheckForm, paypalForm, bankForm);
		});
	}
});

document.addEventListener('DOMContentLoaded', function () {
	// upload buttons
	const profileUploadBtn = document.querySelectorAll(
		'.academy-upload-profile-photo'
	)[0];
	const coverUploadBtn = document.querySelectorAll(
		'.academy-upload-cover-photo'
	)[0];
	// input fields
	const coverField = document.querySelectorAll('#academy-cover-photo-url')[0];
	const profilePhotoField = document.querySelectorAll(
		'#academy-profile-photo-url'
	)[0];

	// url div's
	const profilePhoto = document.querySelectorAll('.academy-profile-photo')[0];
	const coverPhoto = document.querySelectorAll('.academy-cover-photo')[0];

	// cover remove button
	const removeCoverPhoto = document.querySelectorAll(
		'.academy-delete-cover-photo'
	)[0];

	if (removeCoverPhoto) {
		removeCoverPhoto.addEventListener('click', () => {
			coverPhoto.style.backgroundImage = `url(${plugin_root_url}assets/images/banner.jpg)`;
		});
	}

	if (profileUploadBtn) {
		profileUploadBtn.addEventListener('click', () => {
			runUploader().then((res) => {
				profilePhotoField.value = res.url;
				profilePhoto.style.backgroundImage = `url(${res.url})`;
			});
		});
	}

	if (profileUploadBtn) {
		coverUploadBtn.addEventListener('click', () => {
			runUploader().then((res) => {
				coverField.value = res.url;
				coverPhoto.style.backgroundImage = `url(${res.url})`;
			});
		});
	}
});

jQuery(window).on('elementor/frontend/init', () => {
	if (window.elementorFrontendConfig.environmentMode.edit) {
		elementorFrontend.hooks.addAction(
			'frontend/element_ready/academyea-dashboard.default',
			function () {
				frontendDashboard();
			}
		);
	}
});

document.addEventListener('DOMContentLoaded', function () {
	const NotificationContainer = document.querySelector(
		'#academy-notification'
	);

	// Render the React component into the targeted element
	if (NotificationContainer) {
		createRoot(NotificationContainer).render(
			<Provider store={store}>
				<Notifications />
			</Provider>
		);
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const resetBtns = document.querySelectorAll('.user-device-reset');
	if (resetBtns.length > 0) {
		resetBtns.forEach((resetBtn) => {
			resetBtn.addEventListener('click', () => {
				makeRequest({
					action: 'academy_pro/frontend/user_login_session_remove',
					name: resetBtn.getAttribute('data-reset'),
				}).then((response) => {
					if (response?.data?.success) {
						console.log(resetBtn.getAttribute('data-reset'));
						notification('success', response.data.data);
						setTimeout(() => {
							window.location.reload();
						}, 2000);
					} else {
						notification('error', response.data.data);
					}
				});
			});
		});
	}
});
