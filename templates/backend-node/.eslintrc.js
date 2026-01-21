module.exports = {
  root: true, // This tells ESLint to look for configuration files in the current directory and its ancestors
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2020: true,
  },
  rules: {

    // Disable base no-unused-vars (use TypeScript version instead)
    'no-unused-vars': 'off',
    // LAYER 3: Enforce no direct env access
    'no-process-env': 'error',
    
    // LAYER 3: Enforce folder boundaries
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '../repositories',
            importNames: ['*'],
            message: 'Controllers cannot import repositories directly. Use Services instead.',
          },
          {
            name: '../../repositories',
            importNames: ['*'],
            message: 'Controllers cannot import repositories directly. Use Services instead.',
          },
          {
            name: '../models',
            importNames: ['*'],
            message: 'Controllers cannot import models directly. Use Services instead.',
          },
          {
            name: '../../models',
            importNames: ['*'],
            message: 'Controllers cannot import models directly. Use Services instead.',
          },
        ],
        patterns: [
          {
            group: ['**/repositories/**'],
            message: 'Do not import from repositories outside of services layer.',
          },
        ],
      },
    ],
    
  
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  overrides: [
    {
      // Allow env access ONLY in config layer
      files: ['src/config/**/*.ts'],
      rules: {
        'no-process-env': 'off',
      },
    },
    {
      // Allow imports in services (services can import repositories and models)
      files: ['src/services/**/*.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      // Allow imports in repositories (repositories can import models)
      files: ['src/repositories/**/*.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
