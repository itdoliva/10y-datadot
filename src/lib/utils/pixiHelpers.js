import { get } from "svelte/store"
import { app } from "$lib/stores/canvas";

export function getCtxByName(name) {
  return get(app).stage.getChildByName(name, true)
}

export function addTicker(cb) {
  return get(app).ticker.add(cb)
}

export function removeTicker(cb) {
  return get(app).ticker.remove(cb)
}