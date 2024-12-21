import { SortedArray } from "../utils/SortedArray";
import { Transform } from "./Transform";

/**
 * Tracks the lifetime of `Transform`s for one specified target member.
 */
export class TargetGroupingTransformTracker {
    private readonly _transforms = new SortedArray<Transform>(
        (a, b) => a.startTime - b.startTime,
    );

    /**
     * A list of `Transform`s applied to this target member.
     */
    get transforms(): readonly Transform[] {
        return this._transforms.array;
    }

    /**
     * The target member this `TargetGroupingTransformTracker` is tracking.
     */
    readonly targetMember: string;

    private lastAppliedTime = 0;
    private lastAppliedTransformIndex = 0;

    constructor(targetMember: string) {
        this.targetMember = targetMember;
    }

    /**
     * Adds a `Transform` to this `TargetGroupingTransformTracker`.
     *
     * @param transform The `Transform` to add.
     */
    addTransform(transform: Transform) {
        // Remove any transforms that start at the same time as the new transform.
        for (let i = 0; i < this._transforms.length; i++) {
            const t = this._transforms.get(i);

            if (t.startTime < transform.startTime) {
                continue;
            }

            if (t.startTime > transform.startTime) {
                break;
            }

            this._transforms.removeAt(i--);
        }

        this._transforms.add(transform);

        this.lastAppliedTransformIndex = 0;
    }

    /**
     * Updates the `Transform`s in this `TargetGroupingTransformTracker` in the given time.
     *
     * @param time The time in milliseconds.
     */
    updateTransforms(time: number) {
        if (time < this.lastAppliedTime) {
            // We are rewinding.
            let newIndex = Math.min(
                this.lastAppliedTransformIndex,
                this._transforms.length - 1,
            );

            for (; newIndex >= 0; --newIndex) {
                const t = this._transforms.get(newIndex);

                if (time < t.startTime) {
                    break;
                }

                t.apply(time);
            }

            this.lastAppliedTransformIndex = newIndex;
        }

        for (
            let i = this.lastAppliedTransformIndex;
            i < this._transforms.length;
            ++i
        ) {
            const t = this._transforms.get(i);

            if (time < t.startTime) {
                break;
            }

            if (!t.isApplied && this.lastAppliedTransformIndex > 0) {
                // This is the first time that the transform is being applied.
                // Ensure the previously active transform is properly applied.
                const u = this._transforms.get(
                    this.lastAppliedTransformIndex - 1,
                );

                if (!u.hasFinished) {
                    // We may have applied the previously active transform too far into the future.
                    // We want to prepare to potentially read into the newly activated transform's start time,
                    // so we should re-apply using its start time as a basis.
                    u.apply(t.startTime);
                }
            }

            t.apply(time);

            if (t.hasFinished) {
                this.lastAppliedTransformIndex = i + 1;
            }
        }

        this.lastAppliedTime = time;
    }

    /**
     * Removes `Transform`s that start after a certain time.
     *
     * @param time The time in milliseconds.
     */
    clearTransformsAfter(time: number) {
        for (let i = 0; i < this._transforms.length; i++) {
            if (this._transforms.get(i).startTime >= time) {
                this._transforms.removeAt(i--);
                this.lastAppliedTransformIndex = 0;
            }
        }
    }

    [Symbol.iterator]() {
        return this._transforms[Symbol.iterator]();
    }
}
