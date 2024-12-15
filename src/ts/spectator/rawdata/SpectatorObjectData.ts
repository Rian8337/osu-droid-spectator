import { HitResult } from "../structures/HitResult";

/**
 * Represents spectator object hit data to be sent to the spectator client.
 */
export interface SpectatorObjectData {
    /**
     * The time at which the hit result of this object is shown, in milliseconds.
     */
    readonly time: number;

    /**
     * The index of this object in the beatmap.
     */
    readonly index: number;

    /**
     * For circles, this is the offset at which the circle was hit. If the hit accuracy is 10000,
     * it means the circle was tapped too late and therefore the player missed ([game source code](https://github.com/osudroid/osu-droid/blob/ca0e4a2c06b9db18d094a15a4abf3f7ffcb05d7a/src/ru/nsu/ccfit/zuev/osu/game/GameplayHitCircle.java#L305)).
     *
     * For sliders, this is the offset at which the slider head was hit. For sliderbreaks, there are two scenarios:
     * - a value equal to `Math.floor(<hit window 50>ms) + 13ms` strictly for replays before version 1.7.2 ([game source code](https://github.com/osudroid/osu-droid/blob/6306c68e3ffaf671eac794bf45cc95c0f3313a82/src/ru/nsu/ccfit/zuev/osu/game/Slider.java#L821)), or
     * - a value that is more than the slider's duration ([game source code](https://github.com/osudroid/osu-droid/blob/ca0e4a2c06b9db18d094a15a4abf3f7ffcb05d7a/src/ru/nsu/ccfit/zuev/osu/game/GameplaySlider.java#L701)).
     *
     * `tickset` and `result` can be used in conjunction with this value to derive whether the player sliderbroke in the slider.
     * If `result` is a 300, the player did not sliderbreak. Otherwise, if all slider ticks, repeats, and ends were hit, the
     * player sliderbroke. In other cases, it is almost impossible to derive this result.
     *
     * For spinners, this is the total amount at which the spinner was spinned:
     * ```js
     * const rotations = Math.floor(data.accuracy / 4);
     * ```
     * The remainder of the division denotes the hit result of the spinner:
     * - `HitResult.great`: 3
     * - `HitResult.good`: 2
     * - `HitResult.meh`: 1
     * - `HitResult.miss`: 0
     */
    readonly accuracy: number;

    /**
     * The tickset of the hitobject.
     *
     * This is used to determine whether or not a slider event (tick, repeat, and end) is hit based on the order they appear.
     */
    readonly tickset: boolean[];

    /**
     * The bitwise hit result of the hitobject.
     */
    readonly result: HitResult;
}
