/**
 * brand.js — runtime mirror of `:root` tokens in styles/variables.css.
 *
 * Use this in JS/JSX where CSS variables can't reach (Canvas drawing,
 * inline `style={{ background }}`, charting libraries). Keep the two
 * sources in lock-step — when you change a token in variables.css,
 * update the matching constant here.
 *
 * For any surface that CAN consume a CSS variable (regular className,
 * styled components, inline style with `var(--…)`), prefer that path.
 */

const m = (v) => (typeof window === 'undefined'
  ? v
  : getComputedStyle(document.documentElement).getPropertyValue(v).trim());

export const brand = {
  primary: '#12564E',
  primaryHover: '#0D3F39',
  primaryTint: '#E6F0EE',
  secondary: '#2f65ad',
  secondaryHover: '#24548f',
  secondaryDeep: '#2c67b0',
  secondaryTint: '#E8EEF8',
  accentTeal: '#2fb4a9',
  accentTealLight: '#65c0bd',
  success: '#1E8E5A',
  warning: '#D08700',
  danger: '#B3261E',
  info: '#2C6ECB',
};

/**
 * `liveBrand()` — re-reads the CSS variable values at call time.
 * Falls back to the static defaults above in non-browser environments
 * (tests, SSR). Use for canvas / dynamic contexts that must reflect
 * a runtime theme override (rare; default to `brand`).
 */
export function liveBrand() {
  return {
    primary: m('--color-primary') || brand.primary,
    secondary: m('--color-secondary') || brand.secondary,
    success: m('--color-success') || brand.success,
    warning: m('--color-warning') || brand.warning,
    danger: m('--color-danger') || brand.danger,
  };
}