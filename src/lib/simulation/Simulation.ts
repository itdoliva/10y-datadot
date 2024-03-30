import * as d3 from "d3";
import { gsap } from "gsap";
import { get } from "svelte/store";

import { SimulationNode, DummySimulationNode } from "./SimulationNode";
import { dataset, nodes, nodeSize, gap, sortBy } from "../stores/nodes";

import getPosBlock from "./getPosBlock";
import getPosRadial from "./getPosRadial";
import c from "../config/layout";
import { figureHeight, figureWidth } from "../stores/canvas";

import { Node, Nodes } from "../types/node"

export type Layout = "radial" | "block";
export type State = "idle" | "entrance" | "exit" | "filter-in" | "filter-out" | "selected" | "sort";

export interface Command {
  layout: Layout;
  lastLayout?: Layout;
  state: State;
}

export default class Simulation {
  public dummyNode: DummySimulationNode;
  private nodes: SimulationNode[];

  public command: Command;
  public config;
  
  public inplaceIdleProps: boolean;

  public simulation;
  public forceCollide;
  public forceX;
  public forceY;


  constructor(initLayout: Layout, initState: State) {

    this.command = {
      layout: initLayout,
      state: initState
    }

    this.inplaceIdleProps = false;

    this.updateIdleProps()

    this.dummyNode = new DummySimulationNode(this);

    this.nodes = [ 
      this.dummyNode,
      ...get(dataset).map(({ id, clientId, projectId }) => new SimulationNode(this, id, clientId, projectId))
    ]

    this.forceCollide = d3.forceCollide()
      .radius(this.forceCollideRadius)

    this.forceX = d3.forceX().strength(.005)

    this.forceY = d3.forceY().strength(.005)

    this.simulation = d3.forceSimulation()
      .alphaTarget(0.3) // stay hot
      .velocityDecay(0.25) // low friction
      .force("charge", d3.forceManyBody().strength(-5))
      .force("x", this.forceX)
      .force("y", this.forceY)
      .force("collide", this.forceCollide)
      .nodes(this.nodes)
      .on("tick", this.ticked)

    this.playState()
    

  }

  // PRIVATE
  private forceCollideRadius = (node: SimulationNode) => {
    console.log('*forceCollideRadius')
    return node.getRadius()
  }

  private ticked = () => {
    this.nodes.forEach((node: SimulationNode) => node.tick())
  }

  private getDimensions = () => {
    console.log('*getDimensions')
    return {
      fw: get(figureWidth),
      fh: get(figureHeight),
      nodeSize: get(nodeSize),
      gap: get(gap)
    }
  }

  private updateIdleProps = () => {
    console.log('*updateIdleProps')
    const nodes_ = <Nodes>get(nodes)
    const groupBy = get(sortBy)
    const dimensions = this.getDimensions()

    const { fw, fh } = dimensions
  
    if (fw + fh === 0) {
      return
    }
  
    const [ posDataset, config ] = this.command.layout === 'block'
      ? getPosBlock(nodes_, dimensions)
      : getPosRadial(nodes_, groupBy, dimensions)

    this.config = config

    this.nodes.forEach(node => {
      const posDataPoint = posDataset.find(d => d.id === node.id)

      const idleProps = posDataPoint 
        ? posDataPoint
        : { x: 0, y: 0, theta: 0, radius: 0, time: 0 }

      delete idleProps.id

      node.setIdleProps(idleProps, false) // const hasLayoutChanged = false // this.command.layout !== layout
    })
  }



  // PUBLIC
  public updateCollideRadius = () => {
    console.log('updateCollideRadius')
    this.forceCollide.radius(this.forceCollideRadius)
  }

  public updateCoordPos = (xPos: number, yPos: number) => {
    console.log('updateCoordPos')
    this.forceX.x(xPos)
    this.forceY.y(yPos)
  }

  public getNodeById = (id: number) => {
    console.log('getNodeById')
    return this.nodes.find(d => d.id === id)
  }

  public getNodesByClientId = (clientId: number) => {
    console.log('getNodesByClientId')
    return this.nodes.filter(d => d.clientId === clientId)
  }

  public getNodesByProjectId = (projectId: number) => {
    console.log('getNodesByProjectId')
    return this.nodes.filter(d => d.projectId === projectId)
  }

  public playState = (updateIdleProps=false) => {
    console.log('playState:', this.command.state)

    const { layout, state } = this.command

    if (updateIdleProps) {
      this.updateIdleProps()
    }

    if (!layout || !this.config) {
      return
    }

    const targetNodes = this.nodes.slice(1)


    if (state === "entrance") {
      targetNodes.forEach((node) => node.chainEntrance())
    }
    else if (state === "exit") {
      targetNodes.forEach((node) => node.chainExit())
    }
    else if (state === "filter-in") {
      targetNodes.forEach((node) => node.chainFilterIn())
    }
    else if (state === "filter-out") {
      targetNodes.forEach((node) => node.chainFilterOut())
    }
    else if (state === "sort") {
      targetNodes.forEach((node) => node.chainSort())
    }

  }

  public getLayout(): Layout {
    console.log('getLayout')
    return this.command.layout
  }

  public getState(): State {
    console.log('getState')
    return this.command.state
  }

  public switchLayout(newLayout: Layout) {
    console.log('switchLayout')
    const curLayout = this.command.layout

    if (newLayout === curLayout) {
      return
    }

    const { command, playState } = this

    const delay = c.shifts

    if (command.state !== "selected") {
      gsap.timeline({ overwrite: true })
        .set(command, { state: "exit", onComplete: playState })
        .set(command, { layout: newLayout, state: "entrance", delay, onComplete: playState, onCompleteParams: [ true ] })
        .set(command, { state: "idle", onComplete: playState, delay })
    }
    else {
      command.layout = newLayout
    }
  }

  public resorted() {
    console.log('resorted')
    // Should be called once the node sorting is changed
    const { command, playState } = this

    const delay = c.shifts

    this.updateIdleProps()

    gsap.timeline({ overwrite: true })
    .set(command, { state: "sort", onComplete: playState })
    .set(command, { state: "idle", delay })
  }

  public filtered(isExclusion: boolean) {
    console.log('filtered')
    const { command, playState } = this

    const delay = c.shifts

    const state = isExclusion ? "filter-out" : "filter-in"

    this.updateIdleProps()

    gsap.timeline({ overwrite: true })
    .set(command, { state, onComplete: playState })
    .set(command, { state: "idle", onComplete: playState, delay })

  }

  public toggleSelected(isSelectedActive) {
    console.log('toggleSelected')
    const { command, playState } = this

    if ( isSelectedActive ) {
      gsap.set(command, { state: "selected", onComplete: playState, overwrite: true })
      
      this.dummyNode.playSwitchSelected(true)
    }
    else {
      if ( command.state === "selected" ) {
        gsap.set(command, { state: "idle", onComplete: playState, overwrite: true })
      }

      this.dummyNode.playSwitchSelected(false)
    }
  }

}
