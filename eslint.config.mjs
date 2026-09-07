import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

/** For some reason, I can't get elsint to work properly with TS on my machine, so disabling TS linting entirely
 *
 * 										(same for dozens of rules)
 * 	Error: Error while loading rule '@typescript-eslint/await-thenable': You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://tseslint.com/typed-linting for enabling linting with type information.
 *  Parser: typescript-eslint/parser
 */

const baseConfig = await generateEslintConfig({
	enableTypescript: false,
})

const customConfig = [
	...baseConfig,

	{
		/*rules: {
			'@typescript-eslint/await-thenable': 'off',
			'@typescript-eslint/no-array-delete': 'off',
			'@typescript-eslint/no-base-to-string': 'off',
			'@typescript-eslint/no-duplicate-type-constituents': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-implied-eval': 'off',
			'@typescript-eslint/no-misused-promises': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'@typescript-eslint/only-throw-error': 'off',
		}, */
	},
]

export default customConfig
