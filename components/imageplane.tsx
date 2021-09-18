import React from 'react';
import * as Three from 'three';
import { extend, ShaderMaterialProps, useFrame } from '@react-three/fiber';
import { DateTime, Interval } from 'luxon';

import { Line2D, ShaderParameters } from '../lib/types';

interface ImagePlaneProps {
  shaderCode: string;
  width: number;
  height: number;
  lines?: Line2D[][];
  shaderParams: ShaderParameters;
}

interface ShaderLine {
  start: Three.Vector3;
  end: Three.Vector3;
}

/// https://stackoverflow.com/questions/65459024/shaders-with-typescript-and-react-three-fiber
class ScreenSpaceMaterial extends Three.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        iResolution: { value: new Three.Vector3() },
        iTime: { value: 0.0 },
      },
      fragmentShader: '/shader.glsl',
    });
  }
}

extend({ ScreenSpaceMaterial });

const p2vec3 = ({ x, y }: { x: number; y: number }): Three.Vector3 => new Three.Vector3(x, y, 0.0);
const l2shaderline = (line: Line2D): ShaderLine => ({
  start: p2vec3(line.from),
  end: p2vec3(line.to),
});

const ImagePlane: React.FC<ImagePlaneProps> = ({
  shaderCode,
  width,
  height,
  lines,
  shaderParams,
}) => {
  const ref = React.createRef<ShaderMaterialProps>();
  const start = DateTime.now();
  useFrame(() => {
    if (ref.current && ref.current.uniforms) {
      ref.current.uniforms.iTime.value = Interval.fromDateTimes(start, DateTime.now()).length(
        'seconds'
      );
      ref.current.uniforms.radius.value = shaderParams.radius;
      ref.current.uniforms.smoothing.value = shaderParams.smoothing;
    }
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        uniforms={{
          iResolution: { value: new Three.Vector3(width, height, 0.0) },
          iTime: { value: 0.0 },
          lines: {
            value: lines?.flat().map(l2shaderline) ?? [],
          },
          radius: { value: shaderParams.radius },
          smoothing: { value: shaderParams.smoothing },
        }}
        fragmentShader={shaderCode}
      />
    </mesh>
  );
};

export default ImagePlane;
