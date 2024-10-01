/** @type {import('tailwindcss').Config} */

const colors = {
  'primary-500': '#6D78FC',
  'primary': '#818AFA',
  'primary-300': '#8D95FB',
  'primary-100': '#C9CCED',

  'secondary': '#CEFC6E',

  'dark-gray': '#3A3A3A',

  'gray': '#C7C7C7',

  'black': '#1C1C1C',
  'text-primary': '#1C1C1C'
}

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: [],
  theme: {
    extend: {
      colors: {
        ...colors
      },
      fontSize: {
        xxs: '.6875rem',
        xs: '.75rem',
        sm: '.85rem',
        // sm: '.85rem',
        // base: 'clamp(.825rem, .45rem + 1.15vw, 140px)',
      },
      fontWeight: {
        inherit: 'inherit',
      }
    },
  },
  plugins: [],

}

Object.keys(colors).forEach(color => {
  config.safelist.push(`bg-${color}`)
  config.safelist.push(`text-${color}`)
  config.safelist.push(`border-${color}`)
  config.safelist.push(`fill-${color}`)
  config.safelist.push(`stroke-${color}`)
})

export default config