module.exports = {
  "extends": "eslint-config-recombix",
  "parserOptions": {
    "sourceType": "module"
  },
  "globals": {
    "APP_CONFIG": true
  },
  "rules": {
    "filenames/match-regex": [2, /^(?:[a-zA-Z][a-z0-9]+)*$/g],  // Allows "HeaderBar.vue" or "someFile.js".
  },
};
