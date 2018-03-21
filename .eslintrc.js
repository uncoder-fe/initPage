const OFF = 0; //"off" or 0 - turn the rule off
const WARN = 1; //"warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
const ERROR = 2; //"error" or 2 - turn the rule on as an error (exit code will be 1)

module.exports = {
	extends: ['eslint:recommended'],
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	plugins: ['react', 'import', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		'react/jsx-uses-react': 'error',
		'react/jsx-uses-vars': 'error',
	},
	globals: {
		$: false,
		jQuery: false,
		React: false,
		ReactDOM: false,
		MathJax: false,
	},
};
