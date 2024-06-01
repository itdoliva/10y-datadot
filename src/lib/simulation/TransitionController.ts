import { ITransition, TransitionType, Layout, ILayoutSize } from "../types/simulation";
import Simulation from "./Simulation";

export default class TransitionController {
  private simulation: Simulation

  private queue: ITransition[] = []
  
  private cur?: ITransition
  public running: boolean = false

  constructor(simulation: Simulation) {
    this.simulation = simulation
  }

  private updateState = (transition?: ITransition) => {
    const prev = this.cur
    
    this.cur = transition
    this.running = !!transition

    if (!this.running && prev && prev.type === "exit") return

    this.simulation.handleTransition(this.running)
    this.simulation.getDeliverableNodes().forEach(node => node.context.toggleEventMode())
  }


  public add = (options: ITransition, playNext: boolean=true) => {
    // If a new transition is added while in the SELECTED state
    // the queue is clean and a new exit/entrance transition is added
    // considered the new provided attrId, layout and layoutSize
    if (this.simulation.onSelectedState) {
      this.cleanQueue()
      this.addSelectedLeaving(options)
      return
    }

    this.queue.push(options)

    playNext && this.playNext()
  }

  public addSelectedLeaving = (options: { attrId?: number, layout?: Layout, layoutSize?: ILayoutSize }) => {
    const { attrId, layout, layoutSize } = options

    const onStart = () => { 
      this.simulation.onSelectedState = "leaving" 
    }
    
    const onComplete = () => { 
      this.simulation.onSelectedState = false 
    }

    this.queue.push({ type: "exit", onStart, onComplete })
    this.queue.push({ type: "entrance", attrId, layout, layoutSize })
  }


  public playNext = (forceRun: boolean = false) => {
    if (!forceRun && (this.running || this.queue.length === 0)) {
      return
    }

    // Get next transition
    const transition = <ITransition>this.queue.shift()

    transition.onStart && transition.onStart()

    this.updateState(transition)

    if (transition.layout) {
      const { layout, layoutSize } = transition

      const moveOptions = {
        duration: transition.type === "entrance" ? 0 : 750,
      }

      this.simulation.zoom
        .updateTranslateExtent(layout, layoutSize)
        .updateScaleExtent(layout)
        .reposition(layout, moveOptions)
    }

    const nodeTransitions = this.simulation.getDeliverableNodes()
      .map(node => node.attr.play(transition).then())


    Promise.all(nodeTransitions)
      .catch((error) => console.error("Transition failed:", error))
      .finally(() => {
        this.updateState()
        transition.onComplete && transition.onComplete()
        this.playNext()
      })

  }

  public cleanQueue = () => {
    while (this.queue.length) {
      const { attrId } = <ITransition>this.queue.pop() 

      if (attrId) {
        this.simulation.getDeliverableNodes().forEach(node => node.attr.pop(attrId))
      }
    }
  }

}