import {
    Anchor,
    Easing,
    RGBColor,
    Slider,
    SliderRepeat,
} from "@rian8337/osu-base";
import { Text } from "../../framework/drawables/Text";
import { DrawableNestedHitObject } from "./DrawableNestedHitObject";
import { ArmedState } from "./ArmedState";
import { DrawableCirclePiece } from "./DrawableCirclePiece";

/**
 * Represents a slider repeat.
 */
export class DrawableSliderRepeat extends DrawableNestedHitObject<SliderRepeat> {
    private readonly circlePiece = new DrawableCirclePiece();
    private readonly reverseArrow = new Text();
    private animDuration = 300;

    constructor() {
        super();

        this.reverseArrow.text = String.fromCharCode(10132);
        this.reverseArrow.bold = true;
        this.reverseArrow.anchor = Anchor.center;
        this.reverseArrow.origin = Anchor.center;
        this.reverseArrow.color = new RGBColor(255, 255, 255);

        this.addAll(this.circlePiece, this.reverseArrow);
    }

    protected override applyHitObjectInternal(hitObject: SliderRepeat) {
        super.applyHitObjectInternal(hitObject);

        this.circlePiece.radius = hitObject.radius;
        this.reverseArrow.fontSize = hitObject.radius / 16;
    }

    protected override updateInitialTransforms(transformStartTime: number) {
        if (
            !this.baseObject ||
            !(this.parentHitObject?.baseObject instanceof Slider)
        ) {
            return;
        }

        this.animDuration = Math.min(
            300,
            this.parentHitObject.baseObject.spanDuration,
        );

        this.beginAbsoluteSequence(transformStartTime).fadeInFromZero(
            this.baseObject.spanIndex === 0
                ? this.baseObject.timeFadeIn
                : this.animDuration,
        );
    }

    protected override updateHitStateTransforms(
        transformStartTime: number,
        newState: ArmedState,
    ) {
        super.updateHitStateTransforms(transformStartTime, newState);

        if (!this.baseObject) {
            return;
        }

        const sequence = this.beginAbsoluteSequence(transformStartTime);

        switch (newState) {
            case ArmedState.idle:
                sequence.delay(this.baseObject.timePreempt).fadeOut();
                break;

            case ArmedState.miss:
                sequence.fadeOut(this.animDuration);
                break;

            case ArmedState.hit:
                sequence.fadeOut(this.animDuration, Easing.out);
                break;
        }
    }
}
