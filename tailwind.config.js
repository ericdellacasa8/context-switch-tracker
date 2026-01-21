/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0f',
          dark: '#12121a',
          neonGreen: '#39ff14',
          neonPink: '#ff00ff',
          neonBlue: '#00ffff',
          text: '#e0e0e0',
          dim: '#6b7280'
        }
      },
      boxShadow: {
        'neon-green': '0 0 10px #39ff14, 0 0 20px #39ff14',
        'neon-pink': '0 0 10px #ff00ff, 0 0 20px #ff00ff',
        'neon-blue': '0 0 10px #00ffff, 0 0 20px #00ffff',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      }
    },
  },
  plugins: [],
}