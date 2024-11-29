/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
    env: {
        es2022: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
    ],
    ignorePatterns: ["node_modules", "src/js/", ".eslintrc.cjs"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2022,
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
    },
    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
    },
};

module.exports = config;
