import React from 'react';
import SetupForm from '../../setupForm';
import './styles.scss';

export default function Settings() {
	return (
		<React.Fragment>
			<div
				className="academy-setup-screen--fourth"
				style={{ minHeight: `${window.innerHeight - 16 - 60}px` }}
			>
				<SetupForm />
			</div>
		</React.Fragment>
	);
}
