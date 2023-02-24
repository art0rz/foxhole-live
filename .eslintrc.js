module.exports = {
	root: true,
	extends: ['airbnb', 'airbnb/hooks', 'next', 'plugin:prettier/recommended'],
	plugins: ['prettier', 'absolute-imports-only'],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'react/jsx-props-no-spreading': 'off',
		'absolute-imports-only/only-absolute-imports': 'error',
		'@typescript-eslint/array-type': [
			'error',
			{
				default: 'generic',
				readonly: 'generic',
			},
		],
	},
	overrides: [
		{
			files: ['src/**/*.{ts,tsx}'],
			parserOptions: {
				project: './tsconfig.json',
			},
			extends: ['airbnb', 'airbnb/hooks', 'airbnb-typescript', 'plugin:prettier/recommended'],
			plugins: ['prettier', 'absolute-imports-only'],
			rules: {
				'react/react-in-jsx-scope': 'off',
			},
		},
	],
};
