// lib/i18n/t.js

import enGB from "../../locales/en-GB.json";
import ar from "../../locales/ar.json";

const LOCALES = {
  "en-GB": enGB,
  en: enGB,
  ar: ar
};

const RTL_LANGS = new Set(["ar"]);

function get(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function t(lang, key, vars = {}) {
  const dict = LOCALES[lang] || LOCALES["en-GB"];
  let str = get(dict, key) || get(LOCALES["en-GB"], key) || key;

  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  }

  return str;
}

export function dirFor(lang) {
  return RTL_LANGS.has(lang) ? "rtl" : "ltr";
}

export function isRTL(lang) {
  return RTL_LANGS.has(lang);
}
