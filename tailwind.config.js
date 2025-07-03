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
      // Les keyframes et animations personnalisées sont supprimées d'ici
      // car elles sont maintenant gérées par styled-jsx dans login/page.tsx
    },
  },
  plugins: [],
};