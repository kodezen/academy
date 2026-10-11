import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Field, Select } from '@Components/ui';
import { cn } from '@Utils/cn';
import { runUploader } from '@Utils/helper';

// AcademySelect's own SCSS border (`.academy-custom-select--container`)
// doesn't survive being portaled outside #academywrap (this modal renders
// to document.body — see components/ui/Modal.js), so every Select here
// needs it reinforced as a Tailwind utility, which does still apply there.
// Same descendant-variant approach this file already uses for `invalid`.
const SELECT_BORDER =
	'[&_.academy-custom-select--container]:border [&_.academy-custom-select--container]:border-academy-border [&_.academy-custom-select--container]:rounded';
import {
	bgSizeOptions,
	getFonts,
	getPresets,
	isFontMissing,
	isLandscape,
	orientationOptions,
	pageMetrics,
	pageSizeOptions,
} from './pageSetup';

/**
 * Page setup controls — page size, orientation and the page background.
 *
 * Shared by the create wizard's second step and the Page Setup panel inside
 * the builder, so a background chosen while creating a certificate is changed
 * later through the exact same controls.
 */

/**
 * A little page outline, sized to the real page ratio.
 */
const PageGlyph = ({ landscape, active }) => (
	<span
		className={cn(
			'block rounded-sm border-2 transition-colors',
			landscape ? 'h-6 w-9' : 'h-9 w-6',
			active ? 'border-primary bg-primary-soft' : 'border-academy-border'
		)}
	/>
);

const OrientationPicker = ({ value, onChange }) => (
	<div className="flex gap-3">
		{orientationOptions().map((option) => {
			const active = value === option.value;
			return (
				<button
					type="button"
					key={option.value}
					onClick={() => onChange(option.value)}
					aria-pressed={active}
					className={cn(
						'flex flex-1 cursor-pointer appearance-none items-center gap-3 rounded-lg border bg-academy-surface px-4 py-3 text-sm transition-colors',
						active
							? 'border-primary text-primary font-medium'
							: 'border-academy-border text-academy-text hover:border-primary'
					)}
				>
					<PageGlyph
						landscape={option.value === 'landscape'}
						active={active}
					/>
					{option.label}
				</button>
			);
		})}
	</div>
);

/**
 * Background picker: the current image, the media library, and the bundled
 * designs that match the chosen orientation as one-click swaps.
 */
