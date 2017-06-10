module.exports = {
	"extends": "airbnb-base",
	"plugins": [
		"import"
	],
	"env": {
		"es6": true
	},
	"parserOptions": {
		"sourceType": "module"
	},
	"rules": {
		"indent": ["error", "tab", { "SwitchCase": 1 }],
		"no-tabs": "off",
		"quotes": ["error", "single", { "avoidEscape": true }],
		"linebreak-style": ["error", "unix"],
		"semi": ["error", "always"],
		"comma-dangle": ["error", "never"],
		"no-restricted-syntax": ["error", "WithStatement"],
		"no-console": ["warn", { "allow": ["error", "warn", "info"] }],
		"no-plusplus": "off",
		"arrow-parens": ["error", "as-needed", { "requireForBlockBody": false }],
		"no-debugger": "warn",
		"no-mixed-operators": "off",	// Go learn operator precedence!
		"no-bitwise": "off",			// If it's there, why not use it!
		"no-multi-assign": "off",
		"spaced-comment": "off"
	}
};
