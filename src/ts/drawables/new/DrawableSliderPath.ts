import { VertexPath } from "../../framework/drawables/VertexPath";
import { DrawableSlider } from "./DrawableSlider";

/**
 * Represents a slider's path.
 */
export class DrawableSliderPath extends VertexPath {
    private get borderWidth(): number {
        return this.width / 8;
    }

    /**
     * Applies a `DrawableSlider` to this `DrawableSliderPath`.
     *
     * @param drawableSlider The `DrawableSlider` to apply.
     */
    applySlider(drawableSlider: DrawableSlider) {
        const { baseObject: slider } = drawableSlider;

        if (!slider) {
            return;
        }

        this.color = drawableSlider.color;
        this.alpha = 0;
        this.width = slider.radius * 2;

        this.removeAllVertices();
        this.addVertices(...slider.path.controlPoints);
    }

    protected override onDraw() {
        this.drawBody();
        this.drawBorder();
    }

    private drawBody() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.save();

        ctx.lineWidth = this.width - this.borderWidth;
        ctx.stroke();

        ctx.restore();
    }

    private drawBorder() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.save();

        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.restore();
    }
}
