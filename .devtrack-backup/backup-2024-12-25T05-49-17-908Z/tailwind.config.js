const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      primary: colors.pink,
      accent: colors.indigo,
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      red: colors.red,
      green: colors.emerald,
      yellow: colors.amber,
      gray: colors.slate,
    },
    // fontFamily: {
    //   'heading': ['HeadingBold', 'system-ui', ...],
    //   'body': ['Bodyregular', 'Georgia', ...],
    // }
  },
  plugins: [],
}

