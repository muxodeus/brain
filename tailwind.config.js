/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Definimos colores como variables CSS
        "param-voltage": "hsl(var(--param-voltage))",
        "param-current": "hsl(var(--param-current))",
        "param-p-act": "hsl(var(--param-p-act))",
        "param-p-react": "hsl(var(--param-p-react))",
        "param-energy": "hsl(var(--param-energy))",
        "param-pf": "hsl(var(--param-pf))",
        "param-frequency": "hsl(var(--param-frequency))",
        "param-thd": "hsl(var(--param-thd))",
        "param-default": "hsl(var(--param-default))",
      },
    },
  },
  plugins: [],
};