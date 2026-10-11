import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@Components/ui';
import PageSetupFields from './PageSetupFields';

/**
 * Page Setup panel for an open certificate.
 *
 * The same controls the create wizard's second step uses, so the page size,
 * orientation and background image stay editable for the life of the design.
 * Edits are held locally and only applied on Save, which keeps a half-changed
 * page (say, a portrait size with a landscape background) from reflowing the
 * canvas while the author is still choosing.
 */
const PageSetupModal = ({ isOpen, config, onClose, onApply }) => {
	const [draft, setDraft] = useState(config);

	// Reopening starts from whatever the design currently uses.
	useEffect(() => {
		if (isOpen) {
			setDraft(config);
		}
	}, [isOpen, config]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg"
			title={__('Page Setup', 'academy')}
			footer={
				<>
					<Button variant="outline" onClick={onClose}>
						{__('Cancel', 'academy')}
					</Button>
					<Button onClick={() => onApply(draft)}>
						{__('Save changes', 'academy')}
					</Button>
				</>
			}
		>
			<PageSetupFields config={draft} onChange={setDraft} />
		</Modal>
	);
};

export default PageSetupModal;
