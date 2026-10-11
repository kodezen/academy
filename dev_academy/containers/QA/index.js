import React from 'react';
import SubTopBar from '@Components/SubTopBar';
import QATable from './QATable';
import TopBar from '@Components/TopBar';
import { __ } from '@wordpress/i18n';
import GetHelp from '@Components/GetHelp';

function QA() {
	return (
		<>
			<TopBar
				render={() => (
					<>
						<h3 className="academy-topbar-heading">
							<span className="academy-icon academy-icon--angle-right"></span>
							{__('Question & Answer', 'academy')}
						</h3>
						<GetHelp filterText={['question', 'q&a']} />
					</>
				)}
			/>
			<SubTopBar heading={__('Question & Answer', 'academy')}></SubTopBar>
			<div className="academy-page-content academy-page-content--qa">
				<QATable />
			</div>
		</>
	);
}

export default QA;
