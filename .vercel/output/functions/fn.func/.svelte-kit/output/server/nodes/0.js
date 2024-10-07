import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.BK2YpIvh.js","_app/immutable/chunks/index.CI10D0L6.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/index.8A4vigZy.js","_app/immutable/chunks/scheduler.Kfbu0MiU.js","_app/immutable/chunks/index.GJ8jQDOz.js"];
export const stylesheets = [];
export const fonts = [];
