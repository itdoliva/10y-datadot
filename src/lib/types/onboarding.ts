export type Placement = (
  "top"     | "top-start"     | "top-end"     |
  "right"   | "right-start"   | "right-end"   |
  "bottom"  | "bottom-start"  | "bottom-end"  |
  "left"    | "left-start"    | "left-end"    |
  "center"
)

export interface OnboardingStep {
  contentKey: string;
  positionTo: string;
  placement: Placement;
  highlight?: string;
  inner?: boolean;
  onStart?: () => void;
  onLeave?: () => void;
}