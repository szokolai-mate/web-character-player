import { randInt } from "three/src/math/MathUtils";
import { Character } from "./Character";
import { Tween, Easing } from "@tweenjs/tween.js";

export class VRMCharacter extends Character {
    protected vrm;

    constructor(scene: THREE.Object3D, vrm: any) {
        super(scene);
        this.vrm = vrm;
    }

    public override update(dT: number): void {
        super.update(dT);
        this.vrm.update(dT)
    }

    public tweenExpression(name: string, weight: number, time: number, curve: (a: number) => number ): Tween {
        const t = new Tween(this.vrm.expressionManager.getExpression(name))
          .to({ weight: weight }, time)
          .easing(curve)
        return t;
    }

    public setUpBlinking(): void {
        const blinkDown = this.tweenExpression("blink", 1.0, 130, Easing.Quintic.In);
        const blinkUp = this.tweenExpression("blink", 0.0, 220, Easing.Quintic.Out);
        blinkDown.onComplete(() => {
            this.onBlinkDown(blinkDown, blinkUp);
        });
        blinkUp.onComplete(() => {
            this.onBlinkUp(blinkUp, blinkDown);
        });
        blinkDown.start()
        this.tweens.add(blinkDown, blinkUp);
    }

    public onBlinkDown(curr: Tween, next: Tween) {
        curr.duration(randInt(50, 250))
        next.delay(randInt(20, 200)).start();
    }

    public onBlinkUp(curr: Tween, next: Tween) {
        curr.duration(randInt(100, 350))
        next.delay(randInt(200, 1800)).start();
    }
}
