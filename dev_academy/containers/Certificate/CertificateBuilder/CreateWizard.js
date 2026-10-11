import React, { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Button, Field, Input, Modal, Stepper } from '@Components/ui';
import { cn } from '@Utils/cn';
import PageSetupFields from './PageSetupFields';
import { DEFAULT_PAGE_CONFIG, getPresets, isLandscape } from './pageSetup';

/**
 * "Create New Certificate" wizard.
 *
 * Two steps: pick a starting design, then configure the page it prints on.
 * Choosing a design seeds the page setup with that design's orientation and
 * background, so the second step starts from a sensible page and only has to
 * be touched when the author wants something else. Everything set here is
 * editable afterwards from the builder's Page Setup panel.
 */

const STEPS = [
	{ key: 'design', label: __('Starting design', 'academy') },
	{ key: 'page', label: __('Page setup', 'academy') },
];

/**
 * One design tile, drawn at the real page ratio so the shape reads at a glance.
 */
const DesignTile = ({ label, image, landscape, active, onClick }) => (
	<button
		type="button"
		onClick={onClick}
		aria-pressed={active}
		className={cn(
			'group relative flex cursor-pointer appearance-none flex-col overflow-hidden rounded-lg border bg-academy-surface p-0 text-left transition-all',
			active
				? 'border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--academy-primary-color)_20%,transparent)]'
				: 'border-academy-border hover:border-primary'
		)}
	>
		<span
			className={cn(
				'flex items-center justify-center bg-academy-gray bg-contain bg-center bg-no-repeat',
				landscape ? 'aspect-[297/210]' : 'aspect-[210/297]'
			)}
			style={image ? { backgroundImage: `url("${image}")` } : undefined}
		>
			{!image && (
				<span className="text-xs font-medium text-academy-gray-dark">
					{__('Blank page', 'academy')}
				</span>
			)}
		</span>
		<span
			className={cn(
				'border-t border-academy-border px-2 py-1.5 text-center text-xs',
				active ? 'font-medium text-primary' : 'text-academy-gray-2'
			)}
		>
			{label}
		</span>
		{active && (
			<span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M10 3L4.5 8.5L2 6"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		)}
	</button>
);

const DesignGroup = ({ title, children }) => (
	<div className="flex flex-col gap-2">
		<span className="text-xs font-semibold uppercase tracking-wide text-academy-gray-2">
			{title}
		</span>
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
	</div>
);

const CreateWizard = ({ isOpen, isCreating = false, onClose, onCreate }) => {
	const presets = getPresets();
	const [step, setStep] = useState('design');
	const [name, setName] = useState(__('Untitled Certificate', 'academy'));
	const [designId, setDesignId] = useState(null); // null = blank page
	const [pageConfig, setPageConfig] = useState({ ...DEFAULT_PAGE_CONFIG });

	const groups = useMemo(
		() => ({
			landscape: presets.filter((p) => p.orientation !== 'portrait'),
			portrait: presets.filter((p) => p.orientation === 'portrait'),
		}),
		[presets]
	);

	if (!isOpen) {
		return null;
	}

	// Picking a design is also a page decision: it fixes the orientation the
	// artwork was drawn for and becomes the page background.
	const selectDesign = (preset) => {
		setDesignId(preset ? preset.id : null);
		setPageConfig((current) => ({
			...current,
			bgImage: preset ? preset.image : '',
			orientation: preset
				? (preset.orientation === 'portrait' && 'portrait') ||
					'landscape'
				: current.orientation,
		}));
	};

	const submit = () =>
		onCreate(
			name.trim() || __('Untitled Certificate', 'academy'),
			pageConfig,
			null === designId // Blank → a correctly sized but empty page.
		);

	const footer =
		'design' === step ? (
			<>
				<Button variant="outline" onClick={onClose}>
					{__('Cancel', 'academy')}
				</Button>
				<Button onClick={() => setStep('page')}>
					{__('Next: Page setup', 'academy')}
				</Button>
			</>
		) : (
			<>
				<Button
					variant="outline"
					disabled={isCreating}
					onClick={() => setStep('design')}
				>
					{__('Back', 'academy')}
				</Button>
				<Button disabled={isCreating} onClick={submit}>
					{isCreating
						? __('Creating…', 'academy')
						: __('Create Certificate', 'academy')}
				</Button>
			</>
		);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={__('Create New Certificate', 'academy')}
			footer={footer}
		>
			<Stepper
				steps={STEPS}
				value={step}
				variant="checklist"
				onChange={setStep}
				className="mb-6"
			/>

			{'design' === step ? (
				<div className="flex flex-col gap-5">
					<Field
						label={__('Certificate name', 'academy')}
						htmlFor="academy-cert-name"
					>
						<Input
							id="academy-cert-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={__(
								'e.g. Course Completion Certificate',
								'academy'
							)}
						/>
					</Field>

					<DesignGroup title={__('Start from scratch', 'academy')}>
						<DesignTile
							label={__('Blank', 'academy')}
							image=""
							landscape={isLandscape(pageConfig)}
							active={null === designId}
							onClick={() => selectDesign(null)}
						/>
					</DesignGroup>

					{groups.landscape.length > 0 && (
						<DesignGroup title={__('Landscape designs', 'academy')}>
							{groups.landscape.map((preset) => (
								<DesignTile
									key={preset.id}
									label={preset.name}
									image={preset.image}
									landscape
									active={designId === preset.id}
									onClick={() => selectDesign(preset)}
								/>
							))}
						</DesignGroup>
					)}

					{groups.portrait.length > 0 && (
						<DesignGroup title={__('Portrait designs', 'academy')}>
							{groups.portrait.map((preset) => (
								<DesignTile
									key={preset.id}
									label={preset.name}
									image={preset.image}
									landscape={false}
									active={designId === preset.id}
									onClick={() => selectDesign(preset)}
								/>
							))}
						</DesignGroup>
					)}

					{0 === presets.length && (
						<p className="m-0 text-sm text-academy-gray-2">
							{__(
								'No bundled designs are available. Start from a blank page and add your own background in the next step.',
								'academy'
							)}
						</p>
					)}
				</div>
			) : (
				<PageSetupFields config={pageConfig} onChange={setPageConfig} />
			)}
		</Modal>
	);
};

export default CreateWizard;
