import { Suspense } from 'react';
import { ModelLoader } from '../loaders/ModelLoader';
import { Stats, OrbitControls } from '@react-three/drei';
import { CharacterModel } from '../components/CharacterModel';

interface MainSceneProps {
    color: string;
    urls: string[];
    //TODO
}

export default function MainScene({ color, urls = []}: MainSceneProps) {
    const modelLoader = new ModelLoader();
    const modelPromises = [];
    for (const url of urls) {
        modelPromises.push(modelLoader.load(url));
    }
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
                <meshStandardMaterial color={color} />
            </mesh>
            {modelPromises.map((item, index) => (
                <Suspense fallback={null}>
                    <CharacterModel modelPromise={item} position={[2*index, 0, 0]}/>
                </Suspense>
            ))}
            <Stats />
        </group>
    );
}
