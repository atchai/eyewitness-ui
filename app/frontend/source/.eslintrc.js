module.exports = {
  "extends": "eslint-config-recombix",
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module"
  },
  "globals": {
    "APP_CONFIG": true
  },
  "rules": {
    "filenames/match-regex": [2, /^(?:[a-zA-Z][a-z0-9]+)*$/g],  // Allows "HeaderBar.vue" or "someFile.js".
    "no-multiple-empty-lines": [2, {
      "max": 1,
      "maxBOF": 2,
    }],
    "node/no-unsupported-features": 0,
  },
};
