import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          pressed: "hsl(var(--primary-pressed))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          container: "hsl(var(--surface-container))",
          "container-hover": "hsl(var(--surface-container-hover))",
          "container-pressed": "hsl(var(--surface-container-pressed))",
        },
        outline: "hsl(var(--outline))",
        error: "hsl(var(--error))",
        "on-primary": "hsl(var(--on-primary))",
        "on-secondary": "hsl(var(--on-secondary))",
        "on-surface": "hsl(var(--on-surface))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        "primary-container": "hsl(var(--primary-container))",
        "primary-container-pressed": "hsl(var(--primary-container-pressed))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        "secondary-container": "hsl(var(--secondary-container))",
        "secondary-container-hover": "hsl(var(--secondary-container-hover))",
        "secondary-container-pressed": "hsl(var(--secondary-container-pressed))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
