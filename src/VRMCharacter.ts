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
        this.setUpMouthTweens();
        this.setUpBlinking();
        this.unTPose();
    }

    public override update(dT: number): void {
        super.update(dT);
        this.vrm.update(dT)
    }

    public unTPose(): void {
        const h = this.vrm.humanoid;
        let bone1 = h.getNormalizedBoneNode("rightUpperArm");
        let bone2 = h.getNormalizedBoneNode("rightLowerArm");
        let bone3 = h.getNormalizedBoneNode("leftUpperArm");
        let bone4 = h.getNormalizedBoneNode("leftLowerArm");
        if (bone1 && bone2 && bone3 && bone4) {
            if (this.vrm.meta?.metaVersion === '1') {
                bone1.rotation.z = -250;
                bone2.rotation.z = 0.2;
                bone3.rotation.z = 250;
                bone4.rotation.z = -0.2;
            }
            else {
                bone1.rotation.z = 250;
                bone2.rotation.z = -0.2;
                bone3.rotation.z = -250;
                bone4.rotation.z = 0.2;
            }
        }
    }

    public createExpressionTween(name: string, weight: number, time: number, curve: (a: number) => number = Easing.Sinusoidal.InOut): Tween | null {
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

    public tweenExpression(name: string, weight: number, time: number, curve: (a: number) => number = Easing.Sinusoidal.InOut): void {
        const t = this.createExpressionTween(name, weight, time, curve);
        if (t) {
            t.onComplete(() => {
                this.tweens.remove(t);
            });
            t.start();
            this.tweens.add(t);
        }
        //TODO error
    }

    protected override async loadAnimation(url: string) {
        //TODO error
        this.loadedAnimations.push(await this.animationLoader.BHVforVRM(url, this.vrm));
    }

    private setUpBlinking(): void {
        const blinkDown = this.createExpressionTween("blink", 1.0, 130, Easing.Quintic.In);
        const blinkUp = this.createExpressionTween("blink", this.minBlink, 220, Easing.Back.Out);
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

    private setUpMouthTweens(): void {
        const manager = this.vrm.expressionManager
        if (manager) {
            for (const expName of manager.mouthExpressionNames) {
                const t = this.createExpressionTween(expName, 0.0, 100, Easing.Quintic.Out);
                if (t) {
                    this.mouthTweens.add(t);
                    this.mouthTweenMap.set(expName, t);
                }
            }
        }
    }
}
