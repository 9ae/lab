const width = 300;
const height = 423;
let scene, camera, renderer, mesh;
const texLvs = [];
let step = 0;

const texLoader = new THREE.TextureLoader();
const msg = "Hello darkness my old friend";
const imageTexture = texLoader.load('assets/frida.jpg');
const fontLoader = new FontFace('Babylonica', "url('assets/babylonica.ttf')");
fontLoader.load().then((font) => {
  document.fonts.add(font);

  texLvs[0] = createTextTexture(30, 1.3, '#999');
  texLvs[1] = createTextTexture(18, 1.15, '#666');
  texLvs[2] = createTextTexture(6, 1.25, '#333');

  document.getElementById('step').removeAttribute('disabled');
});

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

function createTextTexture(fontSize, lineHeight, fontColor) {
  const canvas = document.createElement("canvas");
  const sampleCtx = canvas.getContext('2d');

  const vAlign = "top";
  const fontStyle = `${fontSize}px Babylonica`;

  sampleCtx.textBaseline = vAlign;
  sampleCtx.font = fontStyle;
  const texSize = sampleCtx.measureText(`${msg} `);

  canvas.width = texSize.width;
  canvas.height = fontSize * lineHeight;

  // We have to set the properties again after canvas changes size
  sampleCtx.textBaseline = vAlign;
  sampleCtx.font = fontStyle;
  sampleCtx.fillStyle = fontColor;
  sampleCtx.fillText(msg, 0, 0);

  const canvas2d = document.createElement("canvas");
  canvas2d.width = width;
  canvas2d.height = height;
  const sz = Math.max(width, height) * 2;
  const ctx = canvas2d.getContext('2d');

  ctx.save();
  ctx.translate(0.5 * sz, 0.5 * sz);
  ctx.rotate(Math.PI * -0.15);
  ctx.translate(-0.5 * sz, -0.5 * sz);
  ctx.fillStyle = "#ddd";
  ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
  const pattern = ctx.createPattern(canvas, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(-sz, -sz, 3 * sz, 3 * sz);
  ctx.restore();

  const texture = new THREE.Texture(canvas2d);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

window.onload = function () {
  const canvas = document.getElementById('three');
  scene = new THREE.Scene();
  const near = -1;
  const far = 1;
  camera = new THREE.OrthographicCamera(0, width, 0, height, near, far);
  camera.zoom = 1;
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(width, height);

  const planeGeo = new THREE.PlaneBufferGeometry(width, height);

  const material = new THREE.MeshBasicMaterial({
    map: imageTexture,
    side: THREE.DoubleSide,
  });

  mesh = new THREE.Mesh(planeGeo, material);
  mesh.position.set(width / 2, height / 2, 0);
  mesh.rotation.x = Math.PI;
  scene.add(mesh);

  requestAnimationFrame(render);
};

function onStepChange(newValue) {
  const newStep = parseInt(newValue);
  if (isNaN(newStep)) { throw Error("Invalid step"); }
  switch (newStep) {
    case 1: {
      mesh.material = new THREE.ShaderMaterial({
        uniforms: { tex: { type: "t", value: imageTexture } },
        vertexShader: vertexShader,
        fragmentShader: fragStep1,
        side: THREE.DoubleSide
      });
      break;
    }
    case 2: {
      mesh.material = new THREE.ShaderMaterial({
        uniforms: { tex: { type: "t", value: imageTexture } },
        vertexShader: vertexShader,
        fragmentShader: fragStep2,
        side: THREE.DoubleSide
      });
      break;
    }
    case 3: {
      const uniforms = {
        tex: { type: "t", value: imageTexture },
        lv1: { type: "t", value: texLvs[0] },
        lv2: { type: "t", value: texLvs[1] },
        lv3: { type: "t", value: texLvs[2] },
      };
      mesh.material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragStep3,
        side: THREE.DoubleSide
      });
      break;
    };
    default: {
      mesh.material = new THREE.MeshBasicMaterial({
        map: imageTexture,
        side: THREE.DoubleSide,
      });
      break;
    }
  }
  mesh.needsUpdate = step !== newStep;
  step = newStep;
}


function render(t) {
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
