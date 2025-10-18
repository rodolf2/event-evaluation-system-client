export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tolkien: ["Tolkien", "serif"],
        middleearth: ["Middleearth", "serif"],
      },
    },
  },
  plugins: [],
  safelist: ["font-tolkien", "font-middleearth"],
};
