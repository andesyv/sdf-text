import { GenerationOptions, loadSync } from 'text-to-svg';
import simplify from 'simplify-js';
import { svgPathProperties } from 'svg-path-properties';
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

export const textToLines = async (
  text: string,
  font: string,
  discretizeCount: number,
  simplifyTolerance: number
): Promise<Line[][]> => {
  const svgContent = await textToSVG(text, font);

  return clearEmptyLines(
    toLines(
      simplifyPath(
        discretizePath(splitPathIntoSegments(getPathFromSVG(svgContent)), discretizeCount),
        simplifyTolerance
      )
    )
  );
};
