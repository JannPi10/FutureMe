import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores Principales
        'tulip-white': '#FFF9F7',
        'cream': '#F4E9E5',
        'rosa-tulip': '#E8B7C8',
        'rosa-petalo': '#D98FA8',
        'malva': '#B99AAA',
        'verde-salvia': '#A8B5A0',
        // Colores Neutros
        'carbon': '#171516',
        'gris-oscuro': '#3D3A3C',
        'gris-calido': '#6F686A',
        'gris-claro': '#D9D5D3',
        'gris-muy-claro': '#F2F0EF',
        'beige': '#EDE2D6',
        // Colores de Acento
        'coral': '#F2A7B5',
        'durazno': '#F7C8B8',
        'amarillo-crema': '#F6E3A1',
        'azul-cielo': '#C7DDF3',
        'menta': '#C9E3D3',
        'lila': '#D6C7E8',
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'floral-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg opacity='0.06'%3E%3Cpath d='M60,75 Q50,55 48,35 Q60,20 72,35 Q70,55 60,75z' fill='%23E8B7C8'/%3E%3Cline x1='60' y1='75' x2='60' y2='95' stroke='%23A8B5A0' stroke-width='1.5'/%3E%3Cpath d='M60,82 Q52,76 48,68' stroke='%23A8B5A0' stroke-width='1.2' fill='none'/%3E%3Cpath d='M60,82 Q68,76 72,68' stroke='%23A8B5A0' stroke-width='1.2' fill='none'/%3E%3Ccircle cx='10' cy='10' r='2' fill='%23E8B7C8'/%3E%3Ccircle cx='110' cy='10' r='1.5' fill='%23D98FA8'/%3E%3Ccircle cx='10' cy='110' r='1.5' fill='%23B99AAA'/%3E%3Ccircle cx='110' cy='110' r='2' fill='%23E8B7C8'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(232, 183, 200, 0.15)',
        'card': '0 4px 24px rgba(23, 21, 22, 0.06)',
        'hover': '0 8px 32px rgba(23, 21, 22, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
