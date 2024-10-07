import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DtasO07X.js","_app/immutable/chunks/index.Iqn8piLp.js","_app/immutable/chunks/preload-helper.D6kgxu3v.js","_app/immutable/chunks/index.Djr9Q_kI.js","_app/immutable/chunks/scheduler.Byy3OCO3.js","_app/immutable/chunks/index.D376E_l6.js"];
export const stylesheets = [];
export const fonts = [];
