import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

const recommended = firebaseRulesPlugin.configs['flat/recommended'];
const rulesConfigs = Array.isArray(recommended) ? recommended : [recommended];

export default [
  {
    ignores: ['dist/**/*', 'dev-dist/**/*', 'node_modules/**/*'],
  },
  ...rulesConfigs,
];
