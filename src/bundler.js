/* eslint-disable @typescript-eslint/no-require-imports */
const { readdirSync, existsSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");
const browserify = require("browserify");
const tsify = require("tsify");
const babelify = require("babelify");
const uglify = require("uglify-js");

const b = browserify();

b.add(join(__dirname, "ts", "index.ts"));

const elementsPath = join(__dirname, "ts", "elements");
const elements = readdirSync(elementsPath);

for (const element of elements) {
    b.add(join(elementsPath, element));
}

b.plugin(tsify).transform(
    babelify.configure({
        extensions: [".js", ".ts", ".cjs"],
        presets: ["@babel/preset-env"],
    }),
);

// Minify when bundling for production.
const isDevelopment = process.argv.includes("--development");

if (!isDevelopment) {
    b.transform("uglifyify", { global: true });
}

b.bundle((err, data) => {
    if (err) throw err;

    const dir = join(__dirname, "js");

    if (!existsSync(dir)) {
        mkdirSync(dir);
    }

    const path = join(dir, "index.js");

    if (isDevelopment) {
        writeFileSync(path, data);
    } else {
        const minified = uglify.minify(data.toString(), {
            compress: {},
        });

        if (minified.error) {
            throw minified.error;
        }

        writeFileSync(path, minified.code);
    }
});
