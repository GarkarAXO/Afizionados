import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#d4af35",
        "accent-pink": "#FF2D55",
        "accent-blue": "#0051FF",
        "background-light": "#f8f7f6",
        "background-dark": "#121212",
        "card-dark": "#1a170e",
        "border-dark": "#433d28",
        "input-dark": "#302c1c",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
