import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Set the root to the web folder
    root: './src/web',
    base: './',

    // Serve static files from src directory (allows access to ../data)
    publicDir: resolve(__dirname, './src'),

    // Build configuration
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
    },

    // Dev server configuration
    server: {
        port: 3000,
        open: true,
        // Allow serving files from src directory
        fs: {
            allow: ['../..'],
        },
    },

    // Resolve aliases for cleaner imports
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@data': resolve(__dirname, './src/data'),
            '@web': resolve(__dirname, './src/web'),
        },
    },
});
