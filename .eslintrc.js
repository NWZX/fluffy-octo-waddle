module.exports = {
    root: true,
    extends: ['@react-native-community', 'airbnb-typescript', 'prettier'],
    globals: { JSX: true },
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname
    },
    rules: {
        // We will use TypeScript's types for component props instead
        'react/prop-types': 'off',

        // I ******* use them so
        '@typescript-eslint/no-unused-vars': 'off',

        // I suggest this setting for requiring return types on functions only where useful
        '@typescript-eslint/explicit-function-return-type': [
            'warn',
            {
                allowExpressions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: true
            }
        ],
        'prettier/prettier': ['error', {}, { usePrettierrc: true }], // Includes .prettierrc.js rules
        "import/extensions": 'off',
        "import/no-extraneous-dependencies": 'off',
    }
};
