const OFF = 0; //"off" or 0 - turn the rule off
const WARN = 1; //"warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
const ERROR = 2; //"error" or 2 - turn the rule on as an error (exit code will be 1)

module.exports = {
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
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
		'no-constant-condition': 1,
		'no-debugger': 1,
		'no-console': 1,
		'no-unused-vars': 0,
		'react/jsx-uses-react': 2,
		'react/jsx-uses-vars': 2,
	},
	globals: {
		$: false,
		jQuery: false,
		React: false,
		ReactDOM: false,
		MathJax: false,
		arguments: false
	},
};
