/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        serif: ['Lora', 'ui-serif', 'Georgia'],
      },
      colors: {
        brand: {
          50: '#E1F5EE',
          200: '#9FE1CB',
          500: '#1D9E75',
          900: '#085041',
        },
        signal: {
          orange: '#D85A30',
          orangeLight: '#FAECE7',
          purple: '#7F77DD',
          purpleLight: '#EEEDFE',
          blue: '#378ADD',
          blueLight: '#E6F1FB',
          amber: '#EF9F27',
          amberLight: '#FAEEDA',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(21, 31, 44, 0.06)',
      },
    },
  },
  plugins: [],
}
