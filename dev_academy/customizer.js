import {
	archiveCoursePageUrl,
	archiveBookingPageUrl,
	archiveBookingSinglePageUrl,
	singleCoursePageUrl,
	frontendDashboardPageUrl,
} from './customizer/utils';
import NumberDimension from './customizer/NumberDimension';
import Sortable from './customizer/Sortable';
import Dimensions from './customizer/Dimensions';
import './../assets/scss/customizer.scss';
import './tailwind.css';

// register control type
wp.customize.controlConstructor.academy_number_dimension = NumberDimension;
wp.customize.controlConstructor.academy_sortable = Sortable;
wp.customize.controlConstructor.academy_dimensions = Dimensions;

// section route
wp.customize.section('academy_archive_course', function (section) {
	section.expanded.bind(function (isExpanded) {
		if (isExpanded) {
			wp.customize.previewer.previewUrl.set(archiveCoursePageUrl);
		}
	});
});

wp.customize.section('academy_single_course', function (section) {
	section.expanded.bind(function (isExpanded) {
		if (isExpanded) {
			wp.customize.previewer.previewUrl.set(singleCoursePageUrl);
		}
	});
});
wp.customize.section('academy_archive_tutor_booking', function (section) {
	section.expanded.bind(function (isExpanded) {
		if (isExpanded) {
			wp.customize.previewer.previewUrl.set(archiveBookingPageUrl);
		}
	});
});
wp.customize.section('academy_single_booking', function (section) {
	section.expanded.bind(function (isExpanded) {
		if (isExpanded) {
			wp.customize.previewer.previewUrl.set(archiveBookingSinglePageUrl);
		}
	});
});
wp.customize.section('academy_learn_page', function (section) {
	section.expanded.bind(function (isExpanded) {
		if (isExpanded) {
			wp.customize.previewer.previewUrl.set(
				singleCoursePageUrl + '?source=curriculums'
			);
		}
	});
});

wp.customize.section('academy_frontend_dashboard', function (section) {
	section.expanded.bind(function (isExpanded) {
		if (isExpanded) {
			wp.customize.previewer.previewUrl.set(frontendDashboardPageUrl);
		}
	});
});
