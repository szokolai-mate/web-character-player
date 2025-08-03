import './style.css';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, Html } from '@react-three/drei';
import MainScene from './scenes/MainScene';

// TODO: stuff to see in old extension
// hitboxes
// renderer and camera settings
// controls seems custom?
// frustum culling??
// connect both text talk and audio talk
// possibly streaming talk, ie dont just start at the end of the message
// 3d background?
// connecting to the expression classification
// TODO: improvements
// check is VRM 1.0 expression exports can affect materials and uv or not
// document
// good interface for mixing expressions and animations, with parameters
// -> i will need React
// web workers for loading?
// migrate to React Three Fiber, meshes, animation, everything
// multi-character management (load, cleanup etc)
// AnimationUtils.subclip and other good stuff in Three animation calsses (like fade)
// Use errorboundry for suspense
// Look through Drei, it has a lot of good stuff
// Extension is now not loading due to Fiber, need to inject, see React Extension template
// multiple <Loader /> possible? how do they even work?

export default function App() {
    return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 2, 2], fov: 75 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#242424');
        }}>
        <Suspense fallback={null}>
            <MainScene color='blue' urls={['assets/HatsuneMikuNT.vrm', 'assets/Untitled imp.vrm', 'assets/Untitled impv1.vrm']}/>
        </Suspense>
        <Html center>
            <Loader />
        </Html>
      </Canvas>
    </div>
  );
}

console.log("#################### MY EXTENSION LOADED! ####################");
