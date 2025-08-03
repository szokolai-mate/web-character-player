import { VRMCharacter } from '../classes/VRMCharacter';

interface MainSceneProps {
    color: string;
    characters: VRMCharacter[];
    //TODO
}

export default function MainScene({ color, characters }: MainSceneProps) {
    return (
        <group>
            <ambientLight intensity={1.5 * Math.PI} />
            <pointLight position={[10, 10, 10]} />
            <mesh>
                <sphereGeometry />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}
