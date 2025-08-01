import { Group as TweenGroup } from '@tweenjs/tween.js';

export class Character {
    public scene: THREE.Object3D;
    public tweens: TweenGroup;

    constructor(scene: THREE.Object3D) {
        this.scene = scene;
        this.tweens = new TweenGroup();
    }
}
