import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Button from '@Components/Button';

// meta.academy_group_plus_price_tiers is stored server-side as a JSON string
// (see academy-pro's Pricing::sanitize_tiers()), not a REST array/object
// schema — parse for editing, re-stringify on every row change so Formik
// state always holds exactly what the REST save expects.
const parseTiers = (raw) => {
	try {
		const parsed = JSON.parse(raw || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		return [];
	}
};

// A group's bulk seat purchase resolves its per-seat price against these
// tiers (academy-pro's Pricing::resolve_unit_price()) — the highest tier
// whose seat count is met, flat across the whole quantity, not graduated.
// No tiers configured means the course's regular price always applies
// regardless of how many seats are bought at once.
const GroupPlusVolumePricing = () => {
	const { values, setFieldValue } = useFormikContext();

	// Read once per mount into a ref, not re-parsed from Formik's `values`
	// on every render: setFieldValue is async, so two edits fired back to
	// back (e.g. typing "10" faster than a render lands, or Formik simply
	// batching) would otherwise both read the same stale `tiers` and the
	// second commit would clobber the first. Mutating the ref synchronously
	// in commit() makes every edit see the latest state regardless of
	// render timing; setFieldValue's own re-render then just reflects it.
	const tiersRef = useRef(null);
	if (tiersRef.current === null) {
		tiersRef.current = parseTiers(
			values?.meta?.academy_group_plus_price_tiers
		);
	}
	const tiers = tiersRef.current;

	const commit = (nextTiers) => {
		tiersRef.current = nextTiers;
		setFieldValue(
			'meta.academy_group_plus_price_tiers',
			JSON.stringify(nextTiers)
		);
	};

	const updateRow = (index, key, value) => {
		commit(
			tiers.map((row, i) =>
				i === index ? { ...row, [key]: value } : row
			)
		);
	};

	const addRow = () => {
		commit([...tiers, { min_seats: '', price: '' }]);
	};

	const removeRow = (index) => {
		commit(tiers.filter((_, i) => i !== index));
	};

	return (
		<section className="academy-group-plus-settings__section flex flex-col gap-4">
			<div className="flex min-w-0 flex-col gap-1">
				<span className="academy-title">
					{__('Volume pricing', 'academy')}
				</span>
				<span className="text-xs leading-5 text-academy-gray-2">
					{__(
						'Lower the per-seat price when a group buys more seats at once. The highest tier a purchase reaches sets the price for every seat. With no tiers, the regular price always applies.',
						'academy'
					)}
				</span>
			</div>

			{tiers.length > 0 && (
				<div
					className="academy-group-plus-settings__tiers flex flex-col gap-2"
					role="table"
					aria-label={__('Volume pricing tiers', 'academy')}
				>
					<div className="grid grid-cols-[1fr_1fr_36px] items-center gap-3" role="row">
						<span className="text-xs font-medium text-academy-gray-2" role="columnheader">
							{__('Minimum seats', 'academy')}
						</span>
						<span className="text-xs font-medium text-academy-gray-2" role="columnheader">
							{__('Price per seat', 'academy')}
						</span>
						<span role="columnheader" />
					</div>
					{tiers.map((row, index) => (
						<div
							className="grid grid-cols-[1fr_1fr_36px] items-center gap-3"
							role="row"
							// eslint-disable-next-line react/no-array-index-key
							key={index}
						>
							<input
								type="number"
								className="academy-input"
								min="1"
								placeholder={__('e.g. 5', 'academy')}
								aria-label={__('Minimum seats', 'academy')}
								value={row.min_seats ?? ''}
								onChange={(e) => {
									const raw = e.target.value;
									updateRow(
										index,
										'min_seats',
										raw === '' ? '' : parseInt(raw, 10)
									);
								}}
							/>
							<input
								type="number"
								className="academy-input"
								min="0"
								step="any"
								placeholder={__('e.g. 90', 'academy')}
								aria-label={__('Price per seat', 'academy')}
								value={row.price ?? ''}
								onChange={(e) =>
									updateRow(index, 'price', e.target.value)
								}
							/>
							<button
								type="button"
								className="academy-group-plus-settings__remove"
								aria-label={__('Remove tier', 'academy')}
								title={__('Remove tier', 'academy')}
								onClick={() => removeRow(index)}
							>
								<span className="academy-icon academy-icon--trash-delete" />
							</button>
						</div>
					))}
				</div>
			)}

			<div>
				<Button
					type="button"
					label={__('Add tier', 'academy')}
					preset="transparent"
					border="gray"
					icon={<span className="academy-icon academy-icon--plus" />}
					onClick={addRow}
					suffix="add-volume-tier-btn"
				/>
			</div>
		</section>
	);
};

export default GroupPlusVolumePricing;
