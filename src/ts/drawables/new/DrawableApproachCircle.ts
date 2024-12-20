import { Anchor } from "@rian8337/osu-base";
import { HollowCircle } from "../../framework/drawables/HollowCircle";

/**
 * Represents an approach circle.
 */
export class DrawableApproachCircle extends HollowCircle {
    constructor() {
        super();

        this.origin = Anchor.center;
        this.anchor = Anchor.center;
        this.alpha = 0;
        this.scale = 3;
    }
}
