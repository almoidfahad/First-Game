/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#04060b',
        ink: '#05070d',
        panel: '#0a1220',
        panel2: '#0c1828',
        steel: '#16233a',
        neon: '#38bdf8',
        ice: '#7dd3fc',
        ember: '#f97316',
        blood: '#ef4444',
        jade: '#22c55e',
        gold: '#fbbf24',
        mist: '#94a3b8',
      },
      fontFamily: {
        display: ['"Rajdhani"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(56, 189, 248, 0.18)',
        glowStrong: '0 0 34px rgba(56, 189, 248, 0.35)',
        innerLine: 'inset 0 1px 0 rgba(148, 197, 255, 0.08)',
      },
      backgroundImage: {
        'city-haze':
          'radial-gradient(120% 80% at 50% 0%, rgba(56,189,248,0.10) 0%, rgba(5,7,13,0) 60%)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 3.2s ease-in-out infinite',
        scan: 'scan 6s linear infinite',
      },
    },
  },
  plugins: [],
}
