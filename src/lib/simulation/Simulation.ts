// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";
import { get } from "svelte/store";

// Stores
import { figureHeight, figureWidth, isSwitchingLayout } from "../stores/canvas";
import { gap, nodeSize, sortBy, categories, categoriesEnriched } from "../stores/nodes";
import { isReady } from "../stores/loading";

// Classes, Functions & Interfaces
import randomDensity from "../utility/randomDensity"
import makeSectorData from "./makeSectorData"
import Deliverable from "./Deliverable"
import { SortBy, Layout, Transition } from "../types/simulation"

export const c: any = {}

c.shifts = 1
c.maxDelayRadial = .7 * c.shifts
c.easeDelay = d3.easeCubicInOut
c.easeEntrance = d3.easeCubicInOut
c.easeFade = d3.easeCubicInOut
c.easeExit = d3.easeSinIn
c.colEntranceUpTo = c.shifts * .2
c.fullColEntranceMaxDuration = c.shifts - c.colEntranceUpTo

// Filter Transitions
c.filterTotalDuration = c.shifts
c.filterBetweenGap = c.filterTotalDuration * .15
c.filterDuration = c.filterTotalDuration - c.filterBetweenGap
c.filterHalf1 = c.filterDuration * .4
c.filterHalf2 = c.filterDuration * .6

// Do not edit
c.maxDurationRadial = (c.shifts - c.maxDelayRadial)

export default class Simulation {
  public layout: Layout
  public onSelectedState: boolean

  private loaded: boolean

  // Layout Dimensions
  private width: number
  private height: number

  private forceSimulation: any
  private forceCollide: any
  private forceX: any
  private forceY: any

  private nodes: Deliverable[] = []

  constructor() {
    this.nodes = []
  }
  
  
  public data = (data: any[]) => {
    console.log("data")
    const s_sortBy = get(sortBy)

    const loading: Promise<any>[] = []
    
    data.forEach(dataPoint => {
      const node = new Deliverable(this, dataPoint)
      this.nodes.push(node)
      loading.push(node.context.loading)
    })

    this.nodes
      .sort((a, b) => +b.active - +a.active || a[s_sortBy] - b[s_sortBy] )
      .forEach((node, i) => node.i = i)

    Promise.all(loading).then(() => {
      this.setNodesAttr()
      this.updateCategories()
      this.initSimulation()
      isReady.set(true)
    })

  }

  private initSimulation() {
    this.forceCollide = d3.forceCollide().radius(this.forceCollideRadius)
    this.forceX = d3.forceX().strength(.005)
    this.forceY = d3.forceY().strength(.005)

    this.forceSimulation = d3.forceSimulation()
      .alphaTarget(0.3) // stay hot
      .velocityDecay(0.25) // low friction
      .force("charge", d3.forceManyBody().strength(-5))
      .force("x", this.forceX)
      .force("y", this.forceY)
      .force("collide", this.forceCollide)
      .nodes(this.nodes)
      .on("tick", this.ticked)
  }

  private forceCollideRadius = (node: Deliverable) => node.radius()

  private ticked = () => this.nodes.forEach(node => node.tick())

  private updateCategories() {
    const categoriesOfInterest = [ 'products', 'designs', 'industries' ]

    const enriched = { ...get(categories) }
  
    const activeNodes = this.nodes.filter(d => d.active)
  
    categoriesOfInterest.forEach(category => {
      enriched[category].forEach(d => {
        const { id } = d
  
        const f = category !== 'industries'
          ? node => node[category].includes(id)
          : node => node.industry === id
  
        d.nNodes = activeNodes.filter(f).length
        d.pctNodes = +(d.nNodes / activeNodes.length).toFixed(2)
      })
    })

    categoriesEnriched.set(enriched)
  }

  public play(transition: Transition) {
    if (transition === "exit") {
      this.nodes.forEach(node => node.attr.playExit())
    }
  }

  public setLayout(newLayout: Layout) {
    console.log("setLayout")

    if (newLayout === this.layout) return

    this.layout = newLayout

    if (!this.onSelectedState) {
      const onStart = () => isSwitchingLayout.set(true)
      const onComplete = () => isSwitchingLayout.set(false)
      
      const tl = gsap.timeline({ 
        overwrite: true, 
        onStart, 
        onComplete, 
        onInterrupt: onComplete 
      })

      tl.call(this.play, ["exit"])
        .call(this.play, ["entrance"], "+=1")
    }
  }

  public setSelected() {

  }

  public sort(sortBy: SortBy) {
    console.log("sort")
    this.nodes
      .sort((a, b) => +b.active - +a.active || a[sortBy] - b[sortBy] ) // Descending because we want active (1) before unactive (0)
      .forEach((node, i) => node.i = i)

    this.setNodesAttr()
    this.play("sort")
  }

  public filter(fyears: number[], findustries: number[], fdesigns: number[], fgoals: number[], fproducts: number[]) {
    console.log("filter")
    const beforeCount = this.nodes.filter(node => node.active).length
    
    this.nodes.forEach((node) => {
      const isDeactive = (
        (fyears && (node.year < fyears[0] || node.year > fyears[1])) ||
        (fdesigns && fdesigns.length > 0 && !node.designs.some(design => fdesigns.includes(design))) ||
        (fgoals && fgoals.length > 0 && !node.goals.some(goal => fgoals.includes(goal))) || 
        (fproducts && fproducts.length > 0 && !node.products.some(product => fproducts.includes(product))) ||
        (findustries && findustries.length > 0 && !findustries.includes(node.industry))
      )

      node.active = !isDeactive
    })

    const afterCount = this.nodes.filter(node => node.active).length

    this.updateCategories()

    const s_sortBy = get(sortBy)
    this.nodes
      .sort((a, b) => +b.active - +a.active || a[s_sortBy] - b[s_sortBy] ) // Descending because we want active (1) before unactive (0)
      .forEach((node, i) => node.i = i)

    const transition = afterCount < beforeCount ? "filter-out" : "filter-in"

    this.setNodesAttr()
    this.play(transition)
  }

