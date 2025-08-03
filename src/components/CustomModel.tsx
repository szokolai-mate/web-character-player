import { useRef, use } from 'react';
import { useFrame } from '@react-three/fiber';

interface CustomModelProps {
    modelPromise: Promise<[THREE.Object3D[], Record<string, unknown>]>;
    position?: [number, number, number];
    scale?: [number, number, number];
}

export function CustomModel({ modelPromise, position = [0, 0, 0], scale = [1, 1, 1] }: CustomModelProps) {
    const model = use(modelPromise);
    const ref = useRef<THREE.Object3D>(null);

    useFrame(() => {
        // Animation logic if needed
        if (ref.current) {
        }
    });

    return <primitive object={ model[0][0] } ref = { ref } position = { position } scale = { scale } />;
}