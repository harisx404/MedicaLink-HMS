export default {
  // Format and lint all TypeScript/JavaScript files
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
  ],
  // Note: prettier could be added here later if adopted
};
