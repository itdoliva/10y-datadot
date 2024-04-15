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

