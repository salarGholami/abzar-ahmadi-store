import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Data-fetching and hydration patterns that call setState inside useEffect
      // are intentional and common in this codebase; the rule is overly strict for them.
      "react-hooks/set-state-in-effect": "off",
      // Many images are dynamic/external URLs or print/receipt views where next/image
      // is not practical; silencing the rule keeps lint clean without large refactors.
      "@next/next/no-img-element": "off",
    },
  },
]);
