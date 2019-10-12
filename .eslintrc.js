module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["airbnb-base", 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
      "prettier/prettier": "error",
      "class-methods-use-this": "off",//Nao precisa utilizar a palavra this dentro de classes
      "no-param-reassign": "off",//permite receber parametro e altera-lo
      "camelcase": "off",//Desabilita o camelcase validation do eslintEx: not_vcamel_variable, camVariable
      "no-unused-vars": ["error", {"argsIgnorePattern": "next"}],//nao reclamar a palavra next que usa em middlewares
  }
};
