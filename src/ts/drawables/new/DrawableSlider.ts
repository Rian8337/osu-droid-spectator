import {
    Slider,
    SliderHead,
    SliderRepeat,
    SliderTick,
} from "@rian8337/osu-base";
import { DrawableHitObject } from "./DrawableHitObject";
import { DrawableSliderHead } from "./DrawableSliderHead";
import { DrawableSliderPath } from "./DrawableSliderPath";
import { DrawableFollowCircle } from "./DrawableFollowCircle";
import { DrawableNestedHitObject } from "./DrawableNestedHitObject";
import { DrawableSliderRepeat } from "./DrawableSliderRepeat";
import { DrawableSliderTick } from "./DrawableSliderTick";
import { DrawableSliderTail } from "./DrawableSliderTail";
import { ArmedState } from "./ArmedState";

/**
 * Represents a slider that can be drawn.
 */
export class DrawableSlider extends DrawableHitObject<Slider> {
    private readonly followCircle: DrawableFollowCircle;
    private readonly path: DrawableSliderPath;

    constructor() {
        super();

        this.addAll(
            (this.path = new DrawableSliderPath()),
            (this.followCircle = new DrawableFollowCircle()),
        );
    }

    protected override applySpectatorDataInternal() {
        // Spectator data is applied to individual nested hit objects.
    }

    protected override applyHitObjectInternal(hitObject: Slider) {
        super.applyHitObjectInternal(hitObject);

        // Add nested hit object
        for (const nestedHitObject of hitObject.nestedHitObjects) {
            let drawableNested: DrawableNestedHitObject;

            if (nestedHitObject instanceof SliderHead) {
                drawableNested = new DrawableSliderHead();
            } else if (nestedHitObject instanceof SliderRepeat) {
                drawableNested = new DrawableSliderRepeat();
            } else if (nestedHitObject instanceof SliderTick) {
                drawableNested = new DrawableSliderTick();
            } else {
                drawableNested = new DrawableSliderTail();
            }

            drawableNested.parentHitObject = this;
            drawableNested.applyHitObject(nestedHitObject);

            this.nestedHitObjects.push(drawableNested);
            this.add(drawableNested);
        }

        this.path.applySlider(this);
        this.followCircle.slider = hitObject;
    }

    protected override updateInitialTransforms(transformStartTime: number) {
        super.updateInitialTransforms(transformStartTime);

        const { baseObject: slider } = this;

        if (!slider) {
            return;
        }

        this.path
            .beginAbsoluteSequence(transformStartTime)
            .fadeInFromZero(slider.timeFadeIn);
    }

    protected override updateStartTimeTransforms(transformStartTime: number) {
        super.updateStartTimeTransforms(transformStartTime);

        const { baseObject: slider } = this;

        if (!slider) {
            return;
        }

        this.followCircle
            .beginAbsoluteSequence(transformStartTime)
            .fadeIn()
            .scaleTo(slider.scale);
    }

    protected override updateHitStateTransforms(
        transformStartTime: number,
        newState: ArmedState,
    ) {
        super.updateHitStateTransforms(transformStartTime, newState);

        const fadeOutDuration = 240;

        this.beginAbsoluteSequence(transformStartTime).fadeOut(fadeOutDuration);
        this.expire();
    }
}
