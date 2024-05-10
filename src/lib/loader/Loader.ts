import { remove } from "lodash";
import { isReady } from "../stores/loading";

export default class Loader {
  private nodeIds: number[];
  private nodeIdsSet: boolean = false;

  constructor() {
  }
  
  public setNodeIds(nodeIds: number[]): void {
    if (!this.nodeIdsSet) {
      this.nodeIds = nodeIds
      this.nodeIdsSet = true
    }
  }

  public concludeNodeId(id: number): void {
    remove(this.nodeIds, d => d === id)

    if (this.nodeIdsSet && this.nodeIds.length === 0) {
      isReady.set(true)
    }
  }

  
}