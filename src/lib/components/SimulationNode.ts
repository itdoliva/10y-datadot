import * as PIXI from "pixi.js";
import { get } from "svelte/store";
import { nodes } from "../stores/nodes"; 

interface NodeTransform {
  x: number;
  y: number;
  pivotX: number;
  pivotY: number;

  rotation: number;
  alpha: number;
  scale: number;

  renderable: boolean;
}

export class DummySimulationNode {
  public id: number = -1;

  public fx: number = 0;
  public fy: number = 0;
  public r: number = 0;

  isActive = () => true
}


export class SimulationNode {
  public id: number;
  public globalPos: PIXI.IPoint = new PIXI.Point(0)

  public t: NodeTransform = {
    x: 0,
    y: 0,
    rotation: 0,
    alpha: 1,
    scale: 1,
    renderable: true,
    pivotX: 0,
    pivotY: 0
  }

  constructor(id: number) {
    this.id = id
  }

  getRef = () => {
    return get(nodes).find(node => node.id === this.id)
  }

  getIndex = () => {
    return this.getRef().i
  }

  isActive = () => {
    return this.getRef().active
  }

  hasActiveMatch = () => {
    return this.isActive() === this.t.renderable
  }

}

