import { ITransformable } from "./ITransformable";
import { TargetGroupingTransformTracker } from "./TargetGroupingTransformTracker";
import { Transform } from "./Transform";
import { TransformSequence } from "./TransformSequence";

/**
 * A type of object which can have `Transform`s operating upon it.
 * Implementers of this class must call {@link updateTransforms} to update and apply `Transform`s.
 */
export abstract class Transformable<
    TTransformSequence extends TransformSequence = TransformSequence,
> implements ITransformable
{
    private readonly _transformTrackers = new Map<
        string,
        TargetGroupingTransformTracker
    >();

    /**
     * A map of `TargetGroupingTransformTracker`s for each target member.
     */
    protected get transformTrackers(): ReadonlyMap<
        string,
        TargetGroupingTransformTracker
    > {
        return this._transformTrackers;
    }

    abstract get currentTime(): number;

    /**
     * Starts a `TransformSequence` from an absolute time value.
     *
     * @param startTime The time in milliseconds to start the new `TransformSequence`.
     * @returns A `TransformSequence` to which further `Transform`s can be added.
     */
    beginAbsoluteSequence(startTime: number): TTransformSequence {
        // Delay the new sequence up until the start time.
        return this.delay(startTime - this.currentTime);
    }

    /**
     * Starts a `TransformSequence` with a delay applied.
     *
     * @param delay The delay in milliseconds from current time.
     * @returns A `TransformSequence` to which further `Transform`s can be added.
     */
    beginDelayedSequence(delay: number): TTransformSequence {
        return this.delay(delay);
    }

    /**
     * Advances the start time of future `Transform`s by a certain delay.
     *
     * @param delay The delay in milliseconds. Defaults to 0.
     * @returns A `TransformSequence` to which further `Transform`s can be added.
     */
    delay(delay = 0): TTransformSequence {
        return this.createTransformSequence().delay(delay);
    }

    addTransform(transform: Transform) {
        let tracker = this._transformTrackers.get(transform.targetMember);

        if (!tracker) {
            tracker = new TargetGroupingTransformTracker(
                transform.targetMember,
            );

            this._transformTrackers.set(transform.targetMember, tracker);
        }

        tracker.addTransform(transform);
    }

    /**
     * Applies `Transform`s at a point in time.
     *
     * This does not change the clock time.
     *
     * @param time The time in milliseconds.
     */
    applyTransformsAt(time: number) {
        this.updateTransforms(time);
    }

    /**
     * Removes `Transform`s that start after a certain time.
     *
     * @param time The time in milliseconds.
     */
    clearTransformsAfter(time: number) {
        for (const tracker of this._transformTrackers.values()) {
            tracker.clearTransformsAfter(time);
        }
    }

    /**
     * Removes all transforms from this `Transformable`.
     */
    clearTransforms() {
        this._transformTrackers.clear();
    }

    /**
     * Updates the `Transform`s in this `Transformable` in the given time.
     *
     * @param time The time in milliseconds. Defaults to the current time.
     */
    protected updateTransforms(time = this.currentTime) {
        for (const tracker of this._transformTrackers.values()) {
            tracker.updateTransforms(time);
        }
    }

    /**
     * Creates a new `TransformSequence` on this `Transformable`.
     */
    protected abstract createTransformSequence(): TTransformSequence;
}
