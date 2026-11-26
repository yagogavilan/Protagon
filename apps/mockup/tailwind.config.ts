import type { Config } from 'tailwindcss';

// Tudo aponta para src/styles/tokens.css (espelho de docs/design/tokens.json). Cor solta no componente é bug.
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
          gold: 'var(--color-border-gold)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          link: 'var(--color-text-link)',
        },
        gold: { 500: 'var(--color-gold-500)', 200: 'var(--color-gold-200)' },
        'on-cta': 'var(--color-text-on-cta)',
        'on-gold': 'var(--color-text-on-gold)',
        live: 'var(--color-state-live)',
        warning: 'var(--color-state-warning)',
        danger: 'var(--color-state-danger)',
        info: 'var(--color-state-info)',
        locked: 'var(--color-state-locked-overlay)',
        scrim: 'var(--scrim)',
        tint: {
          live: 'var(--tint-live)',
          warning: 'var(--tint-warning)',
          danger: 'var(--tint-danger)',
          info: 'var(--tint-info)',
          gold: 'var(--tint-gold)',
        },
        'tint-border': {
          live: 'var(--tint-border-live)',
          warning: 'var(--tint-border-warning)',
          danger: 'var(--tint-border-danger)',
          info: 'var(--tint-border-info)',
        },
        tier: { executivo: 'var(--tier-executivo)' },
      },
      backgroundImage: {
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-cta': 'var(--gradient-cta)',
        'gradient-cta-pressed': 'var(--gradient-cta-pressed)',
        'tier-vip': 'var(--tier-vip)',
        'tier-diamond': 'var(--tier-diamond)',
        'radial-top': 'var(--glow-radial-top)',
      },
      fontFamily: { sans: 'var(--font-sans)' },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.01em' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-strong': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        // Rótulos de ação (chips, filtros, abas): >= 14 px, peso 500-600 (Etapa 4, BUG-003). Proposta ao designer: entram em tokens.json.
        label: ['15px', { lineHeight: '20px', fontWeight: '500' }],
        'label-sm': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        margin: 'var(--space-margin)',
        card: 'var(--space-card-padding)',
        gap: 'var(--space-grid-gap)',
        touch: 'var(--size-touch-min)',
        topbar: 'var(--size-topbar)',
        tabbar: 'var(--size-tabbar)',
        button: 'var(--size-button)',
        'button-compact': 'var(--size-button-compact)',
      },
      minHeight: { touch: 'var(--size-touch-min)', button: 'var(--size-button)' },
      minWidth: { touch: 'var(--size-touch-min)' },
      boxShadow: {
        card: 'var(--shadow-card)',
        sheet: 'var(--shadow-sheet)',
        'glow-gold': 'var(--glow-gold)',
        'glow-live': 'var(--glow-live)',
      },
      blur: { locked: 'var(--state-locked-blur)', glass: 'var(--glass-blur)' },
      backdropBlur: { glass: 'var(--glass-blur)' },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: { protagon: 'var(--motion-ease)' },
      scale: { press: 'var(--motion-press-scale)' },
      zIndex: {
        topbar: 'var(--z-topbar)',
        tabbar: 'var(--z-tabbar)',
        banner: 'var(--z-banner)',
        overlay: 'var(--z-overlay)',
        sheet: 'var(--z-sheet)',
        toast: 'var(--z-toast)',
      },
      keyframes: {
        'live-pulse': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        skeleton: { '0%, 100%': { opacity: '0.5' }, '50%': { opacity: '0.8' } },
      },
      animation: {
        'live-pulse': 'live-pulse var(--motion-pulse) var(--motion-ease) infinite',
        skeleton: 'skeleton 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