  public toggleComplexity() {

  }

  private setLayoutDimensions(layoutWidth: number, layoutHeight: number) {
    this.width = layoutWidth
    this.height = layoutHeight
  }

  private setNodesBlockAttr(activeCount: number) {
    const s_nodeSize = get(nodeSize)
    const s_gap = get(gap)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)

    // Calculate aspect ratio of the figure
    const aspectRatio = s_fw / s_fh

    // Calculate initial number of rows and columns based on aspect ratio
    const initRows = Math.ceil(Math.sqrt(activeCount / aspectRatio))
    const initColumns = Math.ceil(aspectRatio * initRows)

    // Adjust rows to ensure all nodes fit within the figure width
    let rows = Math.ceil(activeCount / initColumns)
    let columns = initColumns

    // Calculate initial block width and height
    let blockWidth = (columns + 1) * (s_nodeSize + s_gap) - s_gap
    let blockHeight;

    // Reduce the number of columns until all nodes fit within the figure width
    while (blockWidth > s_fw) {
      // Remove one node column and Recalculate block width
      blockWidth = --columns * (s_nodeSize + s_gap) - s_gap

      // Recalculate rows to fit the reduced number of columns
      rows = Math.ceil(activeCount / columns)
    }

    // Once we have a block that fits the figureWidth, 
    // we remove another column to make margin
    blockWidth = --columns * (s_nodeSize + s_gap) - s_gap
    rows = Math.ceil(activeCount / columns)

    // Update block height
    blockHeight = rows * (s_nodeSize + s_gap) - s_gap

    // Update layout dimensions
    this.setLayoutDimensions(blockWidth, blockHeight)

    // Time calculation support
    const columnDensities = randomDensity(columns)
    const timeStepByRow = +(c.fullColEntranceMaxDuration / rows).toFixed(4)

    this.nodes.forEach(node => {
      const attr = { x: 0, y: 0, radius: 0, theta: 0, time: 0 }

      if (node.active) {
        const colIndex = Math.floor(node.i % columns)
        const rowIndex = Math.floor(node.i / columns)

        attr.x = colIndex * (s_nodeSize + s_gap) + s_nodeSize/2 - blockWidth/2
        attr.y = rowIndex * (s_nodeSize + s_gap) + s_nodeSize/2 - blockHeight/2
        attr.time = 
          columnDensities[colIndex] * c.colEntranceUpTo + // column delay
          timeStepByRow * rowIndex // row delay
      }

      node.attr.set(attr)
    })
  }

  private setNodesRadialAttr(activeCount: number) {
    const s_nodeSize = get(nodeSize)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)
    const s_groupBy = get(sortBy)

    const data = this.nodes.filter(node => node.active)
    const radialGap = s_nodeSize * 1.25
    const maxStack = activeCount**(1/3)

    let curSectorData
    let curSectorMetadata
    let curRadius = Math.min(s_fw, s_fh) * .05

    let isFitting = true

    // As long as the circle length for the current radius is less than the needed
    // length to carry, increases the current radius by each iteration
    do {
      const circleLength = 2 * Math.PI * curRadius
  
      // For each iteration, test
      const pileStacks = d3.range(1, maxStack + 1, 1)

      pileStacks.forEach((pileStack: number) => {
        const sectorData = makeSectorData(data, <SortBy>s_groupBy, pileStack)
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

    // Make Position Dataset from Optimal Sector Dataset
    const thetaScale = d3.scaleLinear()
      .domain([ 0, sectorMetadata.nPiles + sectorMetadata.nGaps ])
      .range([ 0, 2*Math.PI ])

    const timeScale = d3.scaleLinear()
      .domain([ 0, 2*Math.PI ])
      .range([ 0, c.maxDelayRadial ])

    // Update posData dataset
    this.nodes.forEach(node => {
      const attr = { x: 0, y: 0, theta: 0, radius: 0, time: 0 }

      const sectorDataPoint = sectorData.find(d => d.id === node.id)

      if (sectorDataPoint) {
        const { sectorIndex, pileIndex, inPileIndex } = sectorDataPoint

        attr.theta = thetaScale(pileIndex + sectorIndex)
        attr.radius = minRadius + inPileIndex * (radialGap + s_nodeSize)
        attr.x = Math.cos(attr.theta) * attr.radius
        attr.y = Math.sin(attr.theta) * attr.radius
        attr.time = timeScale(attr.theta)
      }

      node.attr.set(attr)
    })

    this.setLayoutDimensions(
      d3.max(this.nodes, (node: Deliverable) => node.attr.cur.x) - d3.min(this.nodes, (node: Deliverable) => node.attr.cur.x), 
      d3.max(this.nodes, (node: Deliverable) => node.attr.cur.y) - d3.min(this.nodes, (node: Deliverable) => node.attr.cur.y)
    )
  }

  private setNodesAttr() {
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)

    if (s_fw + s_fh === 0) return

    const activeCount = this.nodes.filter(d => d.active).length

    if (this.layout === "block") {
      this.setNodesBlockAttr(activeCount)
    } 
    else {
      this.setNodesRadialAttr(activeCount)
    }
  }


}