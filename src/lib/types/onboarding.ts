export type Placement = (
  "top"     | "top-start"     | "top-end"     |
  "right"   | "right-start"   | "right-end"   |
  "bottom"  | "bottom-start"  | "bottom-end"  |
  "left"    | "left-start"    | "left-end"    |
  "center"
)

export interface OnboardingStepSettings {
  contentKey: string;
  positionTo: string;
  placement: Placement;
  highlight?: string;
  inner?: boolean;
  borderPosition?: "top" | "right" | "bottom" | "left";
  onStart?: () => void;
  onLeave?: () => void;
}

export interface OnboardingStep {
  index: number;
  position: any;
  settings: OnboardingStepSettings;
}