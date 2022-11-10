const { existsSync, writeFileSync, mkdirSync } = require("fs");
const browserify = require("browserify");
const tsify = require("tsify");
const babelify = require("babelify");

browserify()
    .add(`${__dirname}/ts/index.ts`)
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