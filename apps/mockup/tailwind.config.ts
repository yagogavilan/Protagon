import type { Config } from 'tailwindcss';

// Tudo aponta para as variáveis de src/styles/tokens.css: cor solta no componente é bug.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg-base)',
        surface: {
          1: 'var(--color-surface-1)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        gold: { 500: 'var(--color-gold-500)', 200: 'var(--color-gold-200)' },
        'on-cta': 'var(--color-on-cta)',
        'on-gold': 'var(--color-on-gold)',
        live: 'var(--color-state-live)',
        warning: 'var(--color-state-warning)',
        danger: 'var(--color-state-danger)',
        info: 'var(--color-state-info)',
        locked: 'var(--color-state-locked-overlay)',
        tier: { executivo: 'var(--tier-executivo)' },
      },
      backgroundImage: {
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-cta': 'var(--gradient-cta)',
        'tier-vip': 'var(--tier-vip)',
        'tier-diamond': 'var(--tier-diamond)',
      },
      fontFamily: { sans: 'var(--font-sans)' },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      spacing: { margin: 'var(--space-margin)' },
      boxShadow: {
        card: 'var(--shadow-card)',
        'glow-gold': 'var(--glow-gold)',
        'glow-live': 'var(--glow-live)',
      },
      backdropBlur: { glass: 'var(--glass-blur)' },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: { protagon: 'var(--motion-ease)' },
    },
  },
  plugins: [],
};

export default config;
