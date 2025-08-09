import { Suspense } from 'react';
import { Stats, OrbitControls, Html, Loader } from '@react-three/drei';
import CharacterModel from '../character/CharacterModel';
import { useCharacterStore } from '../store';
import { useShallow } from 'zustand/shallow';


export default function MainScene() {
    // This selector now only subscribes to the list of character IDs.
    // MainScene will NOT re-render when a character's settings change.
    const characterIds = useCharacterStore(
        useShallow((state) => state.characters.map((c) => c.id)),
    );
    return (
        <group>
            <ambientLight intensity={0.5} color={'white'} />
            <directionalLight intensity={1.0} position={[1, 1, 1]} color={'white'} />
            <directionalLight intensity={1.0} position={[10, 15, 10]} color={'white'} />
            <directionalLight intensity={0.5} position={[0, 10, -10]} color={'white'} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            <gridHelper />
            <axesHelper />
            <mesh scale={[0.01,0.1,0.1]}>
                <sphereGeometry />
                <meshStandardMaterial color="green" />
            </mesh>
            {characterIds.map((id) => (
                <Suspense fallback={null} key={id}>
                    <CharacterModel id={id} />
                </Suspense>
            ))}
            <Html center>
                <Loader />
            </Html>
            <Stats />
        </group>
    );
}
