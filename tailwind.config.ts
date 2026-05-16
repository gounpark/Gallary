import type { Config } from 'tailwindcss'

// ── 유아이볼 Design Tokens (mapped to existing class names) ──────────────
// surface.base=#000000  surface.strong=#1f222a  surface.muted=#292b2d  surface.raised=#2a3037
// text.primary=#ffffff  text.tertiary=#a3aab5   text.inverse=#99a1a6

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#000000',   // surface.base
          sidebar:  '#1f222a',   // surface.strong
          card:     '#292b2d',   // surface.muted
          elevated: '#2a3037',   // surface.raised
        },
        border: {
          DEFAULT: '#2a3037',    // surface.raised
          subtle:  '#1f222a',    // surface.strong
        },
        text: {
          primary:   '#ffffff',  // text.primary
          secondary: '#a3aab5',  // text.tertiary
          muted:     '#99a1a6',  // text.inverse
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover:   '#2563eb',
          light:   'rgba(59,130,246,0.12)',
        },
      },

      fontFamily: {
        sans: [
          'wanted sans',
          'Helvetica Neue',
          'sf pro display',
          'pretendard',
          'Arial',
          'sans-serif',
        ],
      },

      fontSize: {
        xs:    ['12px',    { lineHeight: '1.5' }],
        sm:    ['13.33px', { lineHeight: '1.5' }],
        base:  ['14px',    { lineHeight: '1' }],
        lg:    ['15px',    { lineHeight: '1.5' }],
        xl:    ['16px',    { lineHeight: '1.5' }],
        '2xl': ['20px',    { lineHeight: '1.4' }],
        '3xl': ['24px',    { lineHeight: '1.3' }],
        '4xl': ['28px',    { lineHeight: '1.2' }],
      },

      spacing: {
        1: '1px',
        2: '5px',
        3: '6px',
        4: '8px',
        5: '10px',
        6: '14px',
        7: '16px',
        8: '18px',
      },

      borderRadius: {
        xs:      '4px',
        sm:      '5px',
        md:      '6px',
        DEFAULT: '6px',
        lg:      '8px',
        xl:      '16px',
        '2xl':   '40px',
        '7':     '64px',
        full:    '99px',
      },

      boxShadow: {
        1: 'rgba(0,0,0,0.1) 0px 0px 10px 0px',
      },

      transitionDuration: {
        instant: '200ms',
        fast:    '300ms',
      },

      animation: {
        'fade-in':  'fadeIn 200ms ease',
        'slide-in': 'slideIn 200ms ease',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                               to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
