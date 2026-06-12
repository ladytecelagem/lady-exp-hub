import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      preto: '#101820', offwhite: '#F7F6F2', branco: '#FFFFFF',
      acustica:     { DEFAULT: '#330E23', accent: '#D4857D' },
      revestimento: { DEFAULT: '#1D3C34', accent: '#BD9B60' },
      textil:       { DEFAULT: '#94A9CB', accent: '#674230' },
      store:        { DEFAULT: '#DBC8B6', accent: '#7C3A2D' },
    },
    fontFamily: { silka: ['Silka', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
};
export default config;
