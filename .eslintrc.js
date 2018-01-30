const OFF = 0;    //"off" or 0 - turn the rule off
const WARN = 1;   //"warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
const ERROR = 2;  //"error" or 2 - turn the rule on as an error (exit code will be 1)

module.exports = {
	"extends": [
		"plugin:prettier/recommended"
	],
	"parser": "babel-eslint",
	"env": {
		"browser": true,
		"es6": true
	},
	"plugins": [
		"prettier",
		"react",
		"import"
	],
	"rules": {
		"prettier/prettier": ["error", {
			"useTabs": true,
			"tabWidth": 4,
			"singleQuote": true,
			"trailingComma": "all",
			"bracketSpacing": false,
			"jsxBracketSameLine": true
		}],
		"react/jsx-uses-react": "error",
		"react/jsx-uses-vars": "error"
	},
	"globals": {
		"$": false,
		"jQuery": false,
		"React": false,
		"ReactDOM": false,
		"MathJax": false
	},
}