const BackgroundPicker = ({ config, onChange }) => {
	const landscape = isLandscape(config);
	const designs = getPresets().filter(
		(preset) => (preset.orientation !== 'portrait') === landscape
	);

	const chooseFromLibrary = () =>
		runUploader({
			title: __('Select certificate background', 'academy'),
			library: { type: 'image' },
		}).then((media) => media?.url && onChange({ bgImage: media.url }));

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-start gap-4">
				<div
					className={cn(
						'flex shrink-0 items-center justify-center overflow-hidden rounded-lg !border-2 !border-academy-border !bg-academy-gray bg-cover bg-center',
						landscape ? 'h-[84px] w-[118px]' : 'h-[118px] w-[84px]'
					)}
					style={
						config.bgImage
							? { backgroundImage: `url("${config.bgImage}")` }
							: undefined
					}
				>
					{!config.bgImage && (
						<span className="px-2 text-center text-xs text-academy-gray-dark">
							{__('No background', 'academy')}
						</span>
					)}
				</div>
				<div className="flex flex-col items-start gap-2 pt-1">
					<Button
						variant="outline"
						size="sm"
						onClick={chooseFromLibrary}
					>
						{config.bgImage
							? __('Replace image', 'academy')
							: __('Upload image', 'academy')}
					</Button>
					{!!config.bgImage && (
						<Button
							variant="ghost"
							size="sm"
							className="text-academy-danger"
							onClick={() => onChange({ bgImage: '' })}
						>
							{__('Remove background', 'academy')}
						</Button>
					)}
					<span className="text-xs text-academy-gray-2">
						{__(
							'Use an image at the page ratio for a full-bleed background.',
							'academy'
						)}
					</span>
				</div>
			</div>

			{designs.length > 0 && (
				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium text-academy-gray-2">
						{__('Or pick a bundled design', 'academy')}
					</span>
					<div className="flex flex-wrap gap-2">
						{designs.map((design) => {
							const active = config.bgImage === design.image;
							return (
								<button
									type="button"
									key={design.id}
									title={design.name}
									aria-label={design.name}
									aria-pressed={active}
									onClick={() =>
										onChange({ bgImage: design.image })
									}
									className={cn(
										'h-[46px] w-16 cursor-pointer appearance-none rounded border bg-academy-gray bg-cover bg-center p-0 transition-all',
										active
											? 'border-primary shadow-[0_0_0_2px_color-mix(in_srgb,var(--academy-primary-color)_28%,transparent)]'
											: 'border-academy-border hover:border-primary'
									)}
									style={{
										backgroundImage: `url("${design.image}")`,
									}}
								/>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

const PageSetupFields = ({ config, onChange }) => {
	const { width, height } = pageMetrics(config);
	const patch = (changes) => onChange({ ...config, ...changes });

	return (
		<div className="flex flex-col gap-5">
			<div className="grid gap-5 sm:grid-cols-2">
				<Field
					label={__('Page size', 'academy')}
					htmlFor="academy-cert-page-size"
					help={`${width} × ${height} px`}
				>
					<Select
						id="academy-cert-page-size"
						className={SELECT_BORDER}
						options={pageSizeOptions()}
						value={config.pageSize}
						onChange={(e) => patch({ pageSize: e.target.value })}
					/>
				</Field>

				<Field label={__('Page background colour', 'academy')}>
					<div className="flex items-center gap-2 border border-academy-border rounded p-2">
						<input
							type="color"
							value={config.bgColor || '#FFFFFF'}
							onChange={(e) => patch({ bgColor: e.target.value })}
							aria-label={__('Page background colour', 'academy')}
							// bg-academy-gray, not -surface: the frame around
							// the native swatch needs to read as a distinct
							// box even when the chosen colour is white —
							// white-on-white (the default) otherwise looks
							// background-less. `!` (important): the
							// certificate canvas editor's own global CSS
							// carries an unscoped `input[type=color]{border:
							// ...!important}` rule that otherwise clobbers
							// this regardless of specificity, since it's
							// also on the page while this modal is open.
							className="h-9 w-12 cursor-pointer rounded border-academy-border bg-academy-gray p-1"
						/>
						<span className="text-sm text-academy-gray-2">
							{(config.bgColor || '#FFFFFF').toUpperCase()}
						</span>
					</div>
				</Field>
			</div>

			<Field
				label={__('Default font', 'academy')}
				htmlFor="academy-cert-font"
				help={
					isFontMissing(config.fontFamily)
						? __(
								'This font is not downloaded yet, so it will not show in the preview or PDF. Download fonts from the Certificates page.',
								'academy'
						  )
						: __(
								'Only fonts Academy can embed in the PDF are listed.',
								'academy'
						  )
				}
			>
				<Select
					id="academy-cert-font"
					className={SELECT_BORDER}
					options={getFonts().map((font) => ({
						value: font,
						label: isFontMissing(font)
							? sprintf(
									/* translators: %s: font name. */
									__('%s (not downloaded)', 'academy'),
									font
							  )
							: font,
					}))}
					value={config.fontFamily}
					onChange={(e) => patch({ fontFamily: e.target.value })}
				/>
			</Field>

			<Field label={__('Orientation', 'academy')}>
				<OrientationPicker
					value={isLandscape(config) ? 'landscape' : 'portrait'}
					onChange={(orientation) => patch({ orientation })}
				/>
			</Field>

			<Field label={__('Background image', 'academy')}>
				<BackgroundPicker config={config} onChange={patch} />
			</Field>

			{!!config.bgImage && (
				<Field
					label={__('Background fit', 'academy')}
					htmlFor="academy-cert-bg-size"
					className="max-w-fit border border-academy-border rounded bg-academy-gray p-2"
				>
					<Select
						id="academy-cert-bg-size"
						className={SELECT_BORDER}
						options={bgSizeOptions()}
						value={config.bgSize}
						onChange={(e) => patch({ bgSize: e.target.value })}
					/>
				</Field>
			)}
		</div>
	);
};

export default PageSetupFields;
