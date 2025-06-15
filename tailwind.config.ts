
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["DM Sans", "sans-serif"],
      },
      maxWidth: {
        container: "1280px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          active: "hsl(var(--primary-active))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        // 9-Step Gray Scale System - Maps to CSS variables
        gray: {
          50: "hsl(var(--gray-50))",
          100: "hsl(var(--gray-100))",
          200: "hsl(var(--gray-200))",
          300: "hsl(var(--gray-300))",
          400: "hsl(var(--gray-400))",
          500: "hsl(var(--gray-500))",
          600: "hsl(var(--gray-600))",
          700: "hsl(var(--gray-700))",
          800: "hsl(var(--gray-800))",
          900: "hsl(var(--gray-900))",
        },
        // Custom Launch Lens colors - Updated to match new palette
        launchlens: {
          // Dark Mode
          "primary-dark": "#8B5CF6",      // Consistent with main primary
          "background-dark": "#111111",   // Updated background
          "surface-dark": "#1F1F1F",      // Updated surface
          "surface-elevated-dark": "#262626", // New elevated surface
          "accent-dark": "#A855F7",       // Updated accent
          "accent-hover-dark": "#C084FC", // New accent hover
          "success-dark": "#10B981",      // Emerald
          "warning-dark": "#F59E0B",      // Amber
          "danger-dark": "#EF4444",       // Rose
          "text-primary-dark": "#FFFFFF",
          "text-secondary-dark": "#D1D5DB",
          // Light Mode
          "primary-light": "#8B5CF6",     // Consistent primary
          "primary-hover-light": "#7C3AED", // New primary hover
          "primary-active-light": "#6D28D9", // New primary active
          "background-light": "#FFFFFF",  // Pure white
          "surface-light": "#FAFAFA",     // Updated surface
          "surface-elevated-light": "#FFFFFF", // Elevated surface
          "accent-light": "#DDD6FE",      // Lavender
          "accent-hover-light": "#C4B5FD", // New accent hover
          "success-light": "#059669",     // Green
          "warning-light": "#D97706",     // Orange
          "danger-light": "#DC2626",      // Red
          "text-primary-light": "#111827",
          "text-secondary-light": "#6B7280",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)", // For 16px from 0.5rem (8px) base
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-animation": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--accent))", opacity: "1" },
          "50%": { boxShadow: "0 0 20px hsl(var(--accent)), 0 0 30px hsl(var(--accent))", opacity: "0.8" },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient": "gradient-animation 15s ease infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: 'marquee var(--duration) linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
