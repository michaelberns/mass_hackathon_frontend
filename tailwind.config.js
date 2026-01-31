/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'background-alt': 'var(--color-background-alt)',
        card: 'var(--color-card)',
        'card-hover': 'var(--color-card-hover)',
        border: 'var(--color-border)',
        'border-muted': 'var(--color-border-muted)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverse': 'var(--color-text-inverse)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-muted': 'var(--color-accent-muted)',
        link: 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        nav: {
          bg: 'var(--color-nav-bg)',
          border: 'var(--color-nav-border)',
        },
        'btn-primary': 'var(--color-button-primary)',
        'btn-primary-hover': 'var(--color-button-primary-hover)',
        'btn-secondary': 'var(--color-button-secondary)',
        'btn-secondary-hover': 'var(--color-button-secondary-hover)',
        input: {
          bg: 'var(--color-input-bg)',
          border: 'var(--color-input-border)',
        },
        status: {
          open: 'var(--color-status-open)',
          reserved: 'var(--color-status-reserved)',
          closed: 'var(--color-status-closed)',
        },
      },
    },
  },
  plugins: [],
}
