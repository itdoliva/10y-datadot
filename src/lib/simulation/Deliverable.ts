import { get } from 'svelte/store';

import Simulation from "./Simulation"
import AttributeController from "./AttributeController"
import DeliverableContext from "./DeliverableContext"
import { nodeSize } from "../stores/nodes"; 


export default class Deliverable {
  public simulation: Simulation
  
  public id: number
  public clientId: number
  public projectId: number
  public categories: number[]

  public complexity: number

  public year: number
  public channel: number
  public industry: number
  public designs: number[]
  public goals: number[]
  public products: number[]
  
  public i: number
  public active: boolean = true
  public selected: boolean = false

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

  constructor(simulation: Simulation, dataPoint: any) {
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

    this.categories = [
      dataPoint.channel,
      dataPoint.industry,
      ...dataPoint.designs,
      ...dataPoint.goals,
      ...dataPoint.products
    ]

    this.attr = new AttributeController(this)
    this.context = new DeliverableContext(this, this.categories)
  }


  public radius = () => this.active ? get(nodeSize) : 0

  public tick = () => {
    // SELECTED STATE
    if (this.simulation.onSelectedState && this.selected) {
    }

    else if (this.simulation.onSelectedState && !this.selected) {
      this.fx = undefined
      this.fy = undefined
      this.attr.render.fx = this.x
      this.attr.render.fy = this.y
    }

    // NOT SELECTED STATE
    else {
      const { theta, radius, px, py } = this.attr.render
      this.fx = this.attr.render.fx = Math.cos(theta) * radius + px
      this.fy = this.attr.render.fy = Math.sin(theta) * radius + py
    }

  }

  public setActive = (fyears: number[], findustries: number[], fdesigns: number[], fgoals: number[], fproducts: number[]) => {
    this.active = !(
      (fyears && (this.year < fyears[0] || this.year > fyears[1])) ||
      (fdesigns && fdesigns.length > 0 && !this.designs.some(design => fdesigns.includes(design))) ||
      (fgoals && fgoals.length > 0 && !this.goals.some(goal => fgoals.includes(goal))) || 
      (fproducts && fproducts.length > 0 && !this.products.some(product => fproducts.includes(product))) ||
      (findustries && findustries.length > 0 && !findustries.includes(this.industry))
    )
  }

  public handleSelected = (selected) => {
    this.selected = selected && this.id === selected.id
    this.context.context.eventMode = selected ? "none" : "dynamic"
    this.attr.selected(this.selected)
  }


}