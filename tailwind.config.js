/**
 * Tailwind config for the Academy admin app.
 *
 * Scoping strategy (matches the house pattern used across the other plugins):
 * - `preflight` is OFF so Tailwind's base reset never leaks into WP admin
 *   chrome or the existing SCSS-styled surfaces.
 * - No global prefix: existing markup is namespaced with `academy-*` class
 *   names, which never collide with Tailwind utilities (`flex`, `p-4`, ...).
 * - Colors are wired to the existing `--academy-*` CSS custom properties
 *   (defined in assets/scss/common/_global.scss) so a single token source
 *   keeps SCSS and Tailwind in sync and lets a future dark mode flip vars.
 *
 * The `content` globs cover the free plugin AND the sibling academy-pro dev
 * source, because pro aliases `@Components`/`@Containers` back into this
 * plugin and both apps compile against this same design system.
 */
module.exports = {
	corePlugins: {
		preflight: false,
	},
	content: [
		'./dev_academy/**/*.{js,jsx}',
		'../academy-pro/dev_academy-pro/**/*.{js,jsx}',
	],
	theme: {
		extend: {
			colors: {
				// NOTE: token colors are `var()` refs, so Tailwind's `/opacity`
				// modifier (e.g. `bg-primary/10`) SILENTLY EMITS NOTHING. Never
				// use `/<opacity>` on these — use the explicit `*-tint` / `*-ring`
				// color-mix tokens below instead (mirrors the existing SCSS which
				// already uses color-mix for translucent brand fills).
				primary: {
					DEFAULT: 'var(--academy-primary-color)',
					soft: 'var(--academy-secondary-color)',
					tint: 'color-mix(in srgb, var(--academy-primary-color) 12%, transparent)',
					ring: 'color-mix(in srgb, var(--academy-primary-color) 30%, transparent)',
				},
				academy: {
					text: 'var(--academy-text-color)',
					'text-black': 'var(--academy-text-color-black)',
					border: 'var(--academy-border-color)',
					surface: 'var(--academy-surface-color)',
					gray: 'var(--academy-gray-color)',
					'gray-2': 'var(--academy-secondary-gray-color)',
					'gray-dark': 'var(--academy-dark-gray-color)',
					'gray-bg': 'var(--academy-background-gray-color)',
					heading: 'var(--academy-heading-color)',
					description: 'var(--academy-description-color)',
					'icon-inactive': 'var(--academy-icon-inactive-color)',
					divider: 'var(--academy-divider-color)',
					success: 'var(--academy-success-color)',
					'success-tint': 'color-mix(in srgb, var(--academy-success-color) 12%, transparent)',
					danger: 'var(--academy-danger-color)',
					'danger-tint': 'color-mix(in srgb, var(--academy-danger-color) 12%, transparent)',
					'danger-ring': 'color-mix(in srgb, var(--academy-danger-color) 30%, transparent)',
					warning: 'var(--academy-warning-color)',
					'warning-tint': 'color-mix(in srgb, var(--academy-warning-color) 12%, transparent)',
				},
			},
			// Each size ships with its line height (GemCRM's scale), so text
			// sizes stay on one rhythm instead of ad-hoc `text-[13px]` values.
			fontSize: {
				11: [ '0.6875rem', { lineHeight: '1rem' } ], // 11 / 16
				xs: [ '0.75rem', { lineHeight: '1rem' } ], // 12 / 16
				13: [ '0.8125rem', { lineHeight: '1.125rem' } ], // 13 / 18
				sm: [ '0.875rem', { lineHeight: '1.25rem' } ], // 14 / 20
				15: [ '0.9375rem', { lineHeight: '1.375rem' } ], // 15 / 22
				base: [ '1rem', { lineHeight: '1.5rem' } ], // 16 / 24
				lg: [ '1.125rem', { lineHeight: '1.75rem' } ], // 18 / 28
				xl: [ '1.25rem', { lineHeight: '1.75rem' } ], // 20 / 28
				'2xl': [ '1.5rem', { lineHeight: '2rem' } ], // 24 / 32
			},
			borderColor: {
				DEFAULT: 'var(--academy-border-color)',
			},
			boxShadow: {
				soft: 'var(--academy-shadow-soft)',
				hard: 'var(--academy-shadow-hard)',
				// The only shadow in the system: layers floating over the page.
				overlay: 'var(--academy-shadow-overlay)',
			},
		},
	},
	plugins: [],
};
