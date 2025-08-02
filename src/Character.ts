import { randFloat, randInt } from "three/src/math/MathUtils";
import { Group as TweenGroup, Tween, Easing } from '@tweenjs/tween.js';

export class Character {
    public scene: THREE.Object3D;
    protected tweens: TweenGroup;
    protected mouthTweens: TweenGroup;
    protected mouthTweenMap: Map<string, Tween>;

    constructor(scene: THREE.Object3D) {
        this.scene = scene;
        this.tweens = new TweenGroup();
        this.mouthTweens = new TweenGroup();
        this.mouthTweenMap = new Map<string, Tween>();
    }

    public update(dT: number): void {
        this.tweens.update()
        this.mouthTweens.update()
    }

    public onBlinkDown(curr: Tween, next: Tween) {
        curr.duration(randInt(50, 250))
        next.delay(randInt(20, 200)).startFromCurrentValues();
    }

    public onBlinkUp(curr: Tween, next: Tween) {
        curr.duration(randInt(100, 350))
        next.delay(randInt(200, 1800)).startFromCurrentValues();
    }

    //tmp
    public setUpInfiniteTalk(): void {
        const possibleExpressions = [...this.mouthTweenMap.keys()]
        // choose random expression
        const expression = possibleExpressions[randInt(0, possibleExpressions.length -1)]
        // neutralize other expressions
        for (const expName of possibleExpressions) {
            if (expName == expression) continue;
            const t = this.mouthTweenMap.get(expName)
            if (t) {
                t.stop();
                t.to({weight: 0.0})
                    .easing(Easing.Quintic.Out)
                    .duration(100)
                    .startFromCurrentValues();
            }
        }
        // set chosen dominant expression
        const t = this.mouthTweenMap.get(expression)
        if (t){
            t.stop();
            t.to({weight: randFloat(0.0, 1.0)})
                .easing(Easing.Sinusoidal.InOut)
                .duration(150)
                .startFromCurrentValues();
        }
        // loop
        setTimeout(() => {this.setUpInfiniteTalk()}, 180);
    }
}
