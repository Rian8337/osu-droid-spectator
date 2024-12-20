import { Vector2 } from "@rian8337/osu-base";
import { Axes } from "./Axes";
import { Drawable } from "./Drawable";

/**
 * A `Drawable` that can contain multiple `Drawable`s. Can be used to apply transformations
 * to multiple `Drawable`s at once.
 *
 * The `Drawable`s are drawn in the order they were added to the `Container`. That is,
 * the first `Drawable` added is drawn first, and the last `Drawable` added is drawn last.
 */
export class Container extends Drawable {
    private readonly children: Drawable[] = [];
    private isSizeValid = false;

    override get size(): Vector2 {
        if (!this.isSizeValid) {
            this.isSizeValid = this.updateSize();
        }

        return super.size;
    }

    override set size(value: number | Vector2) {
        super.size = value;
    }

    private _autoSizeAxes = Axes.none;

    /**
     * Controls which axes are automatically sized with respect to the children of this `Container`.
     *
     * The axis of childrens that are relatively sized are ignored for automatic sizing. Most notably,
     * `relativeSizeAxes` of children do not affect automatic sizing to avoid circular size dependencies.
     *
     * When setting the size of this `Container`'s size on any axes that are automatically sized, it will
     * be automatically overridden in the next update cycle.
     */
    get autoSizeAxes(): Axes {
        return this._autoSizeAxes;
    }

    set autoSizeAxes(value: Axes) {
        if (this._autoSizeAxes === value) {
            return;
        }

        if (this.relativeSizeAxes & value) {
            throw new Error(
                "No axis can be relatively sized and automatically sized at the same time.",
            );
        }

        this._autoSizeAxes = value;
    }

    /**
     * Adds a `Drawable` to this `Container`.
     *
     * @param child The `Drawable` to add.
     * @param index The index to add the `Drawable` at. Defaults to the end of the list.
     */
    add(child: Drawable, index = this.children.length) {
        if (child === this) {
            throw new Error("Cannot add a `Container` to itself.");
        }

        if (index < 0 || index > this.children.length) {
            throw new RangeError("Index out of bounds.");
        }

        if (this.children.includes(child)) {
            return;
        }

        this.children.splice(index, 0, child);

        child.onAttached(this);
    }

    /**
     * Adds multiple `Drawable`s to this `Container`.
     *
     * @param children The `Drawable`s to add.
     */
    addAll(...children: Drawable[]) {
        for (const child of children) {
            this.add(child);
        }
    }

    /**
     * Removes a `Drawable` from this `Container`.
     *
     * @param child The `Drawable` to remove.
     */
    remove(child: Drawable) {
        const index = this.children.indexOf(child);

        if (index === -1) {
            return;
        }

        this.children.splice(index, 1);

        child.onDetached();
    }

    /**
     * Removes all children from this `Container`.
     */
    removeAll() {
        for (const child of this.children) {
            this.remove(child);
        }
    }

    /**
     * Invalidates the size of this `Container`.
     */
    invalidateSize() {
        this.isSizeValid = false;
    }

    override attachCanvas(canvas: HTMLCanvasElement) {
        super.attachCanvas(canvas);

        for (const child of this.children) {
            child.attachCanvas(canvas);
        }
    }

    override detachCanvas() {
        super.detachCanvas();

        for (const child of this.children) {
            child.detachCanvas();
        }
    }

    override applyTransformsAt(time: number) {
        super.applyTransformsAt(time);

        for (const child of this.children) {
            child.applyTransformsAt(time);
        }
    }

    override clearTransformsAfter(time: number) {
        super.clearTransformsAfter(time);

        for (const child of this.children) {
            child.clearTransformsAfter(time);
        }
    }

    override update(time: number) {
        super.update(time);

        for (const child of this.children) {
            child.update(time);
        }
    }

    protected override onDraw() {
        if (!this.ctx) {
            return;
        }

        for (const child of this.children) {
            child.draw();
        }
    }

    private updateSize(): boolean {
        if (this.autoSizeAxes === Axes.none) {
            return true;
        }

        const newSize = new Vector2(0);

        for (const child of this.children) {
            if (child.relativeSizeAxes === Axes.both) {
                continue;
            }

            const bound = child.bottomRightBound
                .subtract(child.topLeftBound)
                .multiply(child.scale);

            if (!(child.relativeSizeAxes & Axes.x)) {
                newSize.x = Math.max(newSize.x, bound.x);
            }

            if (!(child.relativeSizeAxes & Axes.y)) {
                newSize.y = Math.max(newSize.y, bound.y);
            }
        }

        if (!(this.autoSizeAxes & Axes.x)) {
            newSize.x = this.size.x;
        }

        if (!(this.autoSizeAxes & Axes.y)) {
            newSize.y = this.size.y;
        }

        this.size = newSize;

        return true;
    }
}
