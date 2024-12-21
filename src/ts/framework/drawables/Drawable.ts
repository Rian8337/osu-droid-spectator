import { Anchor, Easing, RGBColor, Vector2 } from "@rian8337/osu-base";
import { Clock } from "./Clock";
import { Transformable } from "../transforms/Transformable";
import { Container } from "./Container";
import { DrawableTransformSequence } from "./DrawableTransformSequence";
import { IDrawableTransform } from "./IDrawableTransform";
import { convertAnchor } from "../utils/AnchorConverter";
import { Axes } from "./Axes";

/**
 * Represents something that can be drawn to the screen via an {@link HTMLCanvasElement}.
 *
 * A `Drawable` occupies a rectangular space on the screen and can be transformed in various ways.
 */
export abstract class Drawable
    extends Transformable<DrawableTransformSequence>
    implements IDrawableTransform
{
    //#region Position

    private _position = new Vector2(0);

    /**
     * The position of this `Drawable`.
     *
     * May be in absolute or relative units (controlled by `relativePositionAxes`).
     */
    get position(): Vector2 {
        return this._position;
    }

    set position(value: number | Vector2) {
        value = value instanceof Vector2 ? value : new Vector2(value);

        if (this._position.equals(value)) {
            return;
        }

        this._position = value;
        this.parent?.invalidateSize();
    }

    private _relativePositionAxes = Axes.none;

    /**
     * Controls which axes of this `Drawable`'s `position` are relative to the size of the parent of this
     * `Drawable` (from 0 to 1) in the parent's coordinate system, rather than absolute positions. The axes
     * set in this property are ignored by automatically sizing parents.
     *
     * When setting this property, this `Drawable`'s `position` is converted such that `drawPosition`
     * remains invariant.
     */
    get relativePositionAxes(): Axes {
        return this._relativePositionAxes;
    }

    set relativePositionAxes(value: Axes) {
        if (this._relativePositionAxes === value) {
            return;
        }

        // Convert coordinates from relative to absolute or vice versa.
        const newPosition = this.convertCoordinatesFromAxesChange(
            this._relativePositionAxes,
            value,
            this.position,
        );

        this._relativePositionAxes = value;
        this.position = newPosition;
    }

    /**
     * The absolute position of this `Drawable` in the parent's coordinate system.
     */
    protected get drawPosition(): Vector2 {
        if (this.relativePositionAxes === Axes.none) {
            return this.position;
        }

        return this.convertRelativePosition(
            this.relativePositionAxes,
            this.position,
        );
    }

    //#endregion

    //#region Size

    private _size = new Vector2(0);

    /**
     * The size of this `Drawable` in the parent's coordinate system.
     *
     * May be in absolute or relative units (controlled by `relativeSizeAxes`).
     */
    get size(): Vector2 {
        return this._size;
    }

    set size(value: number | Vector2) {
        value = value instanceof Vector2 ? value : new Vector2(value);

        if (this._size.equals(value)) {
            return;
        }

        this._size = value;
        this.parent?.invalidateSize();
    }

    private _relativeSizeAxes = Axes.none;

    /**
     * Controls which axes of this `Drawable`'s `size` are relative to the size of the parent of this `Drawable`
     * (from 0 to 1) in the parent's coordinate system, rather than absolute sizes. The axes set in this
     * property are ignored by automatically sizing parents.
     *
     * If an axis becomes relatively sized and its component of size was previously 0, it automatically
     * becomes 1. In all other cases, this `Drawable`'s `size` is converted such that `drawSize` remains
     * invariant across changes of this property.
     */
    get relativeSizeAxes(): Axes {
        return this._relativeSizeAxes;
    }

    set relativeSizeAxes(value: Axes) {
        if (this._relativeSizeAxes === value) {
            return;
        }

        // Convert coordinates from relative to absolute or vice versa.
        const newSize = this.convertCoordinatesFromAxesChange(
            this._relativeSizeAxes,
            value,
            this.size,
        );

        this._relativeSizeAxes = value;

        if (value & Axes.x && newSize.x === 0) {
            newSize.x = 1;
        }

        if (value & Axes.y && newSize.y === 0) {
            newSize.y = 1;
        }

        this.size = newSize;
    }

    /**
     * The absolute size of this `Drawable` in the parent's coordinate system.
     */
    protected get drawSize(): Vector2 {
        if (this.relativeSizeAxes === Axes.none) {
            return this.size;
        }

        return this.convertRelativePosition(this.relativeSizeAxes, this.size);
    }

    /**
     * The absolute size of the parent of this `Drawable`.
     */
    protected get parentSize(): Vector2 {
        if (this.parent) {
            return this.parent.drawSize;
        }

        if (this.canvas) {
            return new Vector2(this.canvas.width, this.canvas.height);
        }

        return new Vector2(0);
    }

    //#endregion

    //#region Relative and Absolute Position Conversions

    /**
     * Converts a relative position to an absolute position in the parent's coordinate system.
     *
     * @param axes The axes that are relative.
     * @param position The relative position to convert.
     */
    protected convertRelativePosition(axes: Axes, position: Vector2): Vector2 {
        const { parentSize } = this;

        if (parentSize.length === 0) {
            return new Vector2(0);
        }

        if (axes === Axes.none) {
            return position;
        }

        return new Vector2(
            axes & Axes.x ? position.x * parentSize.x : position.x,
            axes & Axes.y ? position.y * parentSize.y : position.y,
        );
    }

    /**
     * Converts an absolute position to a relative position in the parent's coordinate system.
     *
     * @param axes The axes that are relative.
     * @param position The absolute position to convert.
     */
    protected convertAbsolutePosition(axes: Axes, position: Vector2): Vector2 {
        const { parentSize } = this;

        if (parentSize.length === 0) {
            return new Vector2(0);
        }

        if (axes === Axes.none) {
            return position;
        }

        return new Vector2(
            axes & Axes.x ? position.x / parentSize.x : position.x,
            axes & Axes.y ? position.y / parentSize.y : position.y,
        );
    }

    /**
     * Converts a coordinate from relative size (with respect to the parent's coordinate system) to absolute
     * size or vice versa, depending on the change in axes.
     *
     * @param oldRelativeAxes The axes that were relative.
     * @param newRelativeAxes The axes that are relative.
     * @param coordinate The coordinate to convert.
     * @returns The converted coordinate.
     */
    private convertCoordinatesFromAxesChange(
        oldRelativeAxes: Axes,
        newRelativeAxes: Axes,
        coordinate: Vector2,
    ): Vector2 {
        const { parentSize } = this;
        const newCoordinate = new Vector2(coordinate.x, coordinate.y);

        if (oldRelativeAxes & Axes.x && !(newRelativeAxes & Axes.x)) {
            newCoordinate.x *= parentSize.x;
        } else if (!(oldRelativeAxes & Axes.x) && newRelativeAxes & Axes.x) {
            newCoordinate.x =
                parentSize.x === 0 ? 0 : newCoordinate.x / parentSize.x;
        }

        if (oldRelativeAxes & Axes.y && !(newRelativeAxes & Axes.y)) {
            newCoordinate.y *= parentSize.y;
        } else if (!(oldRelativeAxes & Axes.y) && newRelativeAxes & Axes.y) {
            newCoordinate.y =
                parentSize.y === 0 ? 0 : newCoordinate.y / parentSize.y;
        }

        return newCoordinate;
    }

    //#region Color and Alpha

    private _color = new RGBColor(0, 0, 0);

    /**
     * The color of this `Drawable`.
     */
    get color(): RGBColor {
        return this._color;
    }

    set color(value: RGBColor) {
        this._color = value;
    }

    private _alpha = 1;

    /**
     * The alpha of this `Drawable`.
     */
    get alpha(): number {
        return this._alpha;
    }

    set alpha(value: number) {
        this._alpha = value;
    }

    /**
     * Whether this `Drawable` is present when drawn.
     */
    get isPresent(): boolean {
        return this.alpha > 0;
    }

    //#endregion

    //#region Anchor and Origin

    private _origin = Anchor.topLeft;

    /**
     * The origin of this `Drawable`.
     */
    get origin(): Anchor {
        return this._origin;
    }

    set origin(value: Anchor) {
        if (this._origin === value) {
            return;
        }

        this._origin = value;
        this.parent?.invalidateSize();
    }

    /**
     * The offset that is applied to this `Drawable`'s position according to its origin.
     */
    protected get originOffset(): Vector2 {
        // When considering origin, we must also consider the scale of the Drawable
        // so that the origin is scaled correctly.
        return this.drawSize
            .multiply(convertAnchor(this.origin))
            .multiply(this.scale.scale(-1));
    }

    private _anchor = Anchor.topLeft;

    /**
     * Specifies where the origin of this `Drawable` is attached to the parent in the coordinate system with origin in
     * the top-left corner of the parent's coordinate system.
     */
    get anchor(): Anchor {
        return this._anchor;
    }

    set anchor(value: Anchor) {
        this._anchor = value;
    }

    /**
     * The offset that is applied to this `Drawable`'s position according to its anchor relative to its parent.
     */
    protected get anchorOffset(): Vector2 {
        return this.parentSize.multiply(convertAnchor(this.anchor));
    }

    //#endregion

    //#region Scale and Rotation

    private _scale = new Vector2(1);

    /**
     * The scale of this `Drawable`.
     */
    get scale(): Vector2 {
        return this._scale;
    }

    set scale(value: number | Vector2) {
        value = value instanceof Vector2 ? value : new Vector2(value);

        if (this._scale.equals(value)) {
            return;
        }

        this._scale = value;
        this.parent?.invalidateSize();
    }

    private _rotation = 0;

    /**
     * The rotation of this `Drawable` with respect to its origin, in radians.
     */
    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        this._rotation = value;
    }

    //#endregion

    //#region Parent and Children

    /**
     * The `Container` of this `Drawable`.
     */
    parent: Container | null = null;

    /**
     * Whether this `Drawable` is attached to its parent.
     */
    get isAttached() {
        return this.parent !== null;
    }

    /**
     * Called when this `Drawable` is attached to a `Container`.
     *
     * @param parent The `Container` that this `Drawable` is attached to.
     */
    onAttached(parent: Container) {
        if (this.parent) {
            throw new Error("Drawable is already attached to a parent.");
        }

        this.parent = parent;
        this.detachCanvas();

        if (parent.canvas) {
            this.attachCanvas(parent.canvas);
        }
    }

    /**
     * Called when this `Drawable` is detached from a `Container`.
     */
    onDetached() {
        if (!this.parent) {
            throw new Error("Drawable is not attached to a parent.");
        }

        this.parent = null;
        this.detachCanvas();
    }

    //#endregion

    //#region Timekeeping

    /**
     * The clock that is used to provide the timing for this object's `Transform`s.
     */
    readonly clock = new Clock();

    override get currentTime(): number {
        return this.clock.currentTime;
    }

    private _lifetimeStart = Number.MIN_SAFE_INTEGER;

    /**
     * The time at which this `Drawable` becomes valid (and should be considered for drawing).
     */
    get lifetimeStart(): number {
        return this._lifetimeStart;
    }

    set lifetimeStart(value: number) {
        this._lifetimeStart = value;
    }

    private _lifetimeEnd = Number.MAX_SAFE_INTEGER;

    /**
     * The time at which this `Drawable` becomes invalid (and should not be considered for drawing).
     */
    get lifetimeEnd(): number {
        return this._lifetimeEnd;
    }

    set lifetimeEnd(value: number) {
        this._lifetimeEnd = value;
    }

    /**
     * Whether this `Drawable` should currently be alive.
     */
    get shouldBeAlive(): boolean {
        return (
            this.currentTime >= this.lifetimeStart &&
            this.currentTime < this.lifetimeEnd
        );
    }

    //#endregion

    //#region Transforms

    /**
     * Makes this `Drawable` invalid for drawing up after all `Transform`s have finished playing.
     *
     * @param calculateLifetimeStart Whether to calculate the lifetime start of this `Drawable`.
     */
    expire(calculateLifetimeStart = false) {
        this.lifetimeEnd = this.latestTransformEndTime;

        if (calculateLifetimeStart) {
            let min = Number.MAX_SAFE_INTEGER;

            for (const tracker of this.transformTrackers.values()) {
                for (const transform of tracker.transforms) {
                    min = Math.min(min, transform.startTime);
                }
            }

            this.lifetimeStart =
                min < Number.MAX_SAFE_INTEGER ? min : Number.MIN_SAFE_INTEGER;
        }
    }

    protected override createTransformSequence(): DrawableTransformSequence {
        return new DrawableTransformSequence(this);
    }

    fadeIn(duration?: number, easing?: Easing): DrawableTransformSequence {
        return this.fadeTo(1, duration, easing);
    }

    fadeInFromZero(
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().fadeInFromZero(duration, easing);
    }

    fadeOut(duration?: number, easing?: Easing): DrawableTransformSequence {
        return this.fadeTo(0, duration, easing);
    }

    fadeOutFromOne(
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().fadeOutFromOne(duration, easing);
    }

    fadeTo(
        alpha: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().fadeTo(alpha, duration, easing);
    }

    hide(): DrawableTransformSequence {
        return this.fadeOut();
    }

    show(): DrawableTransformSequence {
        return this.fadeIn();
    }

    rotateTo(
        rotation: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().rotateTo(
            rotation,
            duration,
            easing,
        );
    }

    scaleTo(
        scale: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().scaleTo(scale, duration, easing);
    }

    resizeTo(
        size: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().resizeTo(size, duration, easing);
    }

    resizeWidthTo(
        width: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().resizeWidthTo(
            width,
            duration,
            easing,
        );
    }

    resizeHeightTo(
        height: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().resizeHeightTo(
            height,
            duration,
            easing,
        );
    }

    moveTo(
        position: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().moveTo(
            position,
            duration,
            easing,
        );
    }

    moveToX(
        x: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().moveToX(x, duration, easing);
    }

    moveToY(
        y: number,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().moveToY(y, duration, easing);
    }

    moveToOffset(
        offset: number | Vector2,
        duration?: number,
        easing?: Easing,
    ): DrawableTransformSequence {
        return this.createTransformSequence().moveToOffset(
            offset,
            duration,
            easing,
        );
    }

    //#region Update and Drawing

    private _clipToBounds = true;

    /**
     * Whether the area of this `Drawable` should be clipped when drawing.
     *
     * Clipping prevents the `Drawable` from being drawn outside of its bounds.
     */
    get clipToBounds(): boolean {
        return this._clipToBounds;
    }

    set clipToBounds(value: boolean) {
        this._clipToBounds = value;
    }

    /**
     * The {@link HTMLCanvasElement} that this `Drawable` draws to.
     *
     * When `null`, this `Drawable` will not be drawn.
     */
    protected canvas: HTMLCanvasElement | null = null;

    /**
     * The canvas context of this `Drawable`.
     */
    protected get ctx(): CanvasRenderingContext2D | null {
        return this.canvas?.getContext("2d") ?? null;
    }

    /**
     * The top-left bound of this `Drawable` in the parent's coordinate system.
     *
     * Used for clipping the canvas context to prevent this `Drawable` from being drawn outside of its bounds.
     */
    get topLeftBound(): Vector2 {
        return new Vector2(0);
    }

    /**
     * The bottom-right bound of this `Drawable` in the parent's coordinate system.
     *
     * Used for clipping the canvas context to prevent this `Drawable` from being drawn outside of its bounds.
     */
    get bottomRightBound(): Vector2 {
        return this.drawSize;
    }

    /**
     * Attaches this `Drawable` to a canvas.
     *
     * @param canvas The canvas to attach to.
     */
    attachCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    /**
     * Detaches this `Drawable` from its canvas.
     */
    detachCanvas() {
        this.canvas = null;
    }

    /**
     * Updates this `Drawable`'s state with respect to the given time.
     *
     * @param time The time in milliseconds.
     */
    update(time: number) {
        this.clock.update(time);

        this.updateTransforms();
    }

    /**
     * Draws this `Drawable` to the canvas.
     */
    draw() {
        if (!this.shouldBeAlive) {
            return;
        }

        const { ctx } = this;

        if (!ctx) {
            return;
        }

        // Nothing to draw here - just return.
        if (this.drawSize.length === 0 || this.alpha === 0) {
            return;
        }

        ctx.save();

        // Ensure that all paths are reset.
        // Apparently this also needs to be called to prevent "old artifacts" from remaining on the canvas.
        // See https://stackoverflow.com/a/23011862.
        ctx.beginPath();

        this.applyCanvasConfigurations();
        this.onDraw();

        ctx.closePath();
        ctx.restore();
    }

    /**
     * Called when this `Drawable` should be drawn to the canvas.
     *
     * When this is called, the canvas context will have been transformed with respect to the position,
     * size, anchor, and origin of this `Drawable`, and all `Transform`s will have been applied.
     */
    protected abstract onDraw(): void;

    /**
     * Applies configurations to the canvas context of this `Drawable`. Called before `onDraw`.
     *
     * Inheritors can override this method to apply additional configurations.
     */
    protected applyCanvasConfigurations() {
        this.applyTransformations();
        this.applyColor();
    }

    /**
     * Applies transformations to the canvas context of this `Drawable`.
     */
    protected applyTransformations() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        const { drawPosition, anchorOffset, originOffset } = this;
        const finalPosition = drawPosition.add(anchorOffset).add(originOffset);

        if (this.rotation !== 0) {
            // Rotate around the origin of the Drawable.
            ctx.translate(
                finalPosition.x - originOffset.x,
                finalPosition.y - originOffset.y,
            );

            ctx.rotate(this.rotation);
            ctx.translate(originOffset.x, originOffset.y);
        } else {
            ctx.translate(finalPosition.x, finalPosition.y);
        }

        ctx.scale(this.scale.x, this.scale.y);

        // Clip the canvas so that the Drawable is not drawn outside of its bounds.
        if (this.clipToBounds) {
            const { topLeftBound, bottomRightBound } = this;

            ctx.rect(
                topLeftBound.x,
                topLeftBound.y,
                bottomRightBound.x,
                bottomRightBound.y,
            );

            ctx.clip();
        }
    }

    /**
     * Applies color to the canvas context of this `Drawable`.
     */
    protected applyColor() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        const color = `rgb(${this.color.r.toString()},${this.color.g.toString()},${this.color.b.toString()})`;

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.globalAlpha *= this.alpha;
    }

    //#endregion
}
