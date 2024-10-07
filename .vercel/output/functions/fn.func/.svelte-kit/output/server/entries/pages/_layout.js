import "../../chunks/index.js";
import { w as waitLocale } from "../../chunks/runtime.js";
const load = async () => {
  await waitLocale();
};
const ssr = false;
export {
  load,
  ssr
};
