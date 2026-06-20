/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',    // indigo-600
        secondary: '#0D9488',  // teal-600
        bg: '#F0F4F8',
        card: '#FFFFFF',
        sidebar: '#0A1628',
        text: '#111827',
        muted: '#6B7280',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      }
    },
  },
  plugins: [],
}
