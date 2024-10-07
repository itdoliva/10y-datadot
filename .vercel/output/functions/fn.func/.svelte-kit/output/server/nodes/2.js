import * as universal from '../entries/pages/_page.js';
import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.BuagtvDQ.js","_app/immutable/chunks/index.CI10D0L6.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/index.8A4vigZy.js","_app/immutable/chunks/scheduler.Kfbu0MiU.js","_app/immutable/chunks/index.GJ8jQDOz.js"];
export const stylesheets = ["_app/immutable/assets/2.CIln0I8J.css"];
export const fonts = [];
