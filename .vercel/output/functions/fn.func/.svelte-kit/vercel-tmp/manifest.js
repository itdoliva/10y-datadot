export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","categories.json","favicon.ico","fonts/Rene Bieder - Rational TW Text Book Bold.otf","fonts/Rene Bieder - Rational TW Text SemiBold Italic.otf","fonts/Rene Bieder - RationalTWText-ExtraLight.otf","fonts/Rene Bieder - RationalTWText-Light.otf","fonts/Rene Bieder - RationalTWText-Medium.otf","sprites/.DS_Store","sprites/cursor.png","sprites/petal.png","sprites/sound-fx.json","sprites/sound-fx.png"]),
	mimeTypes: {".json":"application/json",".otf":"font/otf",".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.CFQ0lyri.js","app":"_app/immutable/entry/app.B3jBZhUF.js","imports":["_app/immutable/entry/start.CFQ0lyri.js","_app/immutable/chunks/entry.BRUJHBlA.js","_app/immutable/chunks/scheduler.Byy3OCO3.js","_app/immutable/chunks/index.Djr9Q_kI.js","_app/immutable/entry/app.B3jBZhUF.js","_app/immutable/chunks/preload-helper.D6kgxu3v.js","_app/immutable/chunks/scheduler.Byy3OCO3.js","_app/immutable/chunks/index.D376E_l6.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
