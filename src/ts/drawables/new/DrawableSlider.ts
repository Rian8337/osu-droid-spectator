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
import { SpectatorObjectData } from "../../spectator/rawdata/SpectatorObjectData";
import { DrawableNestedHitObject } from "./DrawableNestedHitObject";
import { DrawableSliderRepeat } from "./DrawableSliderRepeat";
import { DrawableSliderTick } from "./DrawableSliderTick";
import { DrawableSliderTail } from "./DrawableSliderTail";

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

    override applySpectatorData(data: SpectatorObjectData) {
        for (const nestedHitObject of this.nestedHitObjects) {
            nestedHitObject.applySpectatorData(data);
        }
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
}
