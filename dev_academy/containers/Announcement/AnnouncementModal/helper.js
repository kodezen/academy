export const getInitialValues = (id = null, formData = []) => {
	const schema = {
		status: 'publish',
		title: '',
		content: '',
		date: '',
		meta: {
			academy_announcements_course_ids: [],
		},
	};

	if (id && formData) {
		const { status, title, content, date, meta } = formData;

		const { academy_announcements_course_ids } = meta;

		return {
			ID: id,
			status,
			title: title.raw,
			content: content.raw,
			date: date ? date : '',
			meta: {
				academy_announcements_course_ids,
			},
		};
	}
	return schema;
};
