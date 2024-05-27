import { ITransition, TransitionType, Layout, ILayoutSize } from "../types/simulation";
import Simulation from "./Simulation";

export default class TransitionController {
  private simulation: Simulation

  private queue: ITransition[] = []
  public running: boolean = false

  constructor(simulation: Simulation) {
    this.simulation = simulation
  }

  public add = (
    type: TransitionType, 
    attrId: number|undefined=undefined, 
    layout: Layout|undefined=undefined, 
    layoutSize: ILayoutSize|undefined=undefined
  ) => {
    this.queue.push({ type, attrId, layout, layoutSize })
    this.playNext()
  }

  private playNext = () => {
    if (this.running || this.queue.length === 0) {
      return
    }

    const transition = <ITransition>this.queue.shift()
    
    this.updateRunning(true)

    const tlPromises = this.simulation.getDeliverableNodes().map(node => {
      return node.attr.play(transition).then()
    })


    if (transition.layout) {
      this.simulation.zoom.updateScaleExtent(transition.layout)
    }

    if (transition.layout && transition.layoutSize) {
      const moveTo = transition.layout === "block" ? "top" : "center"

      this.simulation.zoom.updateTranslateExtent(transition.layout, transition.layoutSize, moveTo)
    }


    Promise.all(tlPromises)
      .then(() => {
        this.updateRunning(false, transition.type === "exit")
        this.playNext()
      })
      .catch((error) => {
        console.error("Transition failed:", error)
        this.updateRunning(false)
        this.playNext()
      })

  }

  private updateRunning = (isRunning: boolean, suppressEvents=false) => {
    this.running = isRunning

    if (suppressEvents) {
      return
    }

    this.simulation.handleTransition(isRunning)
  }
}