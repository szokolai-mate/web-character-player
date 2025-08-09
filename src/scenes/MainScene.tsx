import { Suspense, useMemo } from 'react';
import { ModelLoader } from '../loaders/ModelLoader';
import { Stats, OrbitControls } from '@react-three/drei';
import { CharacterModel } from '../character/CharacterModel';
import { useCharacterStore } from '../store';


export default function MainScene() {
    // Select only the array of characters.
    // This component will only re-render if a character is added or removed.
    const characters = useCharacterStore((state) => state.characters);
    // useMemo will cache the promises, preventing re-loading on every render
    const modelPromises = useMemo(() => {
        const modelLoader = new ModelLoader();
        return characters.map(character => modelLoader.load(character.url));
    }, [characters]);
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
            {modelPromises.map((item, index) => (
                <Suspense fallback={null}>
                    <CharacterModel key={characters[index].id} id={characters[index].id} modelPromise={item}/>
                </Suspense>
            ))}
            <Stats />
        </group>
    );
}
