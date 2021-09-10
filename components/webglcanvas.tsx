import React, { Suspense, useRef } from 'react';
import * as Three from 'three';
import { Canvas, extend, ShaderMaterialProps, useFrame } from '@react-three/fiber';
import { DateTime, Duration, Interval } from 'luxon';

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

// class WebGLCanvas extends React.PureComponent<Props> {
//     canvasRef = React.createRef<HTMLCanvasElement>();
//     renderer?: Three.WebGLRenderer = undefined;

// componentDidMount = () => {
//     if (!this.canvasRef.current)
//         return;
//     const c = this.canvasRef.current;

//     this.renderer = new Three.WebGLRenderer({ canvas: c });
//     this.renderer.setSize(c.width, c.height, false);
//     this.renderer.autoClear = false;
//     const camera = new Three.OrthographicCamera(-1, 1, 1, -1, -1, 1);
//     const scene = new Three.Scene();
//     const plane = new Three.PlaneBufferGeometry(2, 2);
//     const uniforms = {
//         iTime: { value: 0 },
//         iResolution: { value: new Three.Vector3() },
//     };
//     const material = new Three.ShaderMaterial({
//         fragmentShader: "/shader.glsl",
//         uniforms: uniforms,
//     });
//     scene.add(new Three.Mesh(plane, material));

//     const renderWebGL = (time: number) => {
//         // resizeRendererToDisplaySize(this.renderer);

//         uniforms.iResolution.value.set(c.width, c.height, 1);
//         uniforms.iTime.value = time * 0.001; // Time is in milliseconds

//         this.renderer?.render(scene, camera);

//         // requestAnimationFrame(renderWebGL);
//     };

//     requestAnimationFrame(renderWebGL);
// }

//     render = () => (

//     );
// };

const resizeRendererToDisplaySize = (renderer?: Three.WebGLRenderer): boolean => {
  if (!renderer) return false;
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

export default WebGLCanvas;
