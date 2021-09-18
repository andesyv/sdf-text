export interface Point {
  x: number;
  y: number;
}

export interface Line2D {
  from: Point;
  to: Point;
}

export class StatelessObj<T> {
  value: T;
  onUpdate?: (val: T) => void;
  constructor(val: T) {
    this.value = val;
  }
  set(val: T) {
    this.value = val;
    this.onUpdate?.(val);
  }
}

export interface ShaderParameters {
  radius: number;
  smoothing: number;
}
