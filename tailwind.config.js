// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // Assurez-vous que tous vos fichiers de code sont inclus
  ],
  theme: {
    extend: {
      // Définissez vos keyframes personnalisés ici
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'light-pulse-red': {
          '0%, 100%': { textShadow: '0 0 5px rgba(255, 0, 0, 0.5), 0 0 10px rgba(255, 0, 0, 0.3)' },
          '50%': { textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.6)' },
        },
        'light-pulse-blue': {
          '0%, 100%': { textShadow: '0 0 5px rgba(0, 0, 255, 0.5), 0 0 10px rgba(0, 0, 255, 0.3)' },
          '50%': { textShadow: '0 0 20px rgba(0, 0, 255, 0.8), 0 0 30px rgba(0, 0, 255, 0.6)' },
        },
        // L'animation 'sway' de la page d'accueil est déjà gérée
        // mais si elle était définie ici elle ressemblerait à ceci:
        'sway': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      // Appliquez les keyframes définis ci-dessus à des noms d'animation
      animation: {
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'light-pulse-red': 'light-pulse-red 1.5s ease-in-out infinite',
        'light-pulse-blue': 'light-pulse-blue 1.5s ease-in-out infinite 0.75s', // Avec un décalage
        'sway': 'sway 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};