/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        persian: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
        latin:   ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
    },
  },
  plugins: [],
}
