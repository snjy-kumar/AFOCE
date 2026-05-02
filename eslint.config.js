import nextConfig from 'eslint-config-next';

export default [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'build/',
      '.env.local',
      '.env*.local',
      '*.d.ts',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  ...nextConfig,
];
