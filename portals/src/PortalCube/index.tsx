import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import React, { useEffect, useRef } from "react";
import { Object3D } from 'three';

const Pure = () => {

  const mountRef = useRef<HTMLDivElement>(null);
  const objectPos = 25;
  const sideSize = 10;
  const cameraPos = 12;
  const cameraFOV = 20;
  const cameraNear = 0.3;
  const cameraFar = 1500;

  const vertexShader = `
  attribute float size;
    varying vec3 vColor;

    void main() {

      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;

    }
  `;

  const fragmentShader = `
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4( vColor, 1.0 );
			}
  `;

  useEffect(() => {
    /* Setup */
    const canvasWrapper = mountRef.current;
    if (!canvasWrapper) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x110011);
    let ar = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(100, ar, 0.1, 1000);
    const R = new THREE.WebGLRenderer();
    R.setSize(window.innerWidth, window.innerHeight);
    canvasWrapper.appendChild(R.domElement);

    scene.add(new THREE.AmbientLight(0xffeeff));

    const frontBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
    const bottomBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
    const rightBuffer = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });

    window.addEventListener('resize', function () {
      var width = window.innerWidth;
      var height = window.innerHeight;
      R.setSize(width, height);
      ar = width / height;
      camera.aspect = ar;
      camera.updateProjectionMatrix();
    }, false);

    /* Helpers 
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);
    const gridHelper = new THREE.GridHelper(50, 10);
    scene.add(gridHelper);
    */

    /* Scene objects */

    const texLoader = new THREE.TextureLoader();
    const groundTexture = texLoader.load('tex/moonmap1k.jpeg');
    const ground = new THREE.Mesh(new THREE.SphereGeometry(100),
      new THREE.MeshBasicMaterial({ map: groundTexture, side: THREE.FrontSide }));
    ground.position.set(0, -120, 0);
    ground.rotateX(Math.PI / 2);
    scene.add(ground);

    const meshLoader = new GLTFLoader();

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const sizes = [];
    const color = new THREE.Color();
    for (let i = 0; i < 10000; i++) {

      const x = 2000 * Math.random() - 1000;
      const y = 1000 * Math.random() + objectPos * 2;
      const z = 2000 * Math.random() - 1000;
      vertices.push(x, y, z);

      color.setHSL(Math.random(), 0.6, 0.9);
      colors.push(color.r, color.g, color.b);

      sizes.push(Math.floor(Math.random() * 3));

    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    const starsMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
    const particles = new THREE.Points(geometry, starsMaterial);
    scene.add(particles);

    const rainbowMaterial = [0xFDABAB,
      0xFDC9AB, //1
      0xFDEBAB,
      0xE3FDAB,
      0xACFDB3, //4
      0xACF3FC,
      0xACC2FC, //6
      0xC1ABFC,
      0xFDABEA].map(color => (new THREE.MeshPhongMaterial({ color, specular: 0x009900, shininess: 30, flatShading: true })));

    // add planes
    const geomPlane = new THREE.PlaneBufferGeometry(sideSize, sideSize);

    const frontPortal = new THREE.Mesh(geomPlane, new THREE.MeshBasicMaterial({
      map: frontBuffer.texture,
      //color: 0xeeaaaa,
      side: THREE.FrontSide
    }));
    frontPortal.position.z = sideSize / 2;
    frontPortal.rotateY(Math.PI);
    scene.add(frontPortal);

    const rightPortal = new THREE.Mesh(geomPlane, new THREE.MeshBasicMaterial({
      map: rightBuffer.texture,
      // color: 0xaaeeaa,
      side: THREE.FrontSide
    }));
    rightPortal.rotateY(Math.PI / 2);
    rightPortal.position.x = -sideSize / 2;
    scene.add(rightPortal);

    const bottomPortal = new THREE.Mesh(geomPlane, new THREE.MeshBasicMaterial({
      map: bottomBuffer.texture,
      // color: 0xaaaaee,
      side: THREE.FrontSide
    }));
    bottomPortal.rotateX(Math.PI / -2);
    bottomPortal.position.y = -sideSize / 2;
    scene.add(bottomPortal);

    const box = new THREE.Group();
    {
      const wallMaterial = rainbowMaterial[2];

      const e0 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, sideSize), wallMaterial);
      const e01 = e0.clone();
      e01.position.set(sideSize / 2, sideSize / 2, 0);
      box.add(e01);
      const e02 = e0.clone();
      e02.position.set(sideSize / 2, -sideSize / 2, 0);
      box.add(e02);
      const e03 = e0.clone();
      e03.position.set(-sideSize / 2, -sideSize / 2, 0);
      box.add(e03);
      const e04 = e0.clone();
      e04.position.set(-sideSize / 2, sideSize / 2, 0);
      box.add(e04);

      const e1 = new THREE.Mesh(new THREE.BoxGeometry(sideSize, 0.5, 0.5), wallMaterial);
      const e11 = e1.clone();
      e11.position.set(0, sideSize / 2, sideSize / 2);
      box.add(e11);
      const e12 = e1.clone();
      e12.position.set(0, -sideSize / 2, sideSize / 2);
      box.add(e12);
      const e13 = e1.clone();
      e13.position.set(0, sideSize / 2, -sideSize / 2);
      box.add(e13);
      const e14 = e1.clone();
      e14.position.set(0, -sideSize / 2, -sideSize / 2);
      box.add(e14);

      const e2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, sideSize, 0.5), wallMaterial);
      const e21 = e2.clone();
      e21.position.set(sideSize / 2, 0, sideSize / 2);
      box.add(e21);
      const e22 = e2.clone();
      e22.position.set(sideSize / 2, 0, -sideSize / 2);
      box.add(e22);
      const e23 = e2.clone();
      e23.position.set(-sideSize / 2, 0, sideSize / 2);
      box.add(e23);
      const e24 = e2.clone();
      e24.position.set(-sideSize / 2, 0, -sideSize / 2);
      box.add(e24);


    }
    //new THREE.Mesh(new THREE.BoxGeometry(sideSize - 1, sideSize - 1, sideSize - 1), wallMaterial);
    // new THREE.LineSegments(
    //   new THREE.EdgesGeometry(new THREE.BoxGeometry(sideSize, sideSize, sideSize)),
    //   new THREE.LineBasicMaterial({ color: 0xFDABEA, linewidth: 10 })
    // );
    scene.add(box);

    // place camera
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(0, 0, -sideSize / 2);
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, R.domElement);
    controls.minDistance = 0.01;
    controls.maxDistance = sideSize * 5;

    // place objects & secondary cameras
    const topShape = new THREE.Mesh(new THREE.TetrahedronGeometry(), rainbowMaterial[0]);
    topShape.position.y = objectPos;
    scene.add(topShape);
    const topLight = new THREE.PointLight(0xddddaa, 0.02);
    topLight.position.set(0, cameraPos, 0);
    scene.add(topLight);
    const bottomCamera = new THREE.PerspectiveCamera(cameraFOV, ar, cameraNear, cameraFar);
    bottomCamera.position.y = cameraPos;
    bottomCamera.lookAt(topShape.position);
    bottomCamera.updateProjectionMatrix();

    let pikachu: THREE.Object3D<THREE.Event> | undefined;
    /* Model by Raghav Gupta: https://sketchfab.com/raghav-wd */
    meshLoader.load('pikachu/source/pikachu2.glb', (gltf) => {
      console.log('file loaded', gltf)
      pikachu = gltf.scene.children.find(o => o.name === "Pikachu");
      if (pikachu) {
        scene.add(pikachu);
        pikachu.scale.set(0.25, 0.25, 0.25);
        pikachu.position.set(1.5 * cameraPos, -0.5 * sideSize, 0);
        pikachu.rotateZ(Math.PI / 2);
      }

    });
    const rightCamera = new THREE.PerspectiveCamera(cameraFOV, ar, cameraNear, cameraFar);
    rightCamera.position.x = cameraPos;
    rightCamera.position.y = sideSize * 10;
    rightCamera.lookAt(cameraPos, -0.5 * sideSize, 0);
    rightCamera.updateProjectionMatrix();

    const backShape = new THREE.Mesh(new THREE.IcosahedronGeometry(), rainbowMaterial[7]);
    backShape.position.z = -objectPos;
    scene.add(backShape);
    const backLight = new THREE.PointLight(0xddddaa, 0.02);
    backLight.position.set(0, 0, cameraPos);
    scene.add(backLight)
    const frontCamera = new THREE.PerspectiveCamera(cameraFOV, ar, cameraNear, cameraFar);
    frontCamera.position.z = -cameraPos;
    frontCamera.lookAt(backShape.position);
    frontCamera.updateProjectionMatrix();

    // controls
    /*
    document.addEventListener('keydown', function (evt: KeyboardEvent) {
      switch (evt.code) {
        case "ArrowLeft":
          camera.rotation.y -= 0.01 * Math.PI;
          break;
        case "ArrowRight":
          camera.rotation.y += 0.01 * Math.PI;
          break;
        case "ArrowUp":
          camera.rotation.x += 0.01 * Math.PI;
          break;
        case "ArrowDown":
          camera.rotation.x -= 0.01 * Math.PI;
          break;
        default:
          console.log(`Unhandled key ${evt.code}`);
          break;
      }
      R.render(scene, camera);
      camera.updateProjectionMatrix();
    })
    */


    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      topShape.rotation.x += 0.01;
      topShape.rotation.y -= 0.01;

      backShape.rotation.z += 0.01;
      backShape.rotation.x -= 0.01;

      if (pikachu) {
        pikachu.rotation.z += 0.01;
      }

      R.setRenderTarget(frontBuffer);
      R.render(scene, frontCamera);
      R.setRenderTarget(rightBuffer);
      R.render(scene, rightCamera);
      R.setRenderTarget(bottomBuffer);
      R.render(scene, bottomCamera);
      R.setRenderTarget(null);
      R.render(scene, camera);
    };

    animate();
    return () => { canvasWrapper.removeChild(R.domElement) };
  });

  return (<div ref={mountRef}></div>);
};

export default Pure;