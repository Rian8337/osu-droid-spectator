/* eslint-disable @typescript-eslint/no-var-requires */
const { readdirSync, existsSync, writeFileSync, mkdirSync } = require("fs");
const browserify = require("browserify");
const tsify = require("tsify");
const babelify = require("babelify");

const b = browserify();

b.add(`${__dirname}/ts/index.ts`);

const elementsPath = `${__dirname}/ts/elements`;
const elements = readdirSync(elementsPath);

for (const element of elements) {
    b.add(`${elementsPath}/${element}`);
}

b
    .plugin(tsify)
    .transform(babelify.configure({
        extensions: [".js", ".ts", ".cjs"],
        presets: ["@babel/preset-env"],
    }))
    .bundle((err, data) => {
        if (err) throw err;

        const dir = `${__dirname}/js`;

        if (!existsSync(dir)) {
            mkdirSync(dir);
        }

        writeFileSync(`${dir}/index.js`, data, (err) => {
            if (err) throw err;
        });
    });