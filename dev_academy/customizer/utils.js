/* eslint-disable no-undef, camelcase  */
export const {
	archiveCoursePageUrl,
	archiveBookingPageUrl,
	archiveBookingSinglePageUrl,
	frontendDashboardPageUrl,
	singleCoursePageUrl,
} = window.academyCustomizerSettings;
export const controlBase = {
	/**
	 * Initialize.
	 *
	 * @param {string} id     - Control ID.
	 * @param {Object} params - Control params.
	 */
	initialize(id, params) {
		const control = this;

		// Bind functions to this control context for passing as React props.
		control.updateSetting = control.updateSetting.bind(control);
		control.setNotificationContainer =
			control.setNotificationContainer.bind(control);

		wp.customize.Control.prototype.initialize.call(control, id, params);

		// The following should be eliminated with <https://core.trac.wordpress.org/ticket/31334>.
		function onRemoved(removedControl) {
			if (control === removedControl) {
				control.destroy();
				control.container.remove();
				wp.customize.control.unbind('removed', onRemoved);
			}
		}
		wp.customize.control.bind('removed', onRemoved);
	},

	/**
	 * Update setting with new props.
	 *
	 * @param {Object} props - New props to set in the setting (model).
	 * @return {void}
	 */
	updateSetting: function updateSetting(props) {
		const control = this;
		control.setting.set({
			...control.setting.get(),
			...props,
		});
	},

	/**
	 * Set notification container and render.
	 *
	 * This is called when the React component is mounted.
	 *
	 * @param {Element} element - Notification container.
	 * @return {void}
	 */
	setNotificationContainer: function setNotificationContainer(element) {
		const control = this;
		control.notifications.container = jQuery(element);
		control.notifications.render();
	},

	/**
	 * After control has been first rendered, start re-rendering when setting changes.
	 *
	 * React is able to be used here instead of the wp.customize.Element abstraction.
	 *
	 * @return {void}
	 */
	ready: function ready() {
		const control = this;

		// Re-render control when setting changes.
		control.setting.bind(() => {
			control.renderContent();
		});
	},

	/**
	 * Handle removal/de-registration of the control.
	 *
	 * @return {void}
	 */
	destroy: function destroy() {
		const control = this;

		// Garbage collection: undo mounting that was done in the embed/renderContent method.
		ReactDOM.unmountComponentAtNode(control.container[0]); //eslint-disable-line

		// Call destroy method in parent if it exists (as of #31334).
		if (wp.customize.Control.prototype.destroy) {
			wp.customize.Control.prototype.destroy.call(control);
		}
	},
};
