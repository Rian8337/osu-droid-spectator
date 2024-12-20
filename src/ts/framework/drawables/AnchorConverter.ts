import { Anchor, Vector2 } from "@rian8337/osu-base";

/**
 * The top left anchor.
 */
const topLeft = new Vector2(0);

/**
 * The top center anchor.
 */
const topCenter = new Vector2(0.5, 0);

/**
 * The top right anchor.
 */
const topRight = new Vector2(1, 0);

/**
 * The center left anchor.
 */
const centerLeft = new Vector2(0, 0.5);

/**
 * The center anchor.
 */
const center = new Vector2(0.5);

/**
 * The center right anchor.
 */
const centerRight = new Vector2(1, 0.5);

/**
 * The bottom left anchor.
 */
const bottomLeft = new Vector2(0, 1);

/**
 * The bottom center anchor.
 */
const bottomCenter = new Vector2(0.5, 1);

/**
 * The bottom right anchor.
 */
const bottomRight = new Vector2(1);

/**
 * Converts an `Anchor` to its `Vector2` counterpart.
 *
 * @param anchor The `Anchor` to convert.
 * @returns The `Vector2` counterpart of the `Anchor`.
 */
export function convertAnchor(anchor: Anchor): Vector2 {
    switch (anchor) {
        case Anchor.center:
            return center;

        case Anchor.centerLeft:
            return centerLeft;

        case Anchor.topRight:
            return topRight;

        case Anchor.bottomCenter:
            return bottomCenter;

        case Anchor.topCenter:
            return topCenter;

        case Anchor.centerRight:
            return centerRight;

        case Anchor.bottomLeft:
            return bottomLeft;

        case Anchor.bottomRight:
            return bottomRight;

        default:
            return topLeft;
    }
}
