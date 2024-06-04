import { gsap } from "gsap"

export default class SignalController {
  private id: string

  // Controls whether it was already signalized or it's not necessary to signalize
  private rejected = false

  private timeoutId

  constructor(id: string) {
    this.id = id
  }

  private setVisibility = (to: boolean) => {
    const el = document.getElementById(this.id)

    if (!el) {
      return
    }

    const tl = gsap.timeline({ overwrite: true })

    if (to) {
      tl
        .set(el, { display: "block" })
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: .5 })
    }
    else {
      tl
        .fromTo(el, { opacity: 1 }, { opacity: 0, duration: .5 })
        .set(el, { display: "none" })
    }

  }

  public prepare() {
    if (this.rejected || this.timeoutId) {
      return
    }

    this.timeoutId = setTimeout(() => {
      this.setVisibility(true)
    }, 5000)
  }

  public stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    this.setVisibility(false)
  }

  public kill() {
    this.stop()
    this.rejected = true
  }

}