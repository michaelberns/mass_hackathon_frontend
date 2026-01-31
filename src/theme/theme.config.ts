/**
 * Brand identity and theme tokens.
 * Use these via Tailwind theme classes (e.g. bg-background, text-primary) or CSS vars.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

/** Brand palette (hex) – used in CSS variables */
export const brandColors = {
  /** Main text on light backgrounds, headers, important labels */
  primaryNavy: '#1e3a8a',
  /** Main text on dark backgrounds, links, highlights */
  primaryBlue: '#60a5fa',
  /** Accent: CTAs, active states, important actions */
  constructionOrange: '#d97706',
  /** Secondary text, icons, borders, subtle UI */
  workerGray: '#334155',
} as const;

/** Semantic token names for CSS variables (--color-*) */
export const themeTokens = {
  background: '--color-background',
  backgroundAlt: '--color-background-alt',
  card: '--color-card',
  cardHover: '--color-card-hover',
  border: '--color-border',
  borderMuted: '--color-border-muted',
  text: '--color-text',
  textMuted: '--color-text-muted',
  textInverse: '--color-text-inverse',
  accent: '--color-accent',
  accentHover: '--color-accent-hover',
  accentMuted: '--color-accent-muted',
  link: '--color-link',
  linkHover: '--color-link-hover',
  navBg: '--color-nav-bg',
  navBorder: '--color-nav-border',
  buttonPrimary: '--color-button-primary',
  buttonPrimaryHover: '--color-button-primary-hover',
  buttonSecondary: '--color-button-secondary',
  buttonSecondaryHover: '--color-button-secondary-hover',
  inputBg: '--color-input-bg',
  inputBorder: '--color-input-border',
  statusOpen: '--color-status-open',
  statusReserved: '--color-status-reserved',
  statusClosed: '--color-status-closed',
} as const;

export const STORAGE_KEY_THEME = 'wtt-theme';
