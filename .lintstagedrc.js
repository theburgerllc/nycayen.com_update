module.exports = {
  // Lint & format TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add',
  ],
  
  // Format JSON, CSS, and Markdown files
  '*.{json,css,md,yml,yaml}': [
    'prettier --write',
    'git add',
  ],
  
  // Run type check for TypeScript files
  '*.{ts,tsx}': [
    () => 'npm run type-check',
  ],
  
  // Run tests for test files
  '*.{test,spec}.{js,jsx,ts,tsx}': [
    'npm run test -- --findRelatedTests',
  ],
  
  // Run Storybook tests for story files
  '*.stories.{js,jsx,ts,tsx}': [
    'npm run test:storybook',
  ],
  
  // Validate package.json
  'package.json': [
    'npm run validate-package',
  ],
}