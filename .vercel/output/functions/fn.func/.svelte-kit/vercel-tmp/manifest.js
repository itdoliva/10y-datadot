export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","categories.json","favicon.ico","fonts/Rene Bieder - Rational TW Text Book Bold.otf","fonts/Rene Bieder - Rational TW Text SemiBold Italic.otf","fonts/Rene Bieder - RationalTWText-ExtraLight.otf","fonts/Rene Bieder - RationalTWText-Light.otf","fonts/Rene Bieder - RationalTWText-Medium.otf","loadingLottie.json","sprites/.DS_Store","sprites/cursor.png","sprites/petal.png","sprites/sound-fx.json","sprites/sound-fx.png"]),
	mimeTypes: {".json":"application/json",".otf":"font/otf",".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.Cjibruru.js","app":"_app/immutable/entry/app.DM2ivoXW.js","imports":["_app/immutable/entry/start.Cjibruru.js","_app/immutable/chunks/entry.rZiOR87Z.js","_app/immutable/chunks/scheduler.Kfbu0MiU.js","_app/immutable/chunks/index.8A4vigZy.js","_app/immutable/entry/app.DM2ivoXW.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js","_app/immutable/chunks/scheduler.Kfbu0MiU.js","_app/immutable/chunks/index.GJ8jQDOz.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
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
