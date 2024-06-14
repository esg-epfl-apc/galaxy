const path = require('path');

module.exports = {
    mode: 'development',
    entry: './main.js',
    output: {
        filename: 'astrovis.js',
        globalObject: 'this',
        library: {
            name: 'Astrovis',
            type: 'umd',
        },
        path: path.resolve(__dirname, 'dist', 'astrovis'),
    },
    devtool: 'inline-source-map',
};