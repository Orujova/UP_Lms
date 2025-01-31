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
        mainGreen: "#058D66",
        mainGreen2: "#007D571F",
        mainBlue: "#0070CC",
        mainBlue2: "#153B42",
        mainRed: "#E00000",
        mainGray: "#5B5B5B",
        mainGray2: "#969696",
        mainWhite1: "#D5D5D5",
      },
      backgroundImage: {
        login1: "url('/login.svg')",
      },
      width: {
        fully: "100%",
        50: "50%",
        40: "40%",
        30: "30%",
        25: "25%",
        3: "calc(100% / 3 - 16px)",
      },
      height: {
        fully: "100vh",
      },
      fontSize: {
        48: "48px",
        34: "34px",
        24: "24px",
        22: "22px",
        16: "16px",
        14: "14px",
        12: "12px",
      },
      borderRadius: {
        8: "8px",
        16: "16px",
        sm: "3px",
      },
      borderWidth: {
        1: "1px",
      },
      gap: {
        perCard: "20px",
      },
      boxShadow: {
        20: "0px 0px 20px rgba(0,0,0,0.05)",
      },
      flexBasis: {
        "3/16": "calc(100% / (3 / 16))",
        "1/16": "calc(100% / 16)",
      },
    },
  },
  plugins: [],
};
