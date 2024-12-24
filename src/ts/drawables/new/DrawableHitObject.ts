import {
    Anchor,
    HitObject,
    Modes,
    RGBColor,
    Vector2,
} from "@rian8337/osu-base";
import { Container } from "../../framework/drawables/Container";
import { Axes } from "../../framework/drawables/Axes";
import { ArmedState } from "./ArmedState";
import { SpectatorObjectData } from "../../spectator/rawdata/SpectatorObjectData";

/**
 * Represents a hitobject that can be drawn.
 *
 * @template THitObject The type of the underlying hitobject.
 */
// TODO: pooling
export abstract class DrawableHitObject<
    THitObject extends HitObject = HitObject,
> extends Container {
    /**
     * The underlying hitobject.
     */
    baseObject: THitObject | null = null;

    /**
     * The stacked position of the object.
     */
    get stackedPosition(): Vector2 {
        return (
            this.baseObject?.getStackedPosition(Modes.droid) ?? new Vector2(0)
        );
    }

    /**
     * The stacked end position of the object.
     */
    get stackedEndPosition(): Vector2 {
        return (
            this.baseObject?.getStackedEndPosition(Modes.droid) ??
            new Vector2(0)
        );
    }

    private _comboColor = new RGBColor(0, 0, 0);

    /**
     * The combo color of the object.
     */
    get comboColor(): RGBColor {
        return this._comboColor;
    }

    set comboColor(value: RGBColor) {
        this._comboColor = value;
    }

    private _state = ArmedState.idle;

    /**
     * The state of this `DrawableHitObject`.
     */
    get state(): ArmedState {
        return this._state;
    }

    protected set state(value: ArmedState) {
        this._state = value;

        this.updateState(value, true);
    }

    /**
     * The nested hitobjects of this `DrawableHitObject`.
     */
    protected readonly nestedHitObjects: DrawableHitObject[] = [];

    protected hitStateUpdateTime = 0;

    constructor() {
        super();

        this.autoSizeAxes = Axes.both;
        this.origin = Anchor.center;
    }

    /**
     * Applies a `HitObject` to this `DrawableHitObject`.
     *
     * Deriving classes should override `applyHitObjectInternal` to apply the `HitObject`
     * rather than this method.
     *
     * @param hitObject The `HitObject` to apply.
     * @param hitWindow The `HitWindow` to apply.
     */
    applyHitObject(hitObject: THitObject) {
        this.applyHitObjectInternal(hitObject);
        this.updateState(ArmedState.idle, true);
    }

    /**
     * Applies spectator data to this `DrawableHitObject`.
     *
     * Deriving classes should override `applySpectatorDataInternal` to apply the spectator data
     * rather than this method.
     *
     * @param data The spectator data to apply.
     */
    applySpectatorData(data: SpectatorObjectData) {
        this.applySpectatorDataInternal(data);

        for (const nestedHitObject of this.nestedHitObjects) {
            nestedHitObject.applySpectatorData(data);
        }
    }

    /**
     * Applies spectator data to this `DrawableHitObject`.
     *
     * @param data The spectator data to apply.
     */
    protected abstract applySpectatorDataInternal(
        data: SpectatorObjectData,
    ): void;

    /**
     * Applies a `HitObject` to this `DrawableHitObject`.
     *
     * @param hitObject The `HitObject` to apply.
     */
    protected applyHitObjectInternal(hitObject: THitObject) {
        this.baseObject = hitObject;
        this.position = this.stackedPosition;
        this.hitStateUpdateTime = hitObject.endTime;
    }

    /**
     * Updates the state of this `DrawableHitObject`.
     *
     * @param state The new state.
     * @param force Whether to force the state update.
     */
    protected updateState(state: ArmedState, force: boolean) {
        if (!this.baseObject) {
            return;
        }

        if (this.state === state && !force) {
            return;
        }

        // Clear existing state transforms.
        this.reset();

        this.updateInitialTransforms(
            this.baseObject.startTime - this.baseObject.timePreempt,
        );

        this.updateStartTimeTransforms(this.baseObject.startTime);
        this.updateHitStateTransforms(this.hitStateUpdateTime, state);

        this._state = state;
    }

    /**
     * Applies (generally fade-in) `Transform`s leading into the `HitObject` start time. By default,
     * this will fade in the object from zero with no duration.
     *
     * @param transformStartTime The time at which the initial transforms should start.
     */
    protected updateInitialTransforms(transformStartTime: number) {
        if (!this.baseObject) {
            return;
        }

        this.beginAbsoluteSequence(transformStartTime).fadeInFromZero();
    }

    /**
     * Applies passive `Transform`s at the `HitObject`'s start time. This is called each time the state
     * of this `DrawableHitObject` changes.
     *
     * @param transformStartTime The time at which the start time transforms should start.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    protected updateStartTimeTransforms(transformStartTime: number) {}

    /**
     * Applies `Transform`s based on the current `ArmedState` of this `DrawableHitObject`.
     *
     * @param transformStartTime The time at which the hit state transforms should start.
     * @param newState The new `ArmedState` of this `DrawableHitObject.
     */
    protected updateHitStateTransforms(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        transformStartTime: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        newState: ArmedState,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) {}

    /**
     * Resets this `DrawableHitObject` and its nested `DrawableHitObject`s to its initial state.
     *
     * Called when applying a new `HitObject` before the old `HitObject` is overwritten.
     */
    protected reset() {
        this.alpha = 0;

        this.clearTransforms();

        for (const nestedHitObject of this.nestedHitObjects) {
            nestedHitObject.reset();
        }
    }
}
