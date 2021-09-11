import TextToSVG, { GenerationOptions, loadSync } from 'text-to-svg';

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
