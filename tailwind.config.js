import colors from "tailwindcss/colors"; // <-- 1. Import default colors
// removing old colors
delete colors.lightBlue;
delete colors.warmGray;
delete colors.trueGray;
delete colors.coolGray;
delete colors.blueGray;
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 2. Merge the default 'gray' scale with your custom colors
        ...colors, // This spreads all default colors (including gray, red, blue, etc.)

        // 3. Keep your custom colors and overrides
        border: "hsl(0, 0%, 25%)",
        input: "hsl(0, 0%, 25%)",
        ring: "hsl(176, 100%, 43%)",
        background: "hsl(0, 0%, 10%)",
        foreground: "hsl(0, 0%, 98%)",
        primary: {
          DEFAULT: "hsl(176, 100%, 43%)",
          foreground: "hsl(0, 0%, 10%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 20%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 20%)",
          foreground: "hsl(0, 0%, 64%)",
        },
        accent: {
          DEFAULT: "hsl(176, 100%, 43%)",
          foreground: "hsl(0, 0%, 10%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 12%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 12%)",
          foreground: "hsl(0, 0%, 98%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
      // ... rest of your config
    },
  },
  plugins: [],
};
