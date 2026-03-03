const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Apunta al directorio padre que contiene TODOS tus lockfiles
    root: path.resolve(__dirname, '../..'), // ajusta según tu estructura
  },
};

module.exports = nextConfig;