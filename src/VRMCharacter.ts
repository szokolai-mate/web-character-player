import { Character } from "./Character";

export class VRMCharacter extends Character {
    public vrm;

    constructor(scene: THREE.Object3D, vrm: any) {
        super(scene);
        this.vrm = vrm;
    }
}
