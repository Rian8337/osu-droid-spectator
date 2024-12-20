import { Transform } from "./Transform";

/**
 * An interface for objects that can have `Transform`s applied to them.
 */
export interface ITransformable {
    /**
     * The current frame's time as observed by this class' `Transform`s, in milliseconds.
     */
    get currentTime(): number;

    /**
     * Adds a `Transform` to this `ITransformable`.
     *
     * @param transform The `Transform` to add.
     */
    addTransform(transform: Transform): void;
}
