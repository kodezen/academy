import React from 'react';
import { __ } from '@wordpress/i18n';
import Icon from '../Icons';
import { Chapter, Row } from '../parts';
import { Shot } from '../media';

const Player = () => (
	<Chapter
		id="awn-player"
		tone="wash"
		head={{
			solo: true,
			title: __('Kodezen Player', 'academy'),
			desc: __(
				'A new video player and a read-aloud reader, so every kind of lesson is easier to follow and harder to skip.',
				'academy'
			),
		}}
	>
		<Row
			title={__('Only watched video counts', 'academy')}
			body={__(
				'The new player picks up where the student stopped and marks a lesson complete only after enough of it has been watched.',
				'academy'
			)}
			bullets={[
				__('Resume from the last position', 'academy'),
				__('Completion threshold: how much must be watched', 'academy'),
				__('Minimum watch time for external videos', 'academy'),
				__('Skipping ahead can be blocked', 'academy'),
			]}
			media={
				<div className="awn-frame awn-frame--shot">
					<Shot
						file="f-learn-video.webp"
						alt={__('Video lesson playing in the Kodezen Player', 'academy')}
					/>
				</div>
			}
		/>

		<Row
			flip
			title={__('Lessons that read themselves aloud', 'academy')}
			body={__(
				'A read-aloud button turns any text lesson into audio, for students who learn better by listening or who need it for accessibility.',
				'academy'
			)}
			media={
				<div className="awn-frame awn-frame--shot">
					<Shot
						file="f-learn-v2.webp"
						alt={__('A text lesson on the new learn page, ready to be read aloud', 'academy')}
					/>
				</div>
			}
		/>

		<div className="awn-duo">
			<div className="awn-duo__card">
				<Shot
					file="learn-mobile.webp"
					className="awn-shot--phone"
					alt={__('Learn page on a phone with the lesson open and the curriculum closed', 'academy')}
				/>
				<h4>
					<Icon name="phone" size={16} /> {__('On a phone', 'academy')}
				</h4>
				<p>{__('The same drawers and controls, sized for one thumb.', 'academy')}</p>
			</div>
			<div className="awn-duo__card">
				<Shot
					file="learn-block-editor.webp"
					alt={__('The block learn page open in the block editor', 'academy')}
				/>
				<h4>
					<Icon name="blocks" size={16} /> {__('Block learn page', 'academy')}
				</h4>
				<p>{__('Built from blocks: remove parts, reorder them or style each one in the editor.', 'academy')}</p>
			</div>
		</div>
	</Chapter>
);

export default Player;
