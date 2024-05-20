export type Layout = "block" | "radial"
export type Transition = "idle" | "entrance" | "exit" | "filter-in" | "filter-out" | "sort"
export type SortBy = "year" | "industry"

export interface CartesianCoordinates {
  x: number;
  y: number;
}

export interface PolarCoordinates {
  radius: number;
  theta: number;
}

export interface Coordinates extends CartesianCoordinates, PolarCoordinates {}

export interface LayoutAttributes extends Coordinates {
  time: number;
}

export interface RenderAttributes extends CartesianCoordinates {
  rotation: number;
  alpha: number;
  scale: number;
  renderable: boolean;
}



// General
export interface Dimensions {
  fw: number;
  fh: number;
  nodeSize: number;
  gap: number;
}

// Layout Position
export interface SectorDataPoint {
  id: string,
  sectorIndex: number,
  pileIndex: number,
  inPileIndex: number
}

export interface SectorMetadata {
  nGaps: number;
  nPiles: number;
  innerRadius?: number;
}

export interface Padding {
  left: number;
  top: number;
}

export interface RadialConfigData {
  innerRadius: number;
}

export interface BlockConfigData {
  rows: number;
  columns: number;
}

export interface LayoutConfig {
  data: RadialConfigData | BlockConfigData;
  padding: Padding;
  extent: Array<Array<number>>;
}

export interface SectorData extends Array<SectorDataPoint> {
  metadata: SectorMetadata;
}
