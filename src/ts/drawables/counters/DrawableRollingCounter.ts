import { Easing, Interpolation } from "@rian8337/osu-base";
import { DrawableCounter } from "./DrawableCounter";
import { interpolateEasing } from "../../utils/EasingInterpolator";

/**
 * A counter that supports rolling.
 */
export abstract class DrawableRollingCounter extends DrawableCounter {
    /**
     * The duration of the rolling effect in milliseconds.
     */
    protected readonly rollingDuration: number = 0;

    /**
     * The easing function used for the rolling effect.
     */
    protected readonly rollingEasing: Easing = Easing.outQuad;

    /**
     * Whether to allow fractional values.
     */
    protected readonly allowFractional: boolean = false;

    private _currentValue = 0;

    /**
     * The current value of the counter.
     */
    get currentValue(): number {
        return this._currentValue;
    }

    private targetAnimationValue = 0;
    private initialAnimationValue = 0;
    private lastTargetValueChangeClockTime = Date.now();
    private lastTargetValueChangeBeatmapTime = 0;

    /**
     * The time of the last target value change in the beatmap.
     */
    protected get lastTargetValueChangeTime(): number {
        return this.lastTargetValueChangeBeatmapTime;
    }

    /**
     * Updates this counter.
     *
     * @param time The current time in the beatmap.
     */
    protected update(time: number) {
        const newTargetValue = this.getTargetValue(time);

        if (newTargetValue !== this.targetAnimationValue) {
            this.lastTargetValueChangeBeatmapTime = time;
            this.lastTargetValueChangeClockTime = Date.now();

            this.initialAnimationValue = this.currentValue;
            this.targetAnimationValue = newTargetValue;
        }

        if (this.currentValue !== this.targetAnimationValue) {
            if (this.rollingDuration > 0) {
                const progress = Math.min(
                    1,
                    (Date.now() - this.lastTargetValueChangeClockTime) /
                        this.rollingDuration,
                );

                this._currentValue = Interpolation.lerp(
                    this.initialAnimationValue,
                    this.targetAnimationValue,
                    interpolateEasing(this.rollingEasing, progress),
                );

                if (!this.allowFractional) {
                    this._currentValue = Math.trunc(this._currentValue);
                }
            } else {
                this._currentValue = this.targetAnimationValue;
            }
        }
    }

    /**
     * Sets the target value of the counter at the given time.
     *
     * @param time The current time.
     */
    protected abstract getTargetValue(time: number): number;
}
