/**
 * PostCSS config.
 *
 * When a project provides its own PostCSS config, @wordpress/scripts stops
 * injecting its built-in preset (which is only `[autoprefixer]`) and its
 * production cssnano pass. So we re-add both here alongside Tailwind, keeping
 * the existing SCSS pipeline byte-for-byte identical while adding Tailwind on
 * top for the admin app.
 */
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	plugins: [
		require( 'tailwindcss' ),
		require( 'autoprefixer' ),
		...( isProduction
			? [
					require( 'cssnano' )( {
						preset: [
							'default',
							{ discardComments: { removeAll: true } },
						],
					} ),
			  ]
			: [] ),
	],
};
