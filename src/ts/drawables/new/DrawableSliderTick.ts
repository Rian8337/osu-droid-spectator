import { Anchor, Easing, RGBColor, SliderTick } from "@rian8337/osu-base";
import { HollowCircle } from "../../framework/drawables/HollowCircle";
import { DrawableNestedHitObject } from "./DrawableNestedHitObject";
import { ArmedState } from "./ArmedState";

/**
 * Represents a slider tick that can be drawn.
 */
export class DrawableSliderTick extends DrawableNestedHitObject<SliderTick> {
    private static readonly animDuration = 150;

    constructor() {
        super();

        const defaultTickSize = 16;

        this.size = 128;
        this.origin = Anchor.center;

        const circle = new HollowCircle();

        circle.size = defaultTickSize;
        circle.anchor = Anchor.center;
        circle.origin = Anchor.center;
        circle.borderThickness = defaultTickSize / 4;
        circle.color = new RGBColor(255, 255, 255);

        this.add(circle);
    }

    protected override applyHitObjectInternal(hitObject: SliderTick) {
        super.applyHitObjectInternal(hitObject);

        if (!this.parentHitObject) {
            return;
        }

        this.position = hitObject.position.subtract(
            this.parentHitObject.position,
        );
    }

    protected override updateInitialTransforms(transformStartTime: number) {
        this.alpha = 0;
        this.scale = 0.5;

        this.beginAbsoluteSequence(transformStartTime)
            .fadeIn(DrawableSliderTick.animDuration)
            .scaleTo(
                1,
                DrawableSliderTick.animDuration * 4,
                Easing.outElasticHalf,
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

        const sequence = this.beginAbsoluteSequence(
            transformStartTime + this.baseObject.timePreempt,
        );

        switch (newState) {
            case ArmedState.idle:
                sequence.fadeOut();
                break;

            case ArmedState.miss:
                sequence.fadeOut(
                    DrawableSliderTick.animDuration,
                    Easing.outQuint,
                );
                break;

            case ArmedState.hit:
                sequence
                    .fadeOut(DrawableSliderTick.animDuration, Easing.outQuint)
                    .scaleTo(
                        this.scale.scale(1.5),
                        DrawableSliderTick.animDuration,
                        Easing.out,
                    );
                break;
        }
    }
}
