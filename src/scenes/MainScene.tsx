import { Suspense } from 'react';
import { ModelLoader } from '../loaders/ModelLoader';
import { Stats, OrbitControls } from '@react-three/drei';
import { CharacterModel } from '../character/CharacterModel';
import { CharacterType } from '../types';

interface MainSceneProps {
    color: string;
    characters: CharacterType[];
    //TODO
}

export default function MainScene({ color, characters = [] }: MainSceneProps) {
    const modelLoader = new ModelLoader();
    const modelPromises = [];
    for (const character of characters) {
        modelPromises.push(modelLoader.load(character.url));
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
                    <CharacterModel key={characters[index].id} modelPromise={item} settings={characters[index].settings}/>
                </Suspense>
            ))}
            <Stats />
        </group>
    );
}
