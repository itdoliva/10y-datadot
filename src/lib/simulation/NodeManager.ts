import Deliverable from "./Deliverable";

export default class NodeManager {
  private nodes: Deliverable[] = []
  
  public getNodes(): Deliverable[] {
    return this.nodes
  }
}