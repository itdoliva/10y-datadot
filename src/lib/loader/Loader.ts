import { loaded } from "../stores/loading";

export class Loader {
  private initAt: number
  private minLoadingTime: number

  private toLoad = [
    "nodes"
  ]

  constructor(minLoadingTime: number) {
    this.initAt = Date.now()
    this.minLoadingTime = minLoadingTime
  }

  public setLoaded = (key: string) => {
    if (!this.toLoad.includes(key)) {
      return
    }

    const index = this.toLoad.indexOf(key)
    this.toLoad.splice(index, 1)

    if (this.toLoad.length === 0) {
      // Interval between app load and nodes loaded
      const runningTime = Date.now() - this.initAt

      setTimeout(() => {
        loaded.set(true)
      }, Math.max(this.minLoadingTime - runningTime, 0))
    }
  }
}