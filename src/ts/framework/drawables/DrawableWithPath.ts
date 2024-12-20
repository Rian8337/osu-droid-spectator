import { Drawable } from "./Drawable";

/**
 * A `Drawable` that has a drawing path.
 */
export abstract class DrawableWithPath extends Drawable {
    override update(time: number) {
        super.update(time);

        // Ensure the path is reset.
        this.ctx?.closePath();
    }

    protected override applyCanvasConfigurations() {
        super.applyCanvasConfigurations();

        this.preparePath();
    }

    /**
     * Prepares the path of this `DrawableWithPath`.
     */
    protected abstract preparePath(): void;
}
