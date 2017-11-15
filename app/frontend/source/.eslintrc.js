module.exports = {
  "extends": "eslint-config-recombix",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "filenames/match-regex": [2, /^(?:[a-zA-Z][a-z0-9]+)*$/g],  // Allows "HeaderBar.vue" or "someFile.js".
  },
};
