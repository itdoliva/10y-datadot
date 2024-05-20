import { get } from 'svelte/store';

import { loader } from '../loader';
import Simulation from "./Simulation"
import AttributeController from "./AttributeController"
import DeliverableContext from "./DeliverableContext"
import { nodeSize } from "../stores/nodes"; 


export default class Deliverable {
  public simulation: Simulation
  
  public id: number
  private clientId: number
  private projectId: number
  private categories: number[]
  private complexity: number

  public year: number
  public channel: number
  public industry: number
  public designs: number[]
  public goals: number[]
  public products: number[]
  
  public i: number
  public active: boolean
  private selected: boolean

  public attr: AttributeController
  public context: DeliverableContext

  // Force Simulation Properties
  public index: number
  public x: number
  public y: number
  public vx: number
  public vy: number
  public fx: number | undefined
  public fy: number | undefined

  constructor(simulation, dataPoint) {
    this.simulation = simulation

    this.id = dataPoint.id
    this.clientId = dataPoint.clientId
    this.projectId = dataPoint.projectId
    this.complexity = dataPoint.complexity

    this.year = dataPoint.year
    this.channel = dataPoint.channel
    this.industry = dataPoint.industry
    this.designs = dataPoint.designs
    this.goals = dataPoint.goals
    this.products = dataPoint.products

    this.active = true
    this.selected = false
    
    this.categories = [
      dataPoint.channel,
      dataPoint.industry,
      ...dataPoint.designs,
      ...dataPoint.goals,
      ...dataPoint.products
    ]

    this.attr = new AttributeController(this)
    this.context = new DeliverableContext(this.categories)
  }


  public radius = () => this.active ? get(nodeSize) : 0

  public tick = () => {
    // SELECTED STATE
    if (this.simulation.onSelectedState && this.selected) {
    }

    else if (this.simulation.onSelectedState && !this.selected) {
      this.fx = undefined
      this.fy = undefined
      this.attr.render.x = this.attr.tweened.x = this.x
      this.attr.render.y = this.attr.tweened.y = this.y
    }

    // NOT SELECTED STATE
    else if (this.attr.tweened) {
      const { tweenX, tweenY } = this.attr.getTweenCoordinates()

      this.fx = this.attr.render.x = tweenX
      this.fy = this.attr.render.y = tweenY
    }
  }


}