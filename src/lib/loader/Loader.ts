import { nodesLoaded } from "../stores/loading";

export class Loader {
  private initAt: number
  private minLoadingTime: number

  private nodesLoaded = false

  constructor(minLoadingTime: number) {
    this.initAt = Date.now()
    this.minLoadingTime = 5000 // minLoadingTime
  }

  public handleNodesLoaded = ()  => {
    if (this.nodesLoaded) {
      return
    }

    this.nodesLoaded = true

    // Interval between app load and nodes loaded
    const interval = Date.now() - this.initAt

    // Check how much time it still needs to wait, based on the minLoadingTime
    // to set nodesLoaded = true
    const startDelay = Math.max(this.minLoadingTime - interval, 0)

    setTimeout(() => {
      nodesLoaded.set(true)
    }, startDelay)
  }
}