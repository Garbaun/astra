/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './yazilar/**/*.html',
    './pages/**/*.html',
    './call/**/*.html',
    './script.js'
  ],
  theme: {
    extend: {
      boxShadow: {
        card: '0 10px 18px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.28)',
        'card-hover': '0 16px 24px rgba(0,0,0,0.48), 0 32px 64px rgba(0,0,0,0.36)'
      },
      colors: {
        brand: {
          DEFAULT: '#e7e7e7',
          subtle: '#cfcfcf'
        }
      }
    }
  },
  corePlugins: {
    preflight: false
  },
  plugins: []
}
