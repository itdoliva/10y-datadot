export interface Node {
  id: number;
  year: number;
  active: boolean;
  complexity: number;

  i: number;
  ids: number[];
  channel: number;
  designs: number[];
  goals: number[];
  industry: number[];
  products: number[];
  
  client: number;
  project: number;
}

export interface Nodes extends Array<Node> {
  activeIds: number[];
  activeCount: number;
  activePct: number;
}