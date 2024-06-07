const path = require('path');

module.exports = {
    mode: 'production',
    entry: './main.js',
    output: {
        filename: 'astrovis.js',
        globalObject: 'this',
        library: {
            name: 'Astrovis',
            type: 'umd',
        },
        path: path.resolve(__dirname, 'dist', 'astrovis'),
    }
};