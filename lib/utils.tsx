import TextToSVG, { GenerationOptions, loadSync } from 'text-to-svg';
import simplify from 'simplify-js';
import { svgPathProperties } from 'svg-path-properties';

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  from: Point;
  to: Point;
}

export const queryParamFlatten = (
  query: string | string[] | undefined,
  defaultVal: string
): string => (Array.isArray(query) ? query[0] : query ?? defaultVal);

export const textToSVG = async (text: string, font: string): Promise<string> =>
  new Promise<string>((resolve) => {
    // load()
    const converter = loadSync(font === 'default' ? undefined : font);
    const attributes: GenerationOptions['attributes'] = { fill: 'red', stroke: 'black' };
    const options: TextToSVG.GenerationOptions = {
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
  return m?.substr(3, m?.length ?? 0 - 4); // Trim away start d=" and trailing "
};

const discretizePath = (pathString: string, count: number): Point[][] => {
  const properties = new svgPathProperties(pathString);
  const parts = properties.getParts();
  const n = Math.floor(count / parts.length);
  const output = new Array<Point[]>();

  for (let i = 0; i < parts.length; i++) {
    const line = new Array<Point>(n);
    const len = parts[i].length;
    for (let j = 0; j < n; ++j) {
      line[j] = parts[i].getPointAtLength((len * j) / (n - 1));
    }
    output.push(line);
  }

  return output;
};

const simplifyPath = (lines: Point[][], tolerance: number): Point[][] =>
  lines.map((line) => simplify(line, tolerance));

export const textToLines = async (
  text: string,
  font: string,
  discretizeCount: number,
  simplifyTolerance: number
): Promise<Line[][]> => {
  const svgContent = await textToSVG(text, font);
  return toLines(
    simplifyPath(
      discretizePath(getPathFromSVG(svgContent) ?? '', discretizeCount),
      simplifyTolerance
    )
  );
};

const toLines = (pointList: Point[][]): Line[][] =>
  pointList.map((points) => {
    const outs = new Array<Line>(points.length - 1);
    for (let i = 0; i < points.length - 1; i++) {
      outs[i] = { from: points[i], to: points[i + 1] };
    }
    return outs;
  });
