// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";
import { get } from "svelte/store";
import _ from "lodash"
import * as PIXI from "pixi.js"
import loader from "../loader"

// Stores
import { figureHeight, figureWidth, isSwitchingLayout, linkClientOn, linkProjectOn } from "../stores/canvas";
import { gap, nodeSize, sortBy, categories, categoriesEnriched } from "../stores/nodes";

// Classes, Functions & Interfaces
import randomDensity from "../utility/randomDensity"
import makeSectorData from "../utility/makeSectorData"
import Deliverable from "./Deliverable"
import { SortBy, Layout, TransitionType, ITransition } from "../types/simulation"
import NodeAttributes from "./NodeAttributes";
import TransitionController from "./TransitionController";
import DummyDeliverable from "./DummyDeliverable";
import DeliverableGroup from "./DeliverableGroup";
import ZoomController from "../zoom/ZoomController";

export const c: any = {}

c.shifts = 1
c.maxDelayRadial = .7 * c.shifts
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
  public onSelectedState: boolean | "leaving" = false

  private initialized = false

  private activeIds: number[] = []
  private activeCount = 0

  // Transition
  private attrId = 0
  public transition: TransitionController

  // Zoom
  public zoom: ZoomController

  private forceSimulation: any
  private forceCollide: any
  private forceX: any
  private forceY: any

  private dummy: DummyDeliverable
  private nodes: ( Deliverable | DummyDeliverable)[] = []

  private clients: DeliverableGroup[] = []
  private projects: DeliverableGroup[] = []

  constructor() {
    this.transition = new TransitionController(this)
    this.zoom = new ZoomController(this)
    this.dummy = new DummyDeliverable(this)

    this.nodes.push(this.dummy)
  }

  // ------------------------ //
  // ------- INTERNAL ------- //
  // ------------------------ //

  private forceCollideRadius = (node:(Deliverable|DummyDeliverable)) => node.radius()

  private ticked = () => this.nodes.forEach(node => node.tick())

  private initSimulation = () => {
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

  private updateCategories = () => {
    const categoriesOfInterest = [ 'products', 'designs', 'industries' ]

    const enriched = { ...get(categories) }
  
    const activeNodes = this.getDeliverableNodes().filter(d => d.active)
  
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

  private chainNodesBlockAttr = (attrId: number) => {
    const s_nodeSize = get(nodeSize)
    const s_gap = get(gap)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)

    // Calculate aspect ratio of the figure
    const aspectRatio = s_fw / s_fh

    // Calculate initial number of rows and columns based on aspect ratio
    const initRows = Math.ceil(Math.sqrt(this.activeCount / aspectRatio))
    const initColumns = Math.ceil(aspectRatio * initRows)

    // Adjust rows to ensure all nodes fit within the figure width
    let rows = Math.ceil(this.activeCount / initColumns)
    let columns = initColumns

    // Calculate initial block width and height
    let blockWidth = (columns + 1) * (s_nodeSize + s_gap) - s_gap
    let blockHeight;

    // Reduce the number of columns until all nodes fit within the figure width
    while (blockWidth > s_fw) {
      // Remove one node column and Recalculate block width
      blockWidth = --columns * (s_nodeSize + s_gap) - s_gap

      // Recalculate rows to fit the reduced number of columns
      rows = Math.ceil(this.activeCount / columns)
    }

    // Once we have a block that fits the figureWidth, 
    // we remove another column to make margin
    blockWidth = --columns * (s_nodeSize + s_gap) - s_gap
    rows = Math.ceil(this.activeCount / columns)

    // Update block height
    blockHeight = rows * (s_nodeSize + s_gap) - s_gap

    // Time calculation support
    const columnDensities = randomDensity(columns)
    const timeStepByRow = +(c.fullColEntranceMaxDuration / rows).toFixed(4)


    this.getDeliverableNodes().forEach(node => {
      const attr = { x: 0, y: 0, radius: 0, theta: 0, time: 0, active: node.active }

      if (node.active) {
        const colIndex = Math.floor(node.i % columns)
        const rowIndex = Math.floor(node.i / columns)
 
        attr.x = colIndex * (s_nodeSize + s_gap) + s_nodeSize/2 - blockWidth/2
        attr.y = rowIndex * (s_nodeSize + s_gap) + s_nodeSize/2 - blockHeight/2
        attr.time = 
          columnDensities[colIndex] * c.colEntranceUpTo + // column delay
          timeStepByRow * rowIndex // row delay
      }

      node.attr.set(new NodeAttributes(attrId, attr))
    })

    return { width: blockWidth, height: blockHeight }
  }

  private chainNodesRadialAttr = (attrId: number) => {
    const s_nodeSize = get(nodeSize)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)
    const s_groupBy = get(sortBy)

    const data = this.getDeliverableNodes().filter(node => node.active)
    const radialGap = s_nodeSize * 1.25
    const maxStack = this.activeCount**(1/3)

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
    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0
    
    this.getDeliverableNodes().forEach(node => {
      const attr = { x: 0, y: 0, theta: 0, radius: 0, time: 0, active: node.active }

      const sectorDataPoint = sectorData.find(d => d.id === node.id)

      if (sectorDataPoint) {
        const { sectorIndex, pileIndex, inPileIndex } = sectorDataPoint

        attr.theta = thetaScale(pileIndex + sectorIndex)
        attr.radius = minRadius + inPileIndex * (radialGap + s_nodeSize)
        attr.x = Math.cos(attr.theta) * attr.radius
        attr.y = Math.sin(attr.theta) * attr.radius
        attr.time = timeScale(attr.theta)
      }

      if (attr.x < minX) { minX = attr.x } else
      if (attr.x > maxX) { maxX = attr.x }
      if (attr.y < minY) { minY = attr.y } else
      if (attr.y > maxY) { maxY = attr.y }

      node.attr.set(new NodeAttributes(attrId, attr))
    })

    const width = maxX - minX
    const height = maxY - minY

    return { width, height }
  }

  private chainNodeAttributes = (transitionType: TransitionType, delay=0) => {
    // console.groupCollapsed("chainNodeAttributes()")

    if (!this.initialized) return // console.groupEnd()

    // console.log(`chainNodes${_.capitalize(this.layout)}Attr()`)
    // console.groupEnd()

    const attrId = ++this.attrId

    const layoutSize = this.layout === "block"
      ? this.chainNodesBlockAttr(attrId)
      : this.chainNodesRadialAttr(attrId)

    setTimeout(() => {
      this.transition.add({
        type: transitionType, 
        attrId, 
        layout: this.layout, 
        layoutSize
      })
    }, delay)
  }



  // ----------------------- //
  // CALLED ON THIRD-PARTIES //
  // ----------------------- //

  private debounceInitialize = _.debounce(() => {
    this.initialized = true
    this.chainNodeAttributes("entrance", 250)
  }, 300)

  public handleFigureResize = (figureWidth: number) => {
    if (!figureWidth) return

    if (!this.initialized) {
      this.debounceInitialize()
    }
  }

  public handleWindowResize = (width: number) => {
    if (!width) return

    this.zoom.updateScaleExtent(this.layout, width)
  }

  public load = (dataArr: any[], app: PIXI.Application) => {
    const loading: Promise<any>[] = []
    
    dataArr.forEach(dataPoint => {
      const node = new Deliverable(this, dataPoint)
      this.nodes.push(node)
      loading.push(node.context.loading)
    })

    const deliverableNodes = this.getDeliverableNodes()
    this.activeIds = deliverableNodes.filter(d => d.active).map(d => d.id)
    this.activeCount = this.activeIds.length

    d3.groups(deliverableNodes, (d: Deliverable) => d.clientId).forEach(([ id, deliverables]) => {
      const client = new DeliverableGroup(this, id, deliverables, 0x83BF00)
      this.clients.push(client)
    })

    d3.groups(deliverableNodes, (d: Deliverable) => d.projectId).forEach(([ id, deliverables]) => {
      const project = new DeliverableGroup(this, id, deliverables, 0X818AFC)
      this.projects.push(project)
    })

    this.sort(<SortBy>get(sortBy), true)

    Promise.all(loading).then(() => {
      console.log("-> LOAD COMPLETED")    

      this.updateCategories()
      this.initSimulation()

      loader.handleNodesLoaded()
    })

  }

  public toScene = (context: PIXI.Container, ticker: PIXI.Ticker) => {
    this.clients.forEach(node => node.toScene(context, ticker))
    this.projects.forEach(node => node.toScene(context, ticker))

    this.getDeliverableNodes().forEach(node => {
      node.context.toScene(context, ticker)
    })
  }

  public getDeliverableNodes = (): Deliverable[] => {
    return <Deliverable[]>this.nodes.filter(d => d.id >= 0)
  }

  public updateForceCollideRadius = () => {
    if (!this.forceSimulation) {
      return
    }

    this.forceCollide.radius(this.forceCollideRadius)
  }

  public handleTransition = (isRunning: boolean) => {
    this.handleLinks("clients", !isRunning && get(linkClientOn))
    this.handleLinks("projects", !isRunning && get(linkProjectOn))
  }


 
  // ---------------------------- //
  // CALLED FROM USER INTERACTION //
  // ---------------------------- //

  public setLayout = (newLayout: Layout) => {
    // console.groupCollapsed("setLayout()")
    // console.log(`${this.layout} --> ${newLayout}`)
    // console.groupEnd()

    if (newLayout === this.layout) return

    this.layout = newLayout

    if (!this.initialized) return

    this.transition.add({ type: "exit" })
    this.chainNodeAttributes("entrance")

  }

  public sort = (sortBy: SortBy, suppressEvents: boolean = false) => {
    // console.groupCollapsed("sort()")
    // console.groupEnd()

    this.getDeliverableNodes()
      .sort((a, b) => +b.active - +a.active || a[sortBy] - b[sortBy] ) // Descending because we want active (1) before unactive (0)
      .forEach((node, i) => {
        node.i = i
      })
    
    if (suppressEvents) {
      return
    }

    this.chainNodeAttributes("sort")

  }

  public filter = (fyears: number[], findustries: number[], fdesigns: number[], fgoals: number[], fproducts: number[]) => {
    if (!this.initialized) return
    
    // console.groupCollapsed("filter()")

    this.getDeliverableNodes().forEach(node => node.setActive(fyears, findustries, fdesigns, fgoals, fproducts))

    const activeIds = this.getDeliverableNodes().filter(d => d.active).map(d => d.id)
    const equalIds = (
      this.activeIds.length === activeIds.length && 
      activeIds.every(d => this.activeIds.includes(d)))

    if (!equalIds) {
      const transitionType = this.activeCount > activeIds.length 
        ? "filterOut" 
        : "filterIn"

      // console.log(transitionType)
      // console.groupEnd()

      this.activeIds = activeIds
      this.activeCount = activeIds.length

      this.sort(<SortBy>get(sortBy), true)
      this.updateCategories()

      this.chainNodeAttributes(transitionType)

    }
    else {
      // console.log("no real filtering")
      // console.groupEnd()
    }

  }

  public handleSelected = (selected: any) => {
    // console.groupCollapsed("handleSelected()")
    // console.log(selected)
    // console.groupEnd()

    // If unselecting, force playNext
    if (this.onSelectedState && !selected) {
      this.transition.playNext(true)
    }

    // If selecting, add unselect transitions
    else if (!this.onSelectedState && selected) {
      this.transition.addSelectedLeaving({ layout: this.layout })
      this.onSelectedState = !!selected
    }

    this.nodes.forEach(node => node.handleSelected(selected))
    
    this.handleLinks("clients", !selected && get(linkClientOn))
    this.handleLinks("projects", !selected && get(linkProjectOn))

  }

  public handleHovered = (hovered: any) => {
    this.clients.forEach((node: DeliverableGroup) => node.setHovered(hovered && node.id === hovered.clientId))
    this.projects.forEach((node: DeliverableGroup) => node.setHovered(hovered && node.id === hovered.projectId))
  }

  public handleComplexity = (complexityOn: boolean) => {
    // console.groupCollapsed("handleComplexity()")
    // console.log(complexityOn)
    // console.groupEnd()

    this.getDeliverableNodes().forEach(node => node.attr.complexity())
  }

  public handleLinks = (target: "clients"|"projects", isActive: boolean) => {
    this[target].forEach((node: DeliverableGroup) => node.setActive(isActive))
  }











}