import { FlatCompat } from "@eslint/eslintrc";
import base from "@targets/config/eslint.base.mjs";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [{ ignores: ["next-env.d.ts"] }, ...base, ...compat.extends("next/core-web-vitals")];

export default config;
