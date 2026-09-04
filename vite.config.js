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
        hmr: {
            host: 'localhost',
        },
        // laravel-vite-plugin defaults server.cors.origin to server.origin
        // whenever `origin` is set (see its config() hook), which replaces its
        // own sensible default (any localhost port) with just this one exact
        // string. The app page is served from a different origin
        // (http://localhost:8080 via nginx) than this dev server, so cross-origin
        // module/HMR requests need CORS allowed explicitly — set it ourselves so
        // the plugin doesn't override it.
        cors: true,
    },
});
