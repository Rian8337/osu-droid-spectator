/* eslint-disable @typescript-eslint/no-var-requires */
const { readdirSync, existsSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");
const browserify = require("browserify");
const tsify = require("tsify");
const babelify = require("babelify");

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
if (!process.argv.includes("--development")) {
    b.transform("uglifyify", { global: true });
}

b.bundle((err, data) => {
    if (err) throw err;

    const dir = join(__dirname, "js");

    if (!existsSync(dir)) {
        mkdirSync(dir);
    }

    writeFileSync(join(dir, "index.js"), data);
});
