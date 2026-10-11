import React from 'react';
import { Panel, PanelBody, PanelRow } from '@wordpress/components';
import SubmitBox from '@Components/SubmitBox';
import FeaturedImage from '@Components/FeaturedImage';

const LessonEditorSidebar = (props) => {
	return (
		<div
			id="postbox-container-1"
			className="postbox-container interface-complementary-area edit-post-sidebar"
		>
			<Panel>
				<PanelBody title="Status & visibility" initialOpen={true}>
					<PanelRow>
						<SubmitBox
							name="lesson_status"
							value={props.values.lesson_status}
							saveValueHandler={props.saveValueHandler}
						/>
					</PanelRow>
				</PanelBody>
				<PanelBody title="Featured image" initialOpen={false}>
					<PanelRow>
						<FeaturedImage
							values={props.values.featured_media}
							saveValueHandler={props.saveValueHandler}
						/>
					</PanelRow>
				</PanelBody>
			</Panel>
		</div>
	);
};
export default LessonEditorSidebar;
