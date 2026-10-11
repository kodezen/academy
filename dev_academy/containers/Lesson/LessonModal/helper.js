import { IsJsonString } from '@Utils/helper';

export const getLessonInitialValues = (id = null, lessonData = {}) => {
	const schema = {
		lesson_title: '',
		lesson_name: '',
		lesson_content: '',
		lesson_excerpt: '',
		lesson_status: 'publish',
		meta: {
			featured_media: 0,
			attachment: 0,
			is_previewable: false,
			video_duration: { hours: 0, minutes: 0, seconds: 0 },
			video_source: { type: '', url: '', subtitle: 0 },
			scorm_data: null,
			drip_content: {
				schedule_by_date: '',
				schedule_by_enroll_date: 0,
				schedule_by_topic_complete_date: 0,
				schedule_by_prerequisite: [],
			},
		},
	};

	if (id && lessonData) {
		const {
			lesson_status,
			lesson_title,
			lesson_name,
			lesson_content,
			lesson_excerpt,
			lesson_date,
			lesson_date_gmt,
			meta,
		} = lessonData;

		const {
			featured_media,
			attachment,
			is_previewable,
			video_duration,
			video_source,
			drip_content,
			scorm_data,
		} = meta;
		const videoDuration = IsJsonString(video_duration)
			? JSON.parse(video_duration)
			: video_duration;
		const videoSource = IsJsonString(video_source)
			? JSON.parse(video_source)
			: video_source;

		return {
			ID: id,
			lesson_title,
			lesson_name,
			lesson_content: lesson_content?.raw,
			lesson_excerpt,
			lesson_date,
			lesson_date_gmt,
			lesson_status,
			meta: {
				featured_media: featured_media ? parseInt(featured_media) : 0,
				attachment: attachment ? parseInt(attachment) : 0,
				is_previewable: !!is_previewable,
				scorm_data,
				video_duration: {
					hours: videoDuration?.hours
						? parseInt(videoDuration?.hours)
						: 0,
					minutes: videoDuration?.minutes
						? parseInt(videoDuration?.minutes)
						: 0,
					seconds: videoDuration?.seconds
						? parseInt(videoDuration?.seconds)
						: 0,
				},
				video_source: {
					id: videoSource?.id ? videoSource?.id : '',
					type: videoSource?.type ? videoSource?.type : '',
					url: videoSource?.url ? videoSource?.url : '',
					// Subtitle file (.vtt) attachment ID.
					subtitle: videoSource?.subtitle
						? parseInt(videoSource.subtitle)
						: 0,
				},
				is_required_to_attendance: meta?.is_required_to_attendance,
				drip_content: {
					schedule_by_date: drip_content?.schedule_by_date
						? drip_content?.schedule_by_date
						: '',
					schedule_by_enroll_date:
						drip_content?.schedule_by_enroll_date
							? parseInt(drip_content?.schedule_by_enroll_date)
							: 0,
					schedule_by_topic_complete_date:
						drip_content?.schedule_by_topic_complete_date
							? parseInt(
									drip_content?.schedule_by_topic_complete_date
								)
							: 0,
					schedule_by_prerequisite:
						drip_content?.schedule_by_prerequisite
							? drip_content?.schedule_by_prerequisite
							: [],
					schedule_by_topic_unlock_date:
						drip_content?.schedule_by_topic_unlock_date
							? drip_content?.schedule_by_topic_unlock_date
							: 0,
				},
			},
		};
	}
	return schema;
};
