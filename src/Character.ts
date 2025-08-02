import { Group as TweenGroup } from '@tweenjs/tween.js';

export class Character {
    public scene: THREE.Object3D;
    protected tweens: TweenGroup;

    constructor(scene: THREE.Object3D) {
        this.scene = scene;
        this.tweens = new TweenGroup();
    }

    public update(dT: number): void {
        this.tweens.update()
    }
}
