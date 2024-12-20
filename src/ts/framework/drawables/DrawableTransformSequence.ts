import { Drawable } from "./Drawable";
import { IDrawableTransform } from "./IDrawableTransform";
import { TransformSequence } from "../transforms/TransformSequence";
import { Easing, Vector2 } from "@rian8337/osu-base";

/**
 * A `TransformSequence` for `Drawable`s.
 */
export class DrawableTransformSequence
    extends TransformSequence<Drawable>
    implements IDrawableTransform
{
    //#region Fade

    fadeIn(duration = 0, easing = Easing.none): this {
        return this.fadeTo(1, duration, easing);
    }

    fadeInFromZero(duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.alpha,
            duration,
            easing,
            () => 0,
            (_, progress) => (this.target.alpha = progress),
        );

        return this;
    }

    fadeOut(duration = 0, easing = Easing.none): this {
        return this.fadeTo(0, duration, easing);
    }

    fadeOutFromOne(duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.alpha,
            duration,
            easing,
            () => 1,
            (_, progress) => (this.target.alpha = 1 - progress),
        );

        return this;
    }

    fadeTo(alpha: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.alpha,
            duration,
            easing,
            () => this.target.alpha,
            (startValue, progress) =>
                (this.target.alpha =
                    startValue + progress * (alpha - startValue)),
        );

        return this;
    }

    hide(): this {
        return this.fadeOut();
    }

    show(): this {
        return this.fadeIn();
    }

    //#endregion

    //#region Rotate

    rotateTo(rotation: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.rotation,
            duration,
            easing,
            () => this.target.rotation,
            (startValue, progress) =>
                (this.target.rotation =
                    startValue + progress * (rotation - startValue)),
        );

        return this;
    }

    //#endregion

    //#region Scale

    scaleTo(scale: number | Vector2, duration = 0, easing = Easing.none): this {
        const xScaleTarget = typeof scale === "number" ? scale : scale.x;
        const yScaleTarget = typeof scale === "number" ? scale : scale.y;

        this.addTransform(
            DrawableTransformSequenceTargetMember.scale,
            duration,
            easing,
            () => this.target.scale,
            (startValue, progress) =>
                (this.target.scale = new Vector2(
                    startValue.x + progress * (xScaleTarget - startValue.x),
                    startValue.y + progress * (yScaleTarget - startValue.y),
                )),
        );

        return this;
    }

    //#endregion

    //#region Size

    resizeTo(size: number | Vector2, duration = 0, easing = Easing.none): this {
        const xSizeTarget = typeof size === "number" ? size : size.x;
        const ySizeTarget = typeof size === "number" ? size : size.y;

        this.addTransform(
            DrawableTransformSequenceTargetMember.size,
            duration,
            easing,
            () => this.target.size,
            (startValue, progress) =>
                (this.target.size = new Vector2(
                    startValue.x + progress * (xSizeTarget - startValue.x),
                    startValue.y + progress * (ySizeTarget - startValue.y),
                )),
        );

        return this;
    }

    resizeWidthTo(width: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.size,
            duration,
            easing,
            () => this.target.size.x,
            (startValue, progress) =>
                (this.target.size = new Vector2(
                    startValue + progress * (width - startValue),
                    this.target.size.y,
                )),
        );

        return this;
    }

    resizeHeightTo(height: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.size,
            duration,
            easing,
            () => this.target.size.y,
            (startValue, progress) =>
                (this.target.size = new Vector2(
                    this.target.size.x,
                    startValue + progress * (height - startValue),
                )),
        );

        return this;
    }

    //#endregion

    //#region Position

    moveTo(
        position: number | Vector2,
        duration = 0,
        easing = Easing.none,
    ): this {
        position =
            typeof position === "number" ? new Vector2(position) : position;

        this.addTransform(
            DrawableTransformSequenceTargetMember.position,
            duration,
            easing,
            () => this.target.position,
            (startValue, progress) =>
                (this.target.position = startValue.add(
                    position.subtract(startValue).scale(progress),
                )),
        );

        return this;
    }

    moveToX(x: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.position,
            duration,
            easing,
            () => this.target.position.x,
            (startValue, progress) =>
                (this.target.position = new Vector2(
                    startValue + progress * (x - startValue),
                    this.target.position.y,
                )),
        );

        return this;
    }

    moveToY(y: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            DrawableTransformSequenceTargetMember.position,
            duration,
            easing,
            () => this.target.position.y,
            (startValue, progress) =>
                (this.target.position = new Vector2(
                    this.target.position.x,
                    startValue + progress * (y - startValue),
                )),
        );

        return this;
    }

    moveToOffset(
        offset: number | Vector2,
        duration = 0,
        easing = Easing.none,
    ): this {
        offset = typeof offset === "number" ? new Vector2(offset) : offset;

        this.addTransform(
            DrawableTransformSequenceTargetMember.position,
            duration,
            easing,
            () => this.target.position,
            (startValue, progress) =>
                (this.target.position = startValue.add(offset.scale(progress))),
        );

        return this;
    }

    //#endregion
}

enum DrawableTransformSequenceTargetMember {
    alpha = "alpha",
    rotation = "rotation",
    scale = "scale",
    size = "size",
    position = "position",
}
