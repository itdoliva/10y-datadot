export type Layout = "block" | "radial"
export type SortBy = "dt" | "industry"

export interface ILayoutAttributes {
  x: number;
  y: number;
  radius: number;
  theta: number;

  time: number;
  active: boolean;
}

export interface IRenderAttributes {
  // fx and fy define where the node will be rendered
  fx: number;
  fy: number;

  // px, py, theta, and radius help defining fx and fy
  px: number;
  py: number;
  theta: number;
  radius: number;

  rotation: number;
  alpha: number;
  scale: number;
  renderable: boolean;
}

// Transition
export type TransitionType = "entrance" | "exit" | "exitSelected" | "filterIn" | "filterOut" | "sort"

export interface ILayoutSize {
  width: number;
  height: number;
}

export interface ITransition {
  type: TransitionType;
  attrId?: number;
  layout?: Layout;
  layoutSize?: ILayoutSize;
  onStart?: () => void;
  onComplete?: () => void;
}


// General
export interface IDimensions {
  fw: number;
  fh: number;
  nodeSize: number;
  gap: number;
}

// Layout Position
export interface ISectorDataPoint {
  id: string,
  sectorIndex: number,
  pileIndex: number,
  inPileIndex: number
}

export interface ISectorMetadata {
  nGaps: number;
  nPiles: number;
  innerRadius?: number;
}

export interface IPadding {
  left: number;
  top: number;
}

export interface IRadialConfigData {
  innerRadius: number;
}

export interface IBlockConfigData {
  rows: number;
  columns: number;
}

export interface ILayoutConfig {
  data: IRadialConfigData | IBlockConfigData;
  padding: IPadding;
  extent: Array<Array<number>>;
}

export interface ISectorData extends Array<ISectorDataPoint> {
  metadata: ISectorMetadata;
}
