import { Anchor, RGBColor } from "@rian8337/osu-base";
import { Axes } from "../../framework/drawables/Axes";
import { Container } from "../../framework/drawables/Container";
import { FilledCircle } from "../../framework/drawables/FilledCircle";
import { HollowCircle } from "../../framework/drawables/HollowCircle";

/**
 * Represents a circle piece.
 */
export class DrawableCirclePiece extends Container {
    private readonly circle = new FilledCircle();
    private readonly overlay = new HollowCircle();

    /**
     * The radius of this `DrawableCirclePiece`.
     */
    get radius(): number {
        return this.circle.radius;
    }

    set radius(value: number) {
        this.circle.radius = value;
        this.overlay.radius = value;
        this.overlay.borderThickness = value / 8;
    }

    override get color(): RGBColor {
        return this.circle.color;
    }

    override set color(value: RGBColor) {
        this.circle.color = value;
    }

    constructor() {
        super();

        this.autoSizeAxes = Axes.both;
        this.origin = Anchor.center;
        this.anchor = Anchor.center;

        this.circle.anchor = Anchor.center;
        this.circle.origin = Anchor.center;

        this.overlay.anchor = Anchor.center;
        this.overlay.origin = Anchor.center;
        this.overlay.color = new RGBColor(255, 255, 255);

        // Have the circle drawn first so that it does not overlap the overlay.
        this.addAll(this.circle, this.overlay);
    }
}
