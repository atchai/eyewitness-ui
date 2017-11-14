module.exports = {
  "extends": "eslint-config-recombix",
  "parserOptions": {
    "sourceType": "module"
  },
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "node": ["*"]
      }
    }
  },
  "rules": {
    "filenames/match-regex": [2, /^(?:[a-zA-Z][a-z0-9]+)*$/g],  // Either camcelCase or dot.case.
  },
};
