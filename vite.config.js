import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        // Container binds 0.0.0.0 (see docker-compose-local.yml), but asset
        // URLs injected into the page must point at the host-mapped address
        // the browser can actually reach.
        origin: 'http://localhost:5173',
    },
});
