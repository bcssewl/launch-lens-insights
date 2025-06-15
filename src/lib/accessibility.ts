
/**
 * Accessibility utilities for WCAG compliance
 */

// WCAG AA contrast ratio requirement
export const WCAG_AA_CONTRAST_RATIO = 4.5;
export const WCAG_AAA_CONTRAST_RATIO = 7;

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 */
export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  const srgb = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculate contrast ratio between two colors
 */
export function contrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= WCAG_AA_CONTRAST_RATIO;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= WCAG_AAA_CONTRAST_RATIO;
}

/**
 * Generate ARIA attributes for status elements
 */
export function getStatusAriaAttributes(status: 'success' | 'warning' | 'error' | 'info') {
  const statusMap = {
    success: { role: 'status', 'aria-live': 'polite' as const },
    warning: { role: 'alert', 'aria-live': 'assertive' as const },
    error: { role: 'alert', 'aria-live': 'assertive' as const },
    info: { role: 'status', 'aria-live': 'polite' as const },
  };
  
  return statusMap[status];
}

/**
 * Generate screen reader only text for visual indicators
 */
export function getVisualIndicatorText(type: 'required' | 'optional' | 'loading' | 'error'): string {
  const textMap = {
    required: 'required field',
    optional: 'optional field',
    loading: 'loading',
    error: 'error',
  };
  
  return textMap[type];
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}
