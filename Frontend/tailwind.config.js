/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
    extend: {
      height: {
        'screen-90': '90vh',
        'screen-50': '50vh',
      },
    }
};
export const plugins = [];

