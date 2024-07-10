module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: [`@typescript-eslint`, `simple-import-sort`, `unused-imports`],
  extends: [
    `eslint:recommended`,
    `next`,
    `next/core-web-vitals`,
    `plugin:@typescript-eslint/recommended`,
    `prettier`,
    `plugin:storybook/recommended`,
  ],
  rules: {
    curly: [`error`, `all`],
    "arrow-body-style": [`error`, `always`],
    "no-unused-vars": `off`,
    "no-console": `off`,
    "@typescript-eslint/consistent-type-imports": `error`,
    "@typescript-eslint/explicit-module-boundary-types": `off`,
    "@typescript-eslint/no-namespace": `off`,

    //#region  //*=========== Unused Import ===========
    "@typescript-eslint/no-empty-function": `off`,
    "@typescript-eslint/no-unused-vars": `off`,
    "@typescript-eslint/quotes": [`error`, `backtick`],
    "@typescript-eslint/prefer-literal-enum-member": `error`,
    "unused-imports/no-unused-imports": `error`,
    "unused-imports/no-unused-vars": [
      `off`,
      {
        vars: `all`,
        varsIgnorePattern: `^_`,
        args: `after-used`,
        argsIgnorePattern: `^_`,
      },
    ],
    //#endregion  //*======== Unused Import ===========
    //#region  //*=========== Import Sort ===========
    "simple-import-sort/exports": `error`,
    "simple-import-sort/imports": [
      `error`,
      {
        groups: [
          // ext library & side effect imports
          [`^.+\\.s?css$`],
          [`^@/`],
          [
            `^\\./?$`,
            `^\\.(?!/?$)`,
            `^\\.\\./?$`,
            `^\\.\\.(?!/?$)`,
            `^\\.\\./\\.\\./?$`,
            `^\\.\\./\\.\\.(?!/?$)`,
            `^\\.\\./\\.\\./\\.\\./?$`,
            `^\\.\\./\\.\\./\\.\\.(?!/?$)`,
          ],
          [`^@/types`], // other that didnt fit in
          [`^`],
        ],
      },
    ], //#endregion  //*======== Import Sort ===========
  },
  globals: {
    React: true,
    JSX: true,
  },
}
