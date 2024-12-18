{
    "overrides": [
      {
        "files": ["app/page.tsx", "app/profile/page.tsx"],
        "rules": {
          "@typescript-eslint/no-unused-vars": "off",
          "react/no-unescaped-entities": "off",
          "@typescript-eslint/no-explicit-any": "off",
          "react-hooks/exhaustive-deps": "warn"
        }
      }
    ]
  }