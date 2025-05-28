module.exports = {
  content: [
    './app/templates/**/*.html',
    './app/static/js/**/*.js',
    './node_modules/flowbite/**/*.js',
  ]
  ,
  theme: {
    extend: {
      boxShadow: {
        'custom': 'rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;',
        'checkbox':'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset;',
      },
      colors: {
        'azul-dark': 'var(--azul-dark)', 'valor-azul': '#496fb6', 'rojo-crm': '#e32c24',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};