import React from 'react';
import { KodezenPlayer as MediaPlayer } from '@kodezen/player/react';
import '@kodezen/player/styles.css';
import './font.scss';
import useVideoProgressTracking from './useVideoProgressTracking';
import subtitleTracks from './subtitleTracks';

// Learn-page adapter around the tracking-free media player. The library only
// plays and emits progress; everything Academy-specific (server persistence,
// resume, watch-gated auto-completion) lives here.
export default function AcademyLessonPlayer({
	source,
	resumeAt = 0,
	lockSeek = false,
	autoplay = false,
	title = '',
	subtitle = '',
	gate,
	topic,
	courseID,
	onEnded,
}) {
	const { onTimeUpdate, flushNow } = useVideoProgressTracking({
		topic,
		courseID,
		gate,
	});

	return (
		<div className="academy-lesson-player">
			<MediaPlayer
				source={source}
				resumeAt={resumeAt}
				lockSeek={lockSeek}
				autoplay={autoplay}
				title={title}
				tracks={subtitleTracks(subtitle)}
				onTimeUpdate={onTimeUpdate}
				onPause={flushNow}
				onEnded={() => {
					// The server only lets a gated lesson be marked complete
					// once this final reading has landed, so the host's own
					// completion runs after it — not alongside it.
					flushNow().finally(() => {
						if (onEnded) {
							onEnded();
						}
					});
				}}
			/>
		</div>
	);
}
