// Libraries
import * as d3 from "d3";
import { gsap } from "gsap";
import { get } from "svelte/store";

// Classes
import { SimulationNode, DummySimulationNode } from "./SimulationNode";
import ZoomController from "./ZoomController";

// Stores
import { dataset, nodes, nodeSize, gap, sortBy } from "../stores/nodes";
import { figureHeight, figureWidth, isSwitchingLayout } from "../stores/canvas";

// Functions
import randomDensity from "../utility/randomDensity"
import makeSectorData from "./makeSectorData"

// Files
import c from "../config/layout";

// Types
import { Node, Nodes } from "../types/node"
import { Dimensions, BlockConfigData, LayoutConfig, Padding } from "./interfaces";

export type Layout = "radial" | "block";
export type State = "idle" | "entrance" | "exit" | "filter-in" | "filter-out" | "sort" | "selected" | "selected-out";

export interface Command {
  layout: Layout;
  lastLayout?: Layout;
  state: State;
}

export default class Simulation {
  public dummyNode: DummySimulationNode;
  private nodes: SimulationNode[];

  // ZoomController account for defining the zoomTranslateExtent
  // whenever a new Layout is calculated
  private zoomController: ZoomController; 

  public command: Command;
  
  public inplaceIdleProps: boolean;

  public simulation;
  public forceCollide;
  public forceX;
  public forceY;

  public layoutWidth
  public layoutHeight
  public layoutExtent
  public layoutPadding
  public layoutOffsetX
  public layoutOffsetY

  public posData;

  public onSelectedState: boolean;


  constructor(initLayout: Layout, initState: State, zoomController: ZoomController) {

    this.command = {
      layout: initLayout,
      state: initState
    }

    this.zoomController = zoomController;

    this.inplaceIdleProps = false;

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

    this.setIdleProps()
    this.playState()
  }

  // PRIVATE
  private forceCollideRadius = (node: SimulationNode) => {
    // console.log('*forceCollideRadius')
    return node.getRadius()
  }

  private ticked = () => {
    this.nodes.forEach((node: SimulationNode) => node.tick())
  }


  private setLayoutDimensions(w, h, { updatePadding=true, updateExtent=true } = {}) {
    if (w) this.layoutWidth = w
    if (h) this.layoutHeight = h

    if (updatePadding) this.updatePadding()
    if (updateExtent) this.updateExtent()
  }

  public updatePadding() {
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)
    const s_nodeSize = get(nodeSize)

    const { layoutWidth, layoutHeight, command } = this
    const { layout } = command

    const padding = { left: 0, top: 0 }

    if (layout === "block") {
      padding.left = (s_fw - layoutWidth)/2 // + s_nodeSize/2
      padding.top = layoutHeight < s_fh  
        ? (s_fh - layoutHeight)/2 + s_nodeSize/2 
        : s_nodeSize

      this.layoutOffsetX = -s_fw/2 + padding.left
      this.layoutOffsetY = -s_fh/2 + padding.top
    }
    else {
      padding.left = s_fw / 2
      padding.top = s_fh / 2

      this.layoutOffsetX = 0
      this.layoutOffsetY = 0
    }

