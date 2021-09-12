import React, { Suspense } from 'react';
import * as Three from 'three';
import { Canvas, extend, ShaderMaterialProps, useFrame } from '@react-three/fiber';
import { DateTime, Interval } from 'luxon';

export interface Line {
  from: Three.Vector3;
  to: Three.Vector3;
}

export interface Props {
  shaderCode: string;
  width: number;
  height: number;
  lines?: Line[];
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

interface ImagePlaneProps {
  shaderCode: string;
  width: number;
  height: number;
}

const ImagePlane: React.FC<ImagePlaneProps> = ({ shaderCode, width, height }) => {
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
      {/* <screenSpaceMaterial /> */}
      <shaderMaterial
        ref={ref}
        uniforms={{
          iResolution: { value: new Three.Vector3(width, height, 0.0) },
          iTime: { value: 0.0 },
        }}
        fragmentShader={shaderCode}
      />
    </mesh>
  );
};

const WebGLCanvas: React.FC<Props> = (props) => (
  <Canvas
    camera={new Three.OrthographicCamera(-1, 1, 1, -1, -1, 1)}
    style={{ width: props.width, height: props.height }}
  >
    <Suspense fallback={null}>
      <ImagePlane {...props} />
    </Suspense>
  </Canvas>
);

export default WebGLCanvas;
