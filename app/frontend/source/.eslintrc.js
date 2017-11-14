module.exports = {
  "extends": "eslint-config-recombix",
  "parserOptions": {
    "sourceType": "module"
  },
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "node": ["*"]
      },
      "extensions": [".js", ".vue"]
    }
  },
  "rules": {
    "filenames/match-regex": [2, /^(?:[a-zA-Z][a-z0-9]+)*$/g],  // Allows "HeaderBar.vue" or "someFile.js".
  },
};
