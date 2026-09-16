/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0F1115',
          card: '#181B20',
          cardBorder: '#282C34',
          accent: '#10B981', // Leaf green
          accentHover: '#059669',
          accentMuted: 'rgba(16, 185, 129, 0.15)',
          edge: '#3B82F6',
          edgeGlow: '#60A5FA',
          textMuted: '#9CA3AF',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
