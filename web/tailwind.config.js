/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          hover: '#16283F',
        },
        accent: {
          DEFAULT: '#2F8F7A',
        },
        warning: {
          DEFAULT: '#C77D28',
        },
        danger: {
          DEFAULT: '#B3413A',
        },
        success: {
          DEFAULT: '#2E7D4F',
        },
        background: {
          DEFAULT: '#F6F7F9',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E5EA',
        },
        text: {
          primary: '#1A1F29',
          secondary: '#5B6472',
        },
        role: {
          student: '#2F8F7A',
          company: '#7A5FB3',
          admin: '#1E3A5F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        caption: '0.75rem',  // 12px
        sm: '0.875rem',      // 14px
        base: '1rem',        // 16px
        lg: '1.125rem',      // 18px
        h3: '1.375rem',      // 22px
        h2: '1.75rem',       // 28px
        h1: '2.25rem',       // 36px
      },
      spacing: {
        base: '0.25rem',     // 4px base unit
      }
    },
  },
  plugins: [],
}
