import { get } from 'svelte/store';

import Simulation from "./Simulation"
import AttributeController from "./AttributeController"
import DeliverableContext from "./DeliverableContext"
import { nodeSize } from "../stores/nodes"; 
import _ from 'lodash';


export default class Deliverable {
  public simulation: Simulation
  
  public id: number

  public client: string
  public project: string

  public description: string
  
  public complexity: number
  
  public dt: number
  public date: string

  public year: number
  
  public channel: string
  public industry: string
  public product: string
  public designs: string[]
  public goals: string[]
  public categories: string[]
  
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

    this.client = dataPoint.client
    this.project = dataPoint.project
    this.description = dataPoint.description

    this.complexity = dataPoint.complexity

    this.dt = dataPoint.dt
    this.date = dataPoint.date

    this.year = dataPoint.year
    this.channel = dataPoint.channel
    this.industry = dataPoint.industry
    this.designs = dataPoint.design
    this.goals = dataPoint.goal
    this.product = dataPoint.product

    this.categories = [
      dataPoint.channel,
      dataPoint.industry,
      dataPoint.product,
      ...dataPoint.design,
      ...dataPoint.goal,
    ].flat()

    this.attr = new AttributeController(this)
    this.context = new DeliverableContext(this, this.categories)
  }


  public radius = () => this.active ? get(nodeSize) : 0


  public tick = () => {
    // SELECTED STATE
    if (this.simulation.onSelectedState && this.selected) { 

    }

    else if (this.simulation.onSelectedState === true && !this.selected) {
      this.fx = undefined
      this.fy = undefined
      this.attr.render.fx = this.x
      this.attr.render.fy = this.y
    }

    else if (this.simulation.onSelectedState === "leaving" && !this.selected) {
      this.attr.render.fy = this.y + this.attr.render.py
    }

    // NOT SELECTED STATE

    else {
      const { theta, radius, px, py } = this.attr.render
      this.fx = this.attr.render.fx = Math.cos(theta) * radius + px
      this.fy = this.attr.render.fy = Math.sin(theta) * radius + py
    }

  }

  public setActive = (fyears: number[], findustries: string[], fdesigns: string[], fgoals: string[], fproducts: string[]) => {
    this.active = !(
      (fyears && (this.year < fyears[0] || this.year > fyears[1])) ||
      (fdesigns && fdesigns.length > 0 && !this.designs.some(design => fdesigns.includes(design))) ||
      (fgoals && fgoals.length > 0 && !this.goals.some(goal => fgoals.includes(goal))) || 
      (fproducts && fproducts.length > 0 && !fproducts.includes(this.product)) ||
      (findustries && findustries.length > 0 && !findustries.includes(this.industry))
    )
  }

  public handleSelected = (selected) => {
    this.selected = selected && this.id === selected.id
    this.context.toggleEventMode()
    this.attr.selected(this.selected)
  }


}