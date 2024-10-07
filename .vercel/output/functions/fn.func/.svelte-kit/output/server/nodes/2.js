import * as universal from '../entries/pages/_page.js';
import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.D_pJy3fn.js","_app/immutable/chunks/index.Iqn8piLp.js","_app/immutable/chunks/preload-helper.D6kgxu3v.js","_app/immutable/chunks/index.Djr9Q_kI.js","_app/immutable/chunks/scheduler.Byy3OCO3.js","_app/immutable/chunks/index.D376E_l6.js"];
export const stylesheets = ["_app/immutable/assets/2.CIln0I8J.css"];
export const fonts = [];
