import { GenerationOptions, loadSync } from 'text-to-svg';
import simplify from 'simplify-js';
import { svgPathProperties } from 'svg-path-properties';
import skmeans from 'skmeans';
import type { Line2D as Line, Point } from './types';

const EPSILON = 0.01;

export const queryParamFlatten = (
  query: string | string[] | undefined,
  defaultVal: string
): string => (Array.isArray(query) ? query[0] : query ?? defaultVal);

export const textToSVG = async (text: string, font: string): Promise<string> =>
  new Promise<string>((resolve) => {
    // load()
    const converter = loadSync(font === 'default' ? undefined : font);
    const attributes: GenerationOptions['attributes'] = { fill: 'red', stroke: 'black' };
    const options: GenerationOptions = {
      x: 0,
      y: 0,
      fontSize: 72,
      anchor: 'top',
      attributes: attributes,
    };

    const svg = converter.getSVG(text, options);
    resolve(svg);
  });

/// Might be more readable with "function first<T>(list: Array<T>): (T | undefined)"
const first = <T extends unknown>(list: Array<T> | null): T | null =>
  Array.isArray(list) && list.length ? list[0] : null;

const getPathFromSVG = (svgContent: string): string | undefined => {
  const r = /d=".+"/;
  const m = first(r.exec(svgContent));
  return m?.substr(3, m?.length - 4 ?? 0); // Trim away start d=" and trailing "
};

const splitPathIntoSegments = (path: string | undefined): string[] =>
  path
    ?.split('M')
    .filter((s) => s && s.length)
    .map((s) => `M${s}`) ?? [];

const discretizePath = (pathSegments: string[], count: number): Point[][] => {
  const n = Math.floor(count / pathSegments.length);
  const output = new Array<Point[]>();

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = new Array<Point>(n);
    const properties = new svgPathProperties(pathSegments[i]);
    const len = properties.getTotalLength();
    if (len < EPSILON) continue;
    for (let j = 0; j < n; ++j) {
      segment[j] = properties.getPointAtLength((len * j) / (n - 1));
    }
    output.push(segment);
  }

  return output;
};

const clamp = (val: number, min: number, max: number) => Math.max(Math.min(val, max), min);

const cluster = (lines: Point[][], percentage = 0.5): Point[][] => {
  const data = lines.flat().map(({ x, y }) => [x, y]);
  const clusterCount = Math.floor(data.length * clamp(percentage, 0.0, 1.0));
  const res = skmeans(data, clusterCount);
  let i = 0;
  lines.map((ls) =>
    ls.map((l) => {
      const centroid = res.centroids[res.idxs[i++]] as number[];
      l.x = centroid[0];
      l.y = centroid[1];
      return l;
    })
  );
  return lines;
};

const simplifyPath = (lines: Point[][], tolerance: number): Point[][] =>
  lines.map((line) => simplify(line, tolerance));

const toLines = (pointList: Point[][]): Line[][] =>
  pointList.map((points) => {
    const outs = new Array<Line>(points.length - 1);
    for (let i = 0; i < points.length - 1; i++) {
      outs[i] = { from: points[i], to: points[i + 1] };
    }
    return outs;
  });

const isZero = ({ from, to }: Line): boolean =>
  Math.abs(to.x - from.x) < EPSILON && Math.abs(to.y - from.y) < EPSILON;

const clearEmptyLines = (lines: Line[][]): Line[][] =>
  lines.map((lines) => lines.filter((l) => !isZero(l))).filter((l) => l.length !== 0);

const normalizeRange = (lines: Line[][]): Line[][] => {
  const min = { x: 10000, y: 10000 };
  const max = { x: -10000, y: -10000 };
  for (const li of lines) {
    for (const l of li) {
      min.x = Math.min(l.from.x, l.to.x, min.x);
      min.y = Math.min(l.from.y, l.to.y, min.y);
      max.x = Math.max(l.from.x, l.to.x, max.x);
      max.y = Math.max(l.from.y, l.to.y, max.y);
    }
  }

  // f(x) = ax + b = y
  // a * min + b = range.min
  // a * max + b = range.max => b = range.max - a * max
  // a * min + range.max - a * max = range.min => a * (min - max) = range.min - range.max
  // a = (range.min - range.max) / (min - max)
  // b = range.max - a * max
  const range = { min: -3, max: 3 };
  const a = {
    x: (range.min - range.max) / (min.x - max.x),
    y: (range.min - range.max) / (min.y - max.y),
  };
  const b = { x: range.max - a.x * max.x, y: range.max - a.y * max.y };

  return lines.map((li) =>
    li.map(
      (l): Line => ({
        // Also flip y coordinates, because OpenGL is opposite of html
        from: { x: a.x * l.from.x + b.x, y: -(a.y * l.from.y + b.y) },
        to: { x: a.x * l.to.x + b.x, y: -(a.y * l.to.y + b.y) },
      })
    )
  );
};

export const textToLines = async (
  text: string,
  font: string,
  discretizeCount: number,
  simplifyTolerance: number
): Promise<Line[][]> => {
  const svgContent = await textToSVG(text, font);

  return normalizeRange(
    clearEmptyLines(
      toLines(
        simplifyPath(
          discretizePath(splitPathIntoSegments(getPathFromSVG(svgContent)), discretizeCount),
          simplifyTolerance
        )
      )
    )
  );
};
