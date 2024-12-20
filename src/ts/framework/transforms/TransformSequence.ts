import { Easing } from "@rian8337/osu-base";
import { ITransformable } from "./ITransformable";
import { Transform } from "./Transform";
import { TransformApplicator } from "./TransformApplicator";
import { TransformPropertyGetter } from "./TransformPropertyGetter";

/**
 * Utility to create a sequence of `Transform`s.
 *
 * @template TTarget The type of the `ITransformable` to transform.
 */
export class TransformSequence<
    TTarget extends ITransformable = ITransformable,
> {
    //#region Constructor and Properties

    /**
     * The `ITransformable` to transform.
     */
    protected readonly target: TTarget;

    private readonly startTime: number;
    private newTransformStartTime: number;
    private endTime: number;

    /**
     * The duration of this `TransformSequence` in milliseconds.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * Creates a new `TransformSequence`.
     *
     * @param target The `ITransformable` to transform.
     */
    constructor(target: TTarget) {
        this.target = target;
        this.startTime = target.currentTime;
        this.endTime = this.startTime;
        this.newTransformStartTime = this.startTime;
    }

    //#endregion

    //#region Delay

    /**
     * Advances the start time of future `Transform`s by a certain delay.
     *
     * @param delay The delay in milliseconds. Defaults to 0.
     * @returns A `TransformSequence` to which further `Transform`s can be added.
     */
    delay(delay = 0): this {
        this.newTransformStartTime += delay;

        return this;
    }

    /**
     * Advances the start time of future `Transform`s added to this `TransformSequence` to the latest end time
     * of all `Transform`s in this `TransformSequence` plus a certain delay.
     *
     * @param delay The delay in milliseconds. Defaults to 0.
     * @returns A `TransformSequence` to which further `Transform`s can be added.
     */
    then(delay = 0): this {
        this.newTransformStartTime = this.endTime;

        return this.delay(delay);
    }

    //#endregion

    /**
     * Adds a `Transform` to the targeted `ITransformable`.
     *
     * @param targetMember The member of the target to transform.
     * @param duration The duration of the `Transform` in milliseconds.
     * @param easing The easing function to use for the `Transform`.
     * @param startValueGetter A function that gets the value to start the `Transform` from.
     * @param onUpdate A function that applies the `Transform`.
     *
     * @template TValue The type of the value to transform.
     */
    protected addTransform<TValue>(
        targetMember: string,
        duration: number,
        easing: Easing,
        startValueGetter: TransformPropertyGetter<TValue>,
        onUpdate: TransformApplicator<TValue>,
    ) {
        const transform = new Transform(
            targetMember,
            this.newTransformStartTime,
            duration,
            startValueGetter,
            onUpdate,
            easing,
        );

        this.target.addTransform(transform);

        this.endTime = Math.max(
            this.endTime,
            transform.startTime + transform.duration,
        );
    }
}
