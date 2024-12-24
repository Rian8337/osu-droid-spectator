import { Anchor, MathUtils, RGBColor, Slider } from "@rian8337/osu-base";
import { HollowCircle } from "../../framework/drawables/HollowCircle";

/**
 * Represents the follow circle of a slider.
 */
export class DrawableFollowCircle extends HollowCircle {
    private _slider: Slider | null = null;

    get slider(): Slider | null {
        return this._slider;
    }

    set slider(value: Slider | null) {
        this._slider = value;

        if (value) {
            this.radius = value.radius;
            this.borderThickness = value.radius / 8;
        }
    }

    constructor() {
        super();

        this.origin = Anchor.center;
        this.color = new RGBColor(255, 255, 255);
    }

    override update(time: number) {
        super.update(time);

        const { slider } = this;

        if (!slider) {
            return;
        }

        const completionProgress = MathUtils.clamp(
            (time - slider.startTime) / slider.duration,
            0,
            1,
        );

        this.position = slider.curvePositionAt(completionProgress);

        // 0.1 / slider.distance is the additional progress needed to ensure the diff length is 0.1
        const diff = this.position.subtract(
            slider.curvePositionAt(
                Math.min(1, completionProgress + 0.1 / slider.distance),
            ),
        );

        // Ensure the value is substantially high enough to allow for atan2 to get a valid angle.
        // Needed for when near completion, or in case of a very short slider.
        if (diff.length < 0.01) {
            return;
        }

        this.rotation = -Math.PI / 4 - Math.atan2(diff.x, diff.y);
    }
}
