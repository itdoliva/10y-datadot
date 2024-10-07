import { r as registerLocaleLoader, i as init, g as getLocaleFromNavigator } from "./runtime.js";
const defaultLocale = "en";
registerLocaleLoader("en", () => import("./en.js"));
registerLocaleLoader("pt", () => import("./pt.js"));
init({
  fallbackLocale: defaultLocale,
  initialLocale: getLocaleFromNavigator()
});
