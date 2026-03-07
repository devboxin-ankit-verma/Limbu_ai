/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        sidebar: 'var(--bg-sidebar)',
        card: 'var(--bg-card)',
        accent: 'var(--accent)',
        'text-primary': 'var(--text-primary)',
      },
    },
  },
  plugins: [],
};
