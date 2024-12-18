module.exports = {
    "overrides": [
      {
        "files": ["app/page.tsx", "app/profile/page.tsx", "app/services/auth.service.ts", "app/services/notification.service.ts"],
        "rules": {
          "@typescript-eslint/no-unused-vars": "off",
          "react/no-unescaped-entities": "off",
          "@typescript-eslint/no-explicit-any": "off",
          "react-hooks/exhaustive-deps": "off"
        }
      }
    ]
}