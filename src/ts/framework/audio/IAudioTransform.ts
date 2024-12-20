import { Easing } from "@rian8337/osu-base";
import { AudioTransformSequence } from "./AudioTransformSequence";

/**
 * A common interface for transforms that can be applied to an `Audio`.
 */
export interface IAudioTransform {
    /**
     * Smoothly adjusts the `Audio`'s playback rate over time.
     *
     * @param rate The target playback rate.
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns An `AudioTransformSequence` to which further `Transform`s can be added.
     */
    playbackRateTo(
        rate: number,
        duration?: number,
        easing?: Easing,
    ): AudioTransformSequence;

    /**
     * Smoothly adjusts the `Audio`'s volume over time.
     *
     * @param volume The target volume.
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns An `AudioTransformSequence` to which further `Transform`s can be added.
     */
    volumeTo(
        volume: number,
        duration?: number,
        easing?: Easing,
    ): AudioTransformSequence;
}
