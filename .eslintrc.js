module.exports = {
  "extends": "eslint-config-recombix",
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "node": ["**/app/frontend/**/*"]
      },
      "extensions": [".js", ".vue"]
    }
  },
  "rules": {
    "no-process-exit": 0,
  },
};
