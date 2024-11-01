import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'], // Aplica a archivos .js, .mjs, .cjs y .jsx
  },
  {
    languageOptions: {
      ecmaVersion: 'latest', // Usa la versión más reciente de ECMAScript
      sourceType: 'module', // Define que se usan módulos ES6
      globals: globals.browser, // Incluye variables globales para navegadores
    },
  },
  pluginJs.configs.recommended, // Reglas recomendadas para JavaScript
  pluginReact.configs.flat.recommended, // Reglas recomendadas para React
  {
    rules: {
      'no-unused-vars': 'warn', // Marca variables no usadas como advertencia
      'no-console': 'off', // Permite console.log
      'eqeqeq': 'error', // Requiere uso estricto de === y !==
      'semi': ['error', 'always'], // Requiere punto y coma al final
      'quotes': ['error', 'single'], // Fuerza el uso de comillas simples
      'indent': ['error', 2], // Define indentación de 2 espacios
      'react/react-in-jsx-scope': 'off', // React 17+ no requiere importar React
      'react/prop-types': 'off', // Deshabilita la advertencia sobre prop-types
    },
  }
];
