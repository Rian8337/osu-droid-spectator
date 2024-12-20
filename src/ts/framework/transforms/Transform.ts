import { Easing } from "@rian8337/osu-base";
import { TransformApplicator } from "./TransformApplicator";
import { TransformPropertyGetter } from "./TransformPropertyGetter";
import { interpolateEasing } from "./EasingInterpolator";

/**
 * Takes an `ITransformable` and adjusts its properties over a period of time.
 *
 * @template TValue The type of the value to transform.
 */
export class Transform<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TValue = any,
> {
    /**
     * The member of the target object to transform.
     */
    readonly targetMember: string;

    /**
     * The time at which this `Transform` should start with respect to the `ITransformable`'s observed time.
     */
    readonly startTime: number;

    /**
     * The duration of the transformation in milliseconds.
     */
    readonly duration: number;

    /**
     * The easing function to use for the transformation.
     */
    readonly easing: Easing;

    private readonly startValueGetter: TransformPropertyGetter<TValue>;
    private readonly onUpdate: TransformApplicator<TValue>;

    private startValue: TValue | null = null;
    private lastAppliedProgress = 0;

    /**
     * Whether this `Transform` has been applied.
     */
    get isApplied(): boolean {
        return this.lastAppliedProgress > 0;
    }

    /**
     * Whether this `Transform` has finished.
     */
    get hasFinished(): boolean {
        return this.lastAppliedProgress >= 1;
    }

    /**
     * Creates a new `Transform`.
     *
     * @param targetMember The member of the target object to transform.
     * @param startTime The time at which this `Transform` should start with respect to the `ITransformable`'s observed time.
     * @param duration The duration of the transformation in milliseconds.
     * @param startValueGetter A function that gets the value to start the transformation from.
     * @param onUpdate A function that applies the transformation.
     * @param easing The easing function to use for the transformation.
     */
    constructor(
        targetMember: string,
        startTime: number,
        duration: number,
        startValueGetter: TransformPropertyGetter<TValue>,
        onUpdate: TransformApplicator<TValue>,
        easing = Easing.none,
    ) {
        this.targetMember = targetMember;
        this.startTime = startTime;
        this.duration = duration;
        this.startValueGetter = startValueGetter;
        this.onUpdate = onUpdate;
        this.easing = easing;
    }

    /**
     * Applies this `Transform` based on the current time.
     */
    apply(time: number) {
        const t = Math.max(
            0,
            Math.min((time - this.startTime) / this.duration, 1),
        );

        // Only update when necessary.
        if (t === this.lastAppliedProgress) {
            return;
        }

        this.startValue ??= this.startValueGetter();
        this.lastAppliedProgress = t;

        this.onUpdate(this.startValue, interpolateEasing(this.easing, t));
    }
}
