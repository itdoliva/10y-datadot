import * as d3 from "d3";
import { get } from "svelte/store";
import { SimulationNode, DummySimulationNode } from "./SimulationNode";
import { cameraOffset } from "../stores/zoom";

export default class Simulation {
  public dummyNode: DummySimulationNode;
  private nodes: SimulationNode[];

  public simulation;
  public forceCollide;
  public forceX;
  public forceY;


  constructor(dataset: any[]) {
    this.dummyNode = new DummySimulationNode(this);

    this.nodes = [ 
      this.dummyNode,
      ...dataset.map(({ id, clientId, projectId }) => new SimulationNode(this, id, clientId, projectId))
    ]

    this.forceCollide = d3.forceCollide()
      .radius(this.forceCollideRadius)

    this.forceX = d3.forceX().strength(.005)
      .x(this.forceXPos)

    this.forceY = d3.forceY().strength(.005)
      .y(this.forceYPos)

    this.simulation = d3.forceSimulation()
      .alphaTarget(0.3) // stay hot
      .velocityDecay(0.25) // low friction
      .force("charge", d3.forceManyBody().strength(-5))
      .force("x", this.forceX)
      .force("y", this.forceY)
      .force("collide", this.forceCollide)
      .nodes(this.nodes)
      .on("tick", this.ticked)

  }

  // PRIVATE
  private forceCollideRadius = (node: SimulationNode) => {
    return node.getRadius()
  }

  private forceXPos = () => {
    return -get(cameraOffset).x
  }

  private forceYPos = () => {
    return -get(cameraOffset).y
  }

  private ticked = () => {
    this.nodes.forEach((node: SimulationNode) => node.tick())
  }

  // PUBLIC
  public updateCollideRadius = () => {
    this.forceCollide.radius(this.forceCollideRadius)
  }

  public updateCoordPos = () => {
    this.forceX.x(this.forceXPos)
    this.forceY.y(this.forceYPos)
  }

  public getNodeById = (id: number) => {
    return this.nodes.find(d => d.id === id)
  }

  public getNodesByClientId = (clientId: number) => {
    return this.nodes.filter(d => d.clientId === clientId)
  }

  public getNodesByProjectId = (projectId: number) => {
    return this.nodes.filter(d => d.projectId === projectId)
  }

  public updateNodesSetPos = (getPos) => {
    this.nodes.forEach(node => node.setPos(getPos))
  }
}