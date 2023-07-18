/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary-color)",
        "neutralPrimary": "var(--neutral-primary-color)",
        "neutralMedium": "var(--neutral-medium-color)",
        "neutralSoft": "var(--neutral-soft-color)",
        "neutralSubtle": "var(--neutral-subtle-color)",
        "bgWhite": "var(--bg-white-color)",
        "bgPrimary": "var(--bg-primary-color)",
        "bgBorder": "var(--bg-border-color)",
        "successStrong": "var(--success-strong-color)",
        "successWeak": "var(--success-weak-color)",
        "warningStrong": "var(--warning-strong-color)",
        "warningWeak": "var(--warning-weak-color)",
        "violetStrong": "var(--violet-strong-color)",
        "violetWeak": "var(--violet-weak-color)",
        "yeStrong": "var(--ye-strong-color)",
        "yeWeak": "var(--ye-weak-color)",
        "mintStrong": "var(--mint-strong-color)",
        "mintWeak": "var(--mint-weak-color)",
      }
    }
  },
  daisyui: {
    themes: ["light"],
  },
  plugins: [require("daisyui")],
}
