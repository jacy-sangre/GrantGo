import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff006e",
          foreground: "#ffffff"
        },
        accent: {
          DEFAULT: "#06ffa5",
          foreground: "#000000"
        },
        neon: {
          pink: "#ff006e",
          purple: "#8338ec",
          blue: "#3a86ff",
          cyan: "#06ffa5",
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #06ffa5 0%, #3a86ff 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
      },
      fontFamily: {
        'display': ['Syne', 'sans-serif'],
        'body': ['Geist', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 20px rgba(255, 0, 110, 0.3)',
        'neon-md': '0 0 40px rgba(255, 0, 110, 0.4)',
        'neon-lg': '0 0 60px rgba(255, 0, 110, 0.5)',
        'glow': '0 0 30px rgba(6, 255, 165, 0.2)',
      }
    }
  },
  plugins: []
};

export default config;
