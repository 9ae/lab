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
    scene.background = new THREE.Color(0x221144);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasWrapper.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffeeff));

    //const bufferScene = new THREE.Scene();
    // scene.add(new THREE.AmbientLight(0xffffff));

    const ptLight = new THREE.PointLight(0xeeffee, 0.5, 100);
    ptLight.position.set(0, 0, 0);
    scene.add(ptLight);

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
    scene.add(helper); */
    const gridHelper = new THREE.GridHelper(50, 10);
    scene.add(gridHelper);


    /* Scene objects */

    const colors = [0xFDABAB, 0xFDC9AB, 0xFDEBAB, 0xE3FDAB, 0xACFDB3, 0xACF3FC, 0xACC2FC, 0xC1ABFC, 0xFDABEA].map(color => (new THREE.MeshPhongMaterial({ color, specular: 0x009900, shininess: 30, flatShading: true })));

    // add plane
    const geomPlane = new THREE.PlaneBufferGeometry(10, 10);
    const portal1 = new THREE.Mesh(geomPlane, new THREE.MeshBasicMaterial({ map: bufferTexture.texture, side: THREE.DoubleSide }));
    portal1.position.z = 5;
    scene.add(portal1);

    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xeeffee, transparent: true, opacity: 0.3, side: THREE.DoubleSide });

    const topSide = new THREE.Mesh(geomPlane, wallMaterial);
    topSide.rotateX(Math.PI / 2);
    topSide.position.y = 5
    scene.add(topSide);

    const leftSide = new THREE.Mesh(geomPlane, wallMaterial);
    leftSide.rotateY(Math.PI / 2);
    leftSide.position.x = 5;
    scene.add(leftSide);

    const backSide = new THREE.Mesh(geomPlane, wallMaterial);
    backSide.position.z = -5;
    scene.add(backSide);


    // place camera
    // const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(0, 0, 5);
    camera.updateProjectionMatrix();
    //  controls.update();

    // place geom
    const topShape = new THREE.Mesh(new THREE.IcosahedronGeometry(), colors[0]);
    topShape.position.y = 50;
    scene.add(topShape);

    const leftShape = new THREE.Mesh(new THREE.OctahedronGeometry(), colors[3]);
    leftShape.position.x = 50;
    scene.add(leftShape);

    const backShape = new THREE.Mesh(new THREE.IcosahedronGeometry(), colors[6]);
    backShape.position.z = -50;
    scene.add(backShape);

    // place secondary camera
    const portal1Camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    portal1Camera.position.y = 20;
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

      topShape.rotation.x += 0.01;
      topShape.rotation.z += 0.01;

      renderer.setRenderTarget(bufferTexture);
      renderer.render(scene, portal1Camera);
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