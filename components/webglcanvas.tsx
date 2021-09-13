import React, { Suspense } from 'react';
import * as Three from 'three';
import { Canvas, extend, ShaderMaterialProps, useFrame } from '@react-three/fiber';
import { DateTime, Interval } from 'luxon';
import { Line as Line2D } from '../lib/utils';

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

const nestedCount = <T extends unknown>(list: T[][] | undefined): number =>
  list?.reduce((sum, l) => sum + l.length, 0) ?? 0;

const WebGLCanvas: React.FC<Props> = (props) => {
  const lines = new Float32Array(nestedCount(props.lines) * 4);
  if (props.lines) {
    let totalLength = 0;
    for (let i = 0; i < props.lines.length; i++) {
      const segment = props.lines[i];
      for (let j = 0, k = totalLength; j < segment.length; j++, k += 4) {
        lines[k] = segment[j].from.x;
        lines[k + 1] = segment[j].from.y;
        lines[k + 2] = segment[j].to.x;
        lines[k + 3] = segment[j].to.y;
      }
      totalLength += segment.length * 4;
    }
  }

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
