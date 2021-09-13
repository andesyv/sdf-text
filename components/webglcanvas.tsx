import React, { Suspense } from 'react';
import * as Three from 'three';
import { Canvas, extend, ShaderMaterialProps, useFrame } from '@react-three/fiber';
import { DateTime, Interval } from 'luxon';
import { Line2D } from '../lib/types';

export interface Line {
  from: Three.Vector3;
  to: Three.Vector3;
}

export interface Props {
  shaderCode: string;
  width: number;
  height: number;
  lines?: Line2D[][];
}

interface ImagePlaneProps {
  shaderCode: string;
  width: number;
  height: number;
  lines: Float32Array;
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

const ImagePlane: React.FC<ImagePlaneProps> = ({ shaderCode, width, height, lines }) => {
  const ref = React.createRef<ShaderMaterialProps>();
  const start = DateTime.now();
  useFrame(() => {
    if (ref.current && ref.current.uniforms)
      ref.current.uniforms.iTime.value = Interval.fromDateTimes(start, DateTime.now()).length(
        'seconds'
      );
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        uniforms={{
          iResolution: { value: new Three.Vector3(width, height, 0.0) },
          iTime: { value: 0.0 },
          lines: { value: lines.length ? lines : [] },
        }}
        fragmentShader={shaderCode}
      />
    </mesh>
  );
};

const nestedCount = <T extends unknown>(list?: T[][]): number =>
  list?.reduce((sum, l) => sum + l.length, 0) ?? 0;

const linesToTypedArray = (lines?: Line2D[][]): Float32Array => {
  const arr = new Float32Array(nestedCount(lines) * 4);
  if (lines) {
    let totalLength = 0;
    for (let i = 0; i < lines.length; i++) {
      const segment = lines[i];
      for (let j = 0, k = totalLength; j < segment.length; j++, k += 4) {
        arr[k] = segment[j].from.x;
        arr[k + 1] = segment[j].from.y;
        arr[k + 2] = segment[j].to.x;
        arr[k + 3] = segment[j].to.y;
      }
      totalLength += segment.length * 4;
    }
  }
  return arr;
};

const WebGLCanvas: React.FC<Props> = (props) => {
  const lines = linesToTypedArray(props.lines);

  return (
    <Canvas
      camera={new Three.OrthographicCamera(-1, 1, 1, -1, -1, 1)}
      style={{ width: props.width, height: props.height }}
    >
      <Suspense fallback={null}>
        <ImagePlane
          shaderCode={props.shaderCode}
          width={props.width}
          height={props.height}
          lines={lines}
        />
      </Suspense>
    </Canvas>
  );
};

export default WebGLCanvas;
