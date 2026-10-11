/*
 * Vanilla-JS drawer controller for the PHP-rendered learn page.
 * Mirrors the React <LearnDrawer> behaviour so the PHP path can reuse the same
 * markup + shared SCSS (.academy-learn-drawer / .academy-learn-drawer-scrim).
 *
 * Markup contract:
 *   trigger:  <button data-academy-drawer-open="curriculum">…</button>
 *   drawer:   <aside class="academy-learn-drawer academy-learn-drawer--left"
 *                    id="academy-drawer-curriculum" data-academy-drawer="curriculum">…</aside>
 *   close:    any element with [data-academy-drawer-close] inside the drawer
 *   scrim:    a single <div class="academy-learn-drawer-scrim"> (auto-created)
 */
import { __ } from '@wordpress/i18n';
import { academy_nonce, ajaxurl } from '@Utils/helper';

// Top-bar "more options" menu (Favorite / Share / Close) + favorite toggle.
function initPhpTopbarMenu() {
	document.querySelectorAll('[data-academy-menu]').forEach((menu) => {
		const toggle = menu.querySelector('.academy-lesson-menu__toggle');
		if (!toggle) {
			return;
		}
		toggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const open = menu.classList.toggle('academy-lesson-menu--open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
	});
	document.addEventListener('click', (e) => {
		document
			.querySelectorAll('[data-academy-menu].academy-lesson-menu--open')
			.forEach((menu) => {
				if (!menu.contains(e.target)) {
					menu.classList.remove('academy-lesson-menu--open');
				}
			});
	});

	document.querySelectorAll('.academy-favorite-toggle').forEach((btn) => {
		btn.addEventListener('click', () => {
			const courseId = btn.getAttribute('data-course-id');
			const fd = new FormData();
			fd.append('action', 'academy/course_add_to_favorite');
			fd.append('security', academy_nonce);
			fd.append('course_id', courseId);
			fetch(ajaxurl, {
				method: 'POST',
				body: fd,
				credentials: 'same-origin',
			})
				.then((r) => r.json())
				.then((res) => {
					if (!res || !res.success) {
						return;
					}
					const added = !!(res.data && res.data.is_added);
					const icon = btn.querySelector('.academy-icon');
					const label = btn.querySelector(
						'.academy-favorite-toggle__label'
					);
					btn.setAttribute('data-favorited', added ? '1' : '0');
					if (icon) {
						icon.className = `academy-icon ${
							added
								? 'academy-icon--star'
								: 'academy-icon--empty-star'
						}`;
					}
					if (label) {
						label.textContent = added
							? __('Remove from favorites', 'academy')
							: __('Add to favorites', 'academy');
					}
				})
				.catch(() => {});
		});
	});
}

export default function initPhpLearnDrawers() {
	initPhpTopbarMenu();

	const drawers = Array.from(
		document.querySelectorAll('[data-academy-drawer]')
	);
	if (!drawers.length) {
		return;
	}

	// one shared scrim
	let scrim = document.querySelector('.academy-learn-drawer-scrim');
	if (!scrim) {
		scrim = document.createElement('div');
		scrim.className = 'academy-learn-drawer-scrim';
		document.body.appendChild(scrim);
	}

	const closeAll = () => {
		drawers.forEach((d) =>
			d.classList.remove('academy-learn-drawer--open')
		);
		scrim.classList.remove('academy-learn-drawer-scrim--open');
	};

	const openDrawer = (name) => {
		const drawer = drawers.find(
			(d) => d.getAttribute('data-academy-drawer') === name
		);
		if (!drawer) {
			return;
		}
		// push mode keeps content beside the drawer (no scrim); overlay dims it
		const isPush =
			drawer.getAttribute('data-academy-drawer-mode') === 'push';
		closeAll();
		drawer.classList.add('academy-learn-drawer--open');
		if (!isPush) {
			scrim.classList.add('academy-learn-drawer-scrim--open');
		}
	};

	document.querySelectorAll('[data-academy-drawer-open]').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			openDrawer(btn.getAttribute('data-academy-drawer-open'));
		});
	});

	document.querySelectorAll('[data-academy-drawer-close]').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			closeAll();
		});
	});

	scrim.addEventListener('click', closeAll);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeAll();
		}
	});

	// Auto-close overlay drawers when a curriculum topic link is clicked.
	document
		.querySelectorAll(
			'[data-academy-drawer] a[href], [data-academy-drawer] .academy-learn-page-topics-lesson-item__btn'
		)
		.forEach((link) => {
			link.addEventListener('click', () => {
				const drawer = link.closest('[data-academy-drawer]');
				if (
					drawer &&
					drawer.getAttribute('data-academy-drawer-mode') !== 'push'
				) {
					closeAll();
				}
			});
		});
}
