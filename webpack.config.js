const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const I18nStringsPlugin = require('./build-tools/i18n-strings-webpack-plugin');
const path = require('path');
const fs = require('fs');

// Single source of truth = the plugin header's Version in academy.php, which
// must equal PHP's ACADEMY_VERSION constant since assets.php enqueues
// `build/[name].{ACADEMY_VERSION}.js`. A pre-release label (e.g. "4.1-beta1") is NOT valid
// npm semver, so it can't live in package.json — @wordpress/scripts' package.json
// reader (normalize-package-data) throws on it. Read it from the header instead.
const ACADEMY_VERSION = (
	fs
		.readFileSync(path.resolve(__dirname, 'academy.php'), 'utf8')
		.match(/^[\s*]*Version:\s*(.+)$/m) || []
)[1].trim();

const config = {
	...defaultConfig,
	entry: {
		backend: path.resolve(__dirname, 'dev_academy/backend.js'),
		customizer: path.resolve(__dirname, 'dev_academy/customizer.js'),
		setup: path.resolve(__dirname, 'dev_academy/setup.js'),
		frontendCurriculums: path.resolve(
			__dirname,
			'dev_academy/frontendCurriculums.js'
		),
		frontendPhpCurriculums: path.resolve(
			__dirname,
			'dev_academy/frontendPhpCurriculums.js'
		),
		frontendDashboard: path.resolve(
			__dirname,
			'dev_academy/frontendDashboard.js'
		),
		frontendCommon: path.resolve(
			__dirname,
			'dev_academy/frontendCommon.js'
		),
		blocks: path.resolve(__dirname, 'dev_academy/blocks/index.js'),
	},
	output: {
		filename: `[name].${ACADEMY_VERSION}.js`,
		path: path.resolve(__dirname, 'assets/build'),
	},
	plugins: [
		...defaultConfig.plugins,
		new CleanWebpackPlugin(),
		new I18nStringsPlugin(),
	],
	resolve: {
		alias: {
			...defaultConfig.resolve.alias,
			'@Components': path.resolve(__dirname, 'dev_academy/components/'),
			'@Containers': path.resolve(__dirname, 'dev_academy/containers/'),
			'@Customizer': path.resolve(__dirname, 'dev_academy/customizer/'),
			'@Global': path.resolve(__dirname, 'dev_academy/global/'),
			'@Redux': path.resolve(__dirname, 'dev_academy/redux/'),
			'@Utils': path.resolve(__dirname, 'dev_academy/utils/'),
			'@ProContaniner': path.resolve(
				__dirname,
				'../academy-pro/dev_academy-pro/'
			),
			'@ECMContaniner': path.resolve(
				__dirname,
				'../easy-content-manager/dev_contentManager'
			),
			'@ECMComponents': path.resolve(
				__dirname,
				'../easy-content-manager/dev_contentManager/components/'
			),
			'@ECMContainers': path.resolve(
				__dirname,
				'../easy-content-manager/dev_contentManager/containers/'
			),
			'@ECMRedux': path.resolve(
				__dirname,
				'../easy-content-manager/dev_contentManager/redux/'
			),
			'@ECMUtils': path.resolve(
				__dirname,
				'../easy-content-manager/dev_contentManager/utils/'
			),
		},
	},
};

module.exports = config;
