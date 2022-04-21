import React, { useRef, useState } from 'react';
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

type Portal = {
  pos: [number, number]
  camera: string
}

const PortalView = (props: Portal) => (<p>{props.camera} @ [{props.pos[0]}, {props.pos[1]}]</p>);

type BoxProps = JSX.IntrinsicElements['mesh'] & {
  speed: number
}

function Box(props: BoxProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useFrame((state, delta) => (ref.current.rotation.x += props.speed));
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}


function App() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} speed={0.01} />
      <Box position={[1.2, 0, 0]} speed={-0.05} />
    </Canvas>
  );
}

export default App;
