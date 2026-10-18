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
        navy: {
          bg: '#0b1220',
          card: '#111a2b',
          cardHover: '#162238',
          border: '#1f2b42',
          subtle: '#2a3b59',
          lightBg: '#f8fafc',
          lightCard: '#ffffff',
          lightBorder: '#e2e8f0',
        },
        text: {
          primary: '#e6ebf5',
          muted: '#94a3bb',
          lightPrimary: '#0f172a',
          lightMuted: '#64748b',
        },
        accent: {
          blue: '#5b8cff',
          red: '#ff6b6b',
          amber: '#f5a524',
          green: '#4cc27a',
          purple: '#a98bff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'glow-red': '0 0 20px -5px rgba(255, 107, 107, 0.35)',
        'glow-blue': '0 0 20px -5px rgba(91, 140, 255, 0.35)',
        'glow-green': '0 0 20px -5px rgba(76, 194, 122, 0.35)',
      }
    },
  },
  plugins: [],
}