    this.layoutPadding = padding
  }

  public updateExtent() {
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)
    const s_nodeSize = get(nodeSize)

    const { layoutWidth, layoutHeight, command } = this
    const { layout } = command

    let extentX: number[] = []
    let extentY: number[] = []
    
    if (layout === "block") {
      const exceedY = (layoutHeight + s_nodeSize) - s_fh

      extentX = [ 0, s_fw ]
      extentY = exceedY > 0
        ? [ 0, (layoutHeight + s_nodeSize) ]
        : [ 0, s_fh ]
    }
    else {
      const margin = s_nodeSize*3

      const exceedX = layoutWidth - s_fw
      const exceedY = layoutHeight - s_fh

      extentX = exceedX > 0 
        ? [ -(exceedX/2 + margin), s_fw + (exceedX/2 + margin)] 
        : [ 0, s_fw ]

      extentY = exceedY > 0 
      ? [ -(exceedY/2 + margin), s_fh + (exceedY/2 + margin)] 
      : [ 0, s_fh ]
    }

    this.layoutExtent = extentX.map((_, i) => [ extentX[i], extentY[i] ])

    this.zoomController.translateExtent(this.layoutExtent)
  }

  private setBlockPosData() {
    const s_nodes: Nodes = <Nodes>get(nodes)
    const s_nodeSize = get(nodeSize)
    const s_gap = get(gap)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)

    // Calculate aspect ratio of the figure
    const aspectRatio = s_fw / s_fh

    // Calculate initial number of rows and columns based on aspect ratio
    const initRows = Math.ceil(Math.sqrt(s_nodes.activeCount / aspectRatio))
    const initColumns = Math.ceil(aspectRatio * initRows)

    // Adjust rows to ensure all nodes fit within the figure width
    let rows = Math.ceil(s_nodes.activeCount / initColumns)
    let columns = initColumns

    // Calculate initial block width and height
    let blockWidth = (columns + 1) * (s_nodeSize + s_gap) - s_gap
    let blockHeight;

    // Reduce the number of columns until all nodes fit within the figure width
    while (blockWidth > s_fw) {
      // Remove one node column and Recalculate block width
      blockWidth = --columns * (s_nodeSize + s_gap) - s_gap

      // Recalculate rows to fit the reduced number of columns
      rows = Math.ceil(s_nodes.activeCount / columns)
    }

    // Once we have a block that fits the figureWidth, 
    // we remove another column to make margin
    blockWidth = --columns * (s_nodeSize + s_gap) - s_gap
    rows = Math.ceil(s_nodes.activeCount / columns)

    // Update block height
    blockHeight = rows * (s_nodeSize + s_gap) - s_gap

    // Update layout dimensions
    this.setLayoutDimensions(blockWidth, blockHeight)

    // Time calculation support
    const columnDensities = randomDensity(columns)
    const timeStepByRow = +(c.fullColEntranceMaxDuration / rows).toFixed(4)

    // Update posDataset
    this.posData = s_nodes.map(({ id, i, active }) => {
      const pos = { x: 0, y: 0, radius: 0, time: 0 }
      const dataPoint = { id, pos }

      if (!active) return dataPoint

      const colIndex = Math.floor(i % columns)
      const rowIndex = Math.floor(i / columns)

      pos.x = colIndex * (s_nodeSize + s_gap) + s_nodeSize/2 // - fw/2 + padding.left
      pos.y = rowIndex * (s_nodeSize + s_gap) + s_nodeSize/2 // - fh/2 + padding.top
      pos.time = (
        columnDensities[colIndex] * c.colEntranceUpTo + // column delay
        timeStepByRow * rowIndex // row delay
      )

      return dataPoint
    })

  }

  private setRadialPosData() {
    const s_nodes: Nodes = <Nodes>get(nodes)
    const s_nodeSize = get(nodeSize)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)
    const s_groupBy = get(sortBy)

    const data = s_nodes.filter(d => d.active)
    const radialGap = s_nodeSize * 1.25
    const maxStack = s_nodes.activeCount**(1/3)

    let curSectorData
    let curSectorMetadata
    let curRadius = Math.min(s_fw, s_fh) * .05

    // console.log([s_nodeSize, s_fw, s_fh, s_groupBy, data, radialGap, maxStack].every(d => d !== undefined && d !== null))

    let isFitting = true

    // As long as the circle length for the current radius is less than the needed
    // length to carry, increases the current radius by each iteration
    do {
      const circleLength = 2 * Math.PI * curRadius
  
      // For each iteration, test
      const pileStacks = d3.range(1, maxStack + 1, 1)
      pileStacks.forEach((pileStack: number) => {
        const sectorData = makeSectorData(data, s_groupBy, pileStack)
        curSectorData = sectorData[0]
        curSectorMetadata = sectorData[1]
  
        const layoutCircleLength = (curSectorMetadata.nPiles + curSectorMetadata.nGaps) * radialGap
  
        isFitting = circleLength < layoutCircleLength
      })
  
      curRadius += radialGap
      
    } while (isFitting)

    const sectorData = curSectorData
    const sectorMetadata = curSectorMetadata
    const minRadius = curRadius

    // console.log([sectorData, sectorMetadata, minRadius].every(d => d !== undefined && d !== null))
    console.log(sectorMetadata)

    // Make Position Dataset from Optimal Sector Dataset
    const thetaScale = d3.scaleLinear()
      .domain([ 0, sectorMetadata.nPiles + sectorMetadata.nGaps ])
      .range([ 0, 2*Math.PI ])

    const timeScale = d3.scaleLinear()
      .domain([ 0, 2*Math.PI ])
      .range([ 0, c.maxDelayRadial ])

    // Update posData dataset
    this.posData = s_nodes.map(({ id }) => {
      const pos = { x: 0, y: 0, theta: 0, radius: 0, time: 0 }
      const dataPoint = { id, pos }

      const sectorDataPoint = sectorData.find(d => d.id === id)

      if (sectorDataPoint) {
        const { sectorIndex, pileIndex, inPileIndex } = sectorDataPoint

        pos.theta = thetaScale(pileIndex + sectorIndex)
        pos.radius = minRadius + inPileIndex * (radialGap + s_nodeSize)
        pos.x = Math.cos(pos.theta) * pos.radius
        pos.y = Math.sin(pos.theta) * pos.radius
        pos.time = timeScale(pos.theta)
      }

      return dataPoint
    })

    const radialWidth = d3.max(this.posData, d => d.pos.x) - d3.min(this.posData, d => d.pos.x)
    const radialHeight = d3.max(this.posData, d => d.pos.y) - d3.min(this.posData, d => d.pos.y)

    this.setLayoutDimensions(radialWidth, radialHeight)
  }

  private setPosData() {
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)

    if (s_fw + s_fh === 0) return

    if (this.command.layout === "block") {
      this.setBlockPosData()
    }
    else {
      this.setRadialPosData()
    }
  }

  private setIdleProps = () => { //{ curNodes, sortBy, dimensions }
    // console.log('*setIdleProps')

    this.setPosData()

    if (!this.posData) return

    this.nodes.forEach(node => node.setIdleProps())
  }



  // PUBLIC
  public updateForceCollideRadius = () => {
    // console.log('updateForceCollideRadius')
    this.forceCollide.radius(this.forceCollideRadius)
  }

  public updateForceXY = (xPos: number, yPos: number) => {
    // console.log('updateForceXY')
    this.forceX.x(xPos)
    this.forceY.y(yPos)
  }

  public getNodeById = (id: number) => {
    // console.log('getNodeById')
    return this.nodes.find(d => d.id === id)
  }

  public getNodesByClientId = (clientId: number) => {
    // console.log('getNodesByClientId')
    return this.nodes.filter(d => d.clientId === clientId)
  }

  public getNodesByProjectId = (projectId: number) => {
    // console.log('getNodesByProjectId')
    return this.nodes.filter(d => d.projectId === projectId)
  }

  public toggleComplexity = (complexityOn: true) => {
    const targetNodes = this.nodes.slice(1)

    targetNodes.forEach(node => node.playComplexity(complexityOn))
  }

  public getLayout(): Layout {
    // console.log('getLayout')
    return this.command.layout
  }

  public getState(): State {
    // console.log('getState')
    return this.command.state
  }

  public switchLayout(newLayout: Layout) {
    // console.log('switchLayout')
    const curLayout = this.command.layout

    if (newLayout === curLayout) {
      return
    }

    const { command, playState } = this

    const delay = c.shifts

    if (command.state !== "selected") {
      gsap.timeline({ overwrite: true })
        .call(() => isSwitchingLayout.set(true))
        .set(command, { state: "exit", onComplete: playState })
        .set(command, { layout: newLayout, state: "entrance", delay, onComplete: playState, onCompleteParams: [ true ] })
        .set(command, { state: "idle", onComplete: playState, delay })
        .call(() => isSwitchingLayout.set(false))
    }
    else {
      command.layout = newLayout
    }
  }

  public resorted() {
    // console.log('resorted')
    // Should be called once the node sorting is changed
    const { command, playState } = this

    const delay = c.shifts

    this.setIdleProps()

    gsap.timeline({ overwrite: true })
    .set(command, { state: "sort", onComplete: playState })
    .set(command, { state: "idle", delay })
  }

  public filtered(isExclusion: boolean) {
    // console.log('filtered')
    const { command, playState } = this

    const delay = c.shifts

    const state = isExclusion ? "filter-out" : "filter-in"

    this.setIdleProps()

    gsap.timeline({ overwrite: true })
    .set(command, { state, onComplete: playState })
    .set(command, { state: "idle", onComplete: playState, delay })

  }

  public playState = (setIdleProps=false) => {
    // console.log('playState:', this.command.state)

    const { layout, state } = this.command

    if (setIdleProps) {
      this.setIdleProps()
    }

    if (!layout || !this.posData) {
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

  public playSelected = (selected) => {
    this.nodes.forEach((node) => node.toggleSelected(selected))
  }

  public toggleSelected(selected) {
    // console.log('toggleSelected', selected)

    this.onSelectedState = selected.active

    const { command, onSelectedState, playState, playSelected } = this

    const tl = gsap.timeline({ overwrite: true })

    if ( onSelectedState ) {
      tl
      .set(command, { state: "selected", onComplete: playSelected, onCompleteParams: [ selected ] })
    }
    else if ( command.state === "selected" ) {
      tl
      .call(() => isSwitchingLayout.set(true))
      .set(command, { state: "exit", onComplete: playState })
      .set(command, { state: "entrance", onComplete: playState, delay: c.shifts })
      .call(() => isSwitchingLayout.set(false))
    }
  }


}
