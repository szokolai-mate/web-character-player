import { randFloat, randInt } from "three/src/math/MathUtils";
import { Character } from "./Character";
import { Tween, Easing } from "@tweenjs/tween.js";
import { VRMCore } from "@pixiv/three-vrm";

export class VRMCharacter extends Character {
    protected vrm: VRMCore;
    // TODO: must be determined by setting or active expressions
    protected minBlink: number = 0.0;

    constructor(scene: THREE.Object3D, vrm: VRMCore) {
        super(scene);
        this.vrm = vrm;
    }

    public override update(dT: number): void {
        super.update(dT);
        this.vrm.update(dT)
    }

    public tweenExpression(name: string, weight: number, time: number, curve: (a: number) => number ): Tween | null {
        if (this.vrm.expressionManager) {
            const expression = this.vrm.expressionManager.getExpression(name);
            if (expression) {
                const t = new Tween(expression)
                .to({ weight: weight }, time)
                .easing(curve)
                return t;
            }
        }
        return null;
    }

    public setUpBlinking(): void {
        const blinkDown = this.tweenExpression("blink", 1.0, 130, Easing.Quintic.In);
        const blinkUp = this.tweenExpression("blink", this.minBlink, 220, Easing.Back.Out);
        if (blinkUp && blinkDown) {
            blinkDown.onComplete(() => {
                this.onBlinkDown(blinkDown, blinkUp);
            });
            blinkUp.onComplete(() => {
                this.onBlinkUp(blinkUp, blinkDown);
            });
            blinkDown.start()
            this.tweens.add(blinkDown, blinkUp);
        }
        // TODO: error
    }

    public onBlinkDown(curr: Tween, next: Tween) {
        curr.duration(randInt(50, 250))
        next.delay(randInt(20, 200)).startFromCurrentValues();
    }

    public onBlinkUp(curr: Tween, next: Tween) {
        curr.duration(randInt(100, 350))
        next.delay(randInt(200, 1800)).startFromCurrentValues();
    }
}
