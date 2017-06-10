module.exports = {
	"globals": {
		"describe": true,
		"beforeEach": true,
		"afterEach": true,
		"it": true
	},
	"rules": {
		"import/no-extraneous-dependencies": ["error", { "devDependencies": ["*/tests/**/*.js"] }]
	}
}
