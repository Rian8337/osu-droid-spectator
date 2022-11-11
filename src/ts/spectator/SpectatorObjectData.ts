/**
 * Represents spectator object hit data to be sent to the spectator client.
 */
export interface SpectatorObjectData {
    /**
     * The score of the player after the object was hit.
     */
    currentScore: number;

    /**
     * The combo of the player after the object was hit.
     */
    currentCombo: number;

    /**
     * The accuracy of the player after the object was hit, from 0 to 1.
     */
    currentAccuracy: number;

    /**
     * The amount of seconds that have passed throughout the player's gameplay.
     */
    secPassed: number;

    /**
     * For circles, this is the offset at which the circle was hit.
     *
     * For sliders, this is the offset at which the slider head was hit. For
     * sliderbreaks, the accuracy would be `(hit window 50)ms + 13ms` ([game source code](https://github.com/osudroid/osu-droid/blob/6306c68e3ffaf671eac794bf45cc95c0f3313a82/src/ru/nsu/ccfit/zuev/osu/game/Slider.java#L821)).
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
    accuracy: number;

    /**
     * The tickset of the hitobject.
     *
     * This is used to determine whether or not a slider event (tick, repeat, and end) is hit based on the order they appear.
     */
    tickset: boolean[];

    /**
     * The bitwise hit result of the hitobject.
     */
    result: number;
}
