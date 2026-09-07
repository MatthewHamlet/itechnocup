import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "app/app/components/ScanPhotoPanel.tsx",
      "app/app/components/SettingsView.tsx",
      "app/app/components/AppShell.tsx",
      "app/app/components/community/**",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    files: ["app/app/components/community/**"],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
]);

export default eslintConfig;
