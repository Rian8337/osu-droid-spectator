import { Easing, Vector2 } from "@rian8337/osu-base";
import { DrawableTransformSequence } from "./DrawableTransformSequence";

/**
 * A common interface for transforms that can be applied to a `Drawable`.
 */
export interface IDrawableTransform {
    //#region Alpha

    /**
     * Smoothly adjusts the `Drawable`'s alpha to 1 over time.
     *
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    fadeIn(duration?: number, easing?: Easing): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s alpha from 0 to 1 over time.
     *
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    fadeInFromZero(
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s alpha to 0 over time.
     *
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    fadeOut(duration?: number, easing?: Easing): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s alpha from 1 to 0 over time.
     *
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    fadeOutFromOne(
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s alpha over time.
     *
     * @param alpha The target alpha value.
     * @param duration The duration of the fade in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the fade. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    fadeTo(
        alpha: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Immediately hides the `Drawable`.
     *
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    hide(): DrawableTransformSequence;

    /**
     * Immediately shows the `Drawable`.
     *
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    show(): DrawableTransformSequence;

    //#endregion

    //#region Rotate

    /**
     * Smoothly adjusts the `Drawable`'s rotation over time.
     *
     * @param rotation The target rotation value.
     * @param duration The duration of the rotation in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the rotation. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    rotateTo(
        rotation: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    //#endregion

    //#region Scale

    /**
     * Smoothly adjusts the `Drawable`'s scale over time.
     *
     * @param scale The target scale value.
     * @param duration The duration of the scale in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the scale. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    scaleTo(
        scale: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    //#endregion

    //#region Size

    /**
     * Smoothly adjusts the `Drawable`'s size over time.
     *
     * @param size The target size value.
     * @param duration The duration of the size in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the size. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    resizeTo(
        size: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s width over time.
     *
     * @param width The target width value.
     * @param duration The duration of the width in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the width. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    resizeWidthTo(
        width: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s height over time.
     *
     * @param height The target height value.
     * @param duration The duration of the height in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the height. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    resizeHeightTo(
        height: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    //#endregion

    //#region Position

    /**
     * Smoothly adjusts the `Drawable`'s position over time.
     *
     * @param position The target position value.
     * @param duration The duration of the position in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the position. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    moveTo(
        position: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s X position over time.
     *
     * @param x The target X position value.
     * @param duration The duration of the X position in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the X position. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    moveToX(
        x: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s Y position over time.
     *
     * @param y The target Y position value.
     * @param duration The duration of the Y position in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the Y position. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    moveToY(
        y: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    /**
     * Smoothly adjusts the `Drawable`'s position by an offset to its final value over time.
     *
     * @param offset The target position offset value.
     * @param duration The duration of the position in milliseconds. Defaults to 0.
     * @param easing The easing function to use for the position. Defaults to linear (`Easing.none`).
     * @returns A `DrawableTransformSequence` to which further `Transform`s can be added.
     */
    moveToOffset(
        offset: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence;

    //#endregion
}
