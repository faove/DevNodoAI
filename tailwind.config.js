import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
                jakarta: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                madison: {
                    bg: '#0b0d12',
                    card: '#070b14',
                    surface: '#0a1224',
                    panel: '#0f1a30',
                    blue: '#5b9cff',
                    blue2: '#3b82f6',
                    violet: '#8b7bff',
                    text: '#f4f7fc',
                    muted: '#a8b4c8',
                    dim: '#6b7a92',
                    faint: '#4b5670',
                },
            },
        },
    },

    plugins: [forms],
};
