import * as THREE from 'three';
import React, { useEffect, useRef, useContext } from "react";
import { FontContext } from './context';

const helperFunctions = `
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
`;

const vertexShader = `
varying vec2 v_uv;
void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragStep1 = `
uniform sampler2D tex;
varying vec2 v_uv;

${helperFunctions}

void main(){
  vec4 color = texture2D(tex, v_uv);
  vec3 asHsv = rgb2hsv(vec3(color));
  float grey = asHsv.z;
  gl_FragColor = vec4(grey, grey, grey, 1.0);
}
`;

const fragStep2 = `
uniform sampler2D tex;
varying vec2 v_uv;

${helperFunctions}

void main(){
  vec4 color = texture2D(tex, v_uv);
  vec3 asHsv = rgb2hsv(vec3(color));
  float grey = asHsv.z;
  if (grey > 0.8){
    gl_FragColor = vec4(0.8667, 0.8667, 0.8667, 1.0);
  } else if (grey > 0.6){
    gl_FragColor = vec4(0.6, 0.6, 0.6, 1.0);
  } else if (grey > 0.4){
    gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0);
  } else {
    gl_FragColor = vec4(0.2, 0.2, 0.2, 1.0);
  }
}
`;

const fragStep3 = `
varying vec2 v_uv;
uniform sampler2D tex;
uniform sampler2D lv1;
uniform sampler2D lv2;
uniform sampler2D lv3;

${helperFunctions}

void main() {

  vec4 color = texture2D(tex, v_uv);
  vec3 asHsv = rgb2hsv(vec3(color));
  float grey = asHsv.z;
  if (grey > 0.8){
    gl_FragColor = vec4(0.8667, 0.8667, 0.8667, 1.0);
  } else if (grey > 0.6){
    gl_FragColor = texture2D(lv1, v_uv);
  } else if (grey > 0.4){
    gl_FragColor = texture2D(lv2, v_uv);
  } else {
    gl_FragColor = texture2D(lv3, v_uv);
  }

}
`;


export interface CanvasProps {
  step: number
  width: number
  height: number
}

const Page = ({ step, width, height }: CanvasProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const texCtx = useContext(FontContext);

  const makeMaterial = () => {
    switch (step) {
      case 1: {
        return new THREE.ShaderMaterial({
          uniforms: { tex: { value: imageTexture } },
          vertexShader: vertexShader,
          fragmentShader: fragStep1,
          side: THREE.DoubleSide
        });
      }
      case 2: {
        return new THREE.ShaderMaterial({
          uniforms: { tex: { value: imageTexture } },
          vertexShader: vertexShader,
          fragmentShader: fragStep2,
          side: THREE.DoubleSide
        });
        break;
      }
      case 3: {
        const uniforms = {
          tex: { type: "t", value: imageTexture },
          lv1: { type: "t", value: texCtx.levels[0] },
          lv2: { type: "t", value: texCtx.levels[1] },
          lv3: { type: "t", value: texCtx.levels[2] },
        };
        return new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragStep3,
          side: THREE.DoubleSide
        });
      };
      default: {
        return new THREE.MeshBasicMaterial({
          map: imageTexture,
          side: THREE.DoubleSide,
        });
      }
    }
  }

  const texLoader = new THREE.TextureLoader();
  const imageTexture = texLoader.load('tex/frida.jpg');
  useEffect(() => {
    const canvasWrapper = mountRef.current;
    if (!canvasWrapper) return;

    const scene = new THREE.Scene();
    const near = -1;
    const far = 1;
    const camera = new THREE.OrthographicCamera(0, width, 0, height, near, far);
    camera.zoom = 1;
    const R = new THREE.WebGLRenderer();
    R.setSize(width, height);
    canvasWrapper.appendChild(R.domElement);

    // resize listener

    const planeGeo = new THREE.PlaneBufferGeometry(width, height);
    const material = makeMaterial();
    const mesh = new THREE.Mesh(planeGeo, material);
    mesh.position.set(width / 2, height / 2, 0);
    mesh.rotation.x = Math.PI;
    scene.add(mesh);

    const render = () => {
      camera.updateProjectionMatrix();
      R.render(scene, camera);
      requestAnimationFrame(render);
    };

    render();
    return () => { canvasWrapper.removeChild(R.domElement) };
  });

  return (<div ref={mountRef}></div>);
};

export default Page;