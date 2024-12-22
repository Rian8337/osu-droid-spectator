import { Vector2 } from "@rian8337/osu-base";
import { Drawable } from "./Drawable";
import { Stringable } from "./Stringable";

/**
 * Represents text.
 */
export class Text extends Drawable {
    private _text = "";

    /**
     * The text of this `Text`.
     */
    get text(): string {
        return this._text;
    }

    set text(value: Stringable) {
        this._text = value.toString();
        this.isSizeValid = false;
    }

    private _fontSize = 1;

    /**
     * The font size of this `Text` in `em`.
     */
    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(value: number) {
        this._fontSize = value;
        this.isSizeValid = false;
    }

    private _bold = false;

    /**
     * Whether this `Text` is bold.
     */
    get bold(): boolean {
        return this._bold;
    }

    set bold(value: boolean) {
        this._bold = value;
        this.isSizeValid = false;
    }

    override get size(): Vector2 {
        if (!this.isSizeValid) {
            this.isSizeValid = this.updateSize();
        }

        return super.size;
    }

    override set size(value: number | Vector2) {
        super.size = value;
    }

    private isSizeValid = false;

    protected override applyCanvasConfigurations() {
        super.applyCanvasConfigurations();

        this.applyTextStyles();
    }

    protected override onDraw() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.fillText(this.text, 0, 0);
    }

    private updateSize(): boolean {
        const { ctx } = this;

        if (!ctx) {
            return false;
        }

        // We need the text styles to be applied to measure the text.
        ctx.save();

        this.applyTextStyles();

        const metrics = ctx.measureText(this.text);

        this.size = new Vector2(
            metrics.width,
            Math.abs(metrics.actualBoundingBoxDescent) +
                Math.abs(metrics.actualBoundingBoxAscent),
        );

        ctx.restore();

        return true;
    }

    private applyTextStyles() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.font = `${this.fontSize.toString()}em sans-serif`;

        if (this.bold) {
            ctx.font = `bold ${ctx.font}`;
        }

        // Baseline can always be on top as anchor and origin adjustments will reposition the text.
        ctx.textBaseline = "top";
    }
}
