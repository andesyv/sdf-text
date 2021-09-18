export interface Point {
  x: number;
  y: number;
}

export interface Line2D {
  from: Point;
  to: Point;
}

export interface ShaderParameters {
  radius: number;
  smoothing: number;
}
