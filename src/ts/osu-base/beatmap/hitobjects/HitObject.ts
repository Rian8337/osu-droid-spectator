import { ObjectTypes } from "../../constants/ObjectTypes";
import { Vector2 } from "../../mathutil/Vector2";
import { HitSampleInfo } from "./HitSampleInfo";

/**
 * Represents a hitobject in a beatmap.
 */
export abstract class HitObject {
    /**
     * The base radius of all hitobjects.
     */
    static readonly baseRadius = 64;

    /**
     * The start time of the hitobject in milliseconds.
     */
    startTime: number;

    /**
     * The bitwise type of the hitobject (circle/slider/spinner).
     */
    readonly type: ObjectTypes;

    /**
     * The position of the hitobject in osu!pixels.
     */
    readonly position: Vector2;

    /**
     * The end position of the hitobject in osu!pixels.
     */
    readonly endPosition: Vector2;

    /**
     * The end time of the hitobject.
     */
    endTime: number;

    /**
     * The duration of the hitobject.
     */
    get duration(): number {
        return this.endTime - this.startTime;
    }

    /**
     * Whether this hit object represents a new combo.
     */
    readonly isNewCombo: boolean;

    /**
     * How many combo colors to skip, if this object starts a new combo.
     */
    readonly comboOffset: number;

    /**
     * The samples to be played when this hit object is hit.
     *
     * In the case of sliders, this is the sample of the curve body
     * and can be treated as the default samples for the hit object.
     */
    samples: HitSampleInfo[] = [];

    /**
     * The stack height of the hitobject.
     */
    protected _stackHeight = 0;

    /**
     * The stack height of the hitobject.
     */
    get stackHeight(): number {
        return this._stackHeight;
    }

    /**
     * The stack height of the hitobject.
     */
    set stackHeight(value: number) {
        this._stackHeight = value;
    }

    /**
     * The scale used to calculate stacked position and radius.
     */
    protected _scale = 1;

    /**
     * The scale used to calculate stacked position and radius.
     */
    get scale(): number {
        return this._scale;
    }

    /**
     * The scale used to calculate stacked position and radius.
     */
    set scale(value: number) {
        this._scale = value;
    }

    /**
     * The radius of the hitobject.
     */
    get radius(): number {
        return HitObject.baseRadius * this._scale;
    }

    /**
     * The stack offset of the hitobject.
     */
    get stackOffset(): Vector2 {
        const coordinate = this._stackHeight * this._scale * 4;

        return new Vector2(coordinate, coordinate);
    }

    /**
     * The stacked position of the hitobject.
     */
    get stackedPosition(): Vector2 {
        return this.position.add(this.stackOffset);
    }

    /**
     * The stacked end position of the hitobject.
     */
    get stackedEndPosition(): Vector2 {
        return this.endPosition.add(this.stackOffset);
    }

    constructor(values: {
        startTime: number;
        position: Vector2;
        newCombo?: boolean;
        comboOffset?: number;
        type?: number;
        endTime?: number;
        endPosition?: Vector2;
    }) {
        this.startTime = values.startTime;
        this.endTime = values.endTime ?? values.startTime;
        this.type = values.type ?? ObjectTypes.circle;
        this.position = values.position;
        this.endPosition = values.endPosition ?? this.position;
        this.isNewCombo = values.newCombo ?? false;
        this.comboOffset = values.comboOffset ?? 0;
    }

    /**
     * Returns the string representative of the class.
     */
    abstract toString(): string;
}
