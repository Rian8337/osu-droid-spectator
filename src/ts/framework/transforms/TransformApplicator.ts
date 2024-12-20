/**
 * A function that applies a transformation to an `ITransformable`.
 */
export type TransformApplicator<TValue> = (
    startValue: TValue,
    progress: number,
) => void;
