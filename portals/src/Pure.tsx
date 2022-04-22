import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import React, { useEffect, useRef } from "react";
import { render } from '@testing-library/react';
import { buffer } from 'node:stream/consumers';

const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min + 1) + min;
}
const plusOrMinus = () => Math.random() > 0.5 ? 1 : -1;

const Pure = () => {

  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Setup */
    const canvasWrapper = mountRef.current;
    if (!canvasWrapper) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbfaf8);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasWrapper.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffeeff));

    const bufferScene = new THREE.Scene();
    bufferScene.add(new THREE.AmbientLight(0xffffff));
    bufferScene.background = new THREE.Color(0xeeeeff);
    const ptLight = new THREE.PointLight(0xeeffee, 0.5, 100);
    ptLight.position.set(0, 0, 0);
    bufferScene.add(ptLight);

    const bufferTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });

    window.addEventListener('resize', function () {
      var width = window.innerWidth;
      var height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }, false);

    /* Helpers 
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);
    */

    /* Scene objects */

    const colors = [0xFDABAB, 0xFDC9AB, 0xFDEBAB, 0xE3FDAB, 0xACFDB3, 0xACF3FC, 0xACC2FC, 0xC1ABFC, 0xFDABEA].map(color => (new THREE.MeshPhongMaterial({ color, specular: 0x009900, shininess: 30, flatShading: true })));

    // add plane
    const geomPlane = new THREE.PlaneBufferGeometry(5, 5);
    const portal1 = new THREE.Mesh(geomPlane, new THREE.MeshBasicMaterial({ map: bufferTexture.texture, side: THREE.DoubleSide }));
    portal1.position.z = 10;
    scene.add(portal1);

    // place camera
    // const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(0, 0, 20);
    camera.updateProjectionMatrix();
    //  controls.update();

    // place geom
    const geomTetra = new THREE.TetrahedronGeometry();
    const shape1 = new THREE.Mesh(geomTetra, colors[0]);
    shape1.position.y = 50;
    bufferScene.add(shape1);
    //  scene.add(shape1);

    // place secondary camera
    const portal1Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    portal1Camera.position.y = 40;
    portal1Camera.lookAt(0, 50, 0);
    portal1Camera.updateProjectionMatrix();

    // controls
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
      renderer.render(scene, camera);
      camera.updateProjectionMatrix();
    })

    const animate = () => {
      //  controls.update();

      shape1.rotation.x += 0.01;
      shape1.rotation.z += 0.01;

      renderer.setRenderTarget(bufferTexture);
      renderer.render(bufferScene, portal1Camera);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();
    return () => { canvasWrapper.removeChild(renderer.domElement) };
  });

  return (<div ref={mountRef}></div>);
};

export default Pure;