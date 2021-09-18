import React, { Suspense } from 'react';
import * as Three from 'three';
import { Canvas } from '@react-three/fiber';

import { Line2D, ShaderParameters } from '../lib/types';
import ImagePlane from './imageplane';

interface Props {
  shaderCode: string;
  width: number;
  height: number;
  lines?: Line2D[][];
  shaderParams: ShaderParameters;
}

const WebGLCanvas: React.FC<Props> = (props) => (
  <Canvas
    camera={new Three.OrthographicCamera(-1, 1, 1, -1, -1, 1)}
    style={{ width: props.width, height: props.height }}
  >
    <Suspense fallback={null}>
      <ImagePlane
        shaderCode={props.shaderCode}
        width={props.width}
        height={props.height}
        lines={props.lines}
        shaderParams={props.shaderParams}
      />
    </Suspense>
  </Canvas>
);

export default WebGLCanvas;
