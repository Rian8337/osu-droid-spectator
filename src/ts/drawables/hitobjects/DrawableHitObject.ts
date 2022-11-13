import {
    HitObject,
    IModApplicableToDroid,
    MapStats,
    Mod,
    Modes,
    ObjectTypes,
    RGBColor,
    Vector2,
} from "../../osu-base";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/rawdata/HitResult";

/**
 * Represents a hitobject that can be drawn.
 */
export abstract class DrawableHitObject {
    static readonly hitResultFadeIn = 150;
    static readonly hitResultFadeOutTime = 250;
    static readonly hitResultFadeOutStartTime = 500;

    /**
     * The underlying object.
     */
    readonly object: HitObject;

    /**
     * The mods applied to this object.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The duration at which the object fades in, in milliseconds.
     */
    protected abstract get fadeInTime(): number;

    /**
     * The duration at which the object fades out, in milliseconds.
     */
    protected abstract get fadeOutTime(): number;

    /**
     * The combo of the object.
     */
    combo = 1;

    /**
     * The color of the object.
     */
    color = new RGBColor(0, 202, 0);

    /**
     * The approach time of the object.
     *
     * This value is unaffected by speed-changing modifications.
     */
    approachTime = MapStats.arToMS(5);

    /**
     * The scale of the object.
     *
     * This is used to get radius.
     */
    scale = 0;

    /**
     * The radius of the object with mods applied.
     */
    get radius(): number {
        return (
            (this.object.getRadius(Modes.droid) / this.object.droidScale) *
            this.scale
        );
    }

    /**
     * The stacked position of the object with mods applied.
     */
    get stackedPosition(): Vector2 {
        return this.reevaluateStackedPosition(
            this.object.getStackedPosition(Modes.droid)
        );
    }

    /**
     * The stacked end position of the object with mods applied.
     */
    get stackedEndPosition(): Vector2 {
        return this.reevaluateStackedPosition(
            this.object.getStackedEndPosition(Modes.droid)
        );
    }

    /**
     * The thickness of the object's border.
     */
    protected get circleBorder(): number {
        return this.radius / 8;
    }

    /**
     * The shadow blur of the object.
     */
    protected get shadowBlur(): number {
        return this.radius / 16;
    }

    /**
     * The combo color in Canvas string format.
     */
    protected get canvasColor(): string {
        return `rgb(${this.color})`;
    }

    /**
     * Whether the object was hit.
     */
    isHit = false;

    constructor(object: HitObject, mods: (Mod & IModApplicableToDroid)[]) {
        this.object = object;
        this.mods = mods;
    }

    /**
     * Draws this hitobject at a given time.
     *
     * @param ctx The canvas context.
     * @param time The time.
     * @param hitData The hit data of the object.
     * @param maxHitWindow The maximum hit window. If this is a circle, failing to hit
     * this object beyond the maximum hit window will result in a miss.
     */
    abstract draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitData: SpectatorObjectDataEvent | null,
        maxHitWindow: number
    ): void;

    /**
     * Draws the hit result of this object at a given time.
     *
     * @param ctx The canvas context.
     * @param time The time.
     * @param position The position to draw the hit result on.
     * @param hitTime The time at which the object was hit.
     * @param hitResult The hit result of the object.
     */
    protected drawHitResult(
        ctx: CanvasRenderingContext2D,
        time: number,
        position: Vector2,
        hitTime: number,
        hitResult: HitResult
    ): void {
        const dt = time - hitTime;
        if (dt < 0) {
            return;
        }

        let opacity = 1;
        const fadeInTime = 150;
        const fadeOutTime = 250;
        const fadeOutStartTime = 500;

        if (dt <= fadeInTime) {
            // Consider fade in first.
            opacity = dt / fadeInTime;
        } else if (dt >= fadeOutStartTime) {
            // Then fade out.
            opacity = 1 - Math.min(1, (dt - fadeOutStartTime) / fadeOutTime);
        }

        if (opacity === 0) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = opacity;
        ctx.shadowBlur = this.shadowBlur;

        let text = "";

        // Colors are taken from osu!lazer (https://github.com/ppy/osu/blob/daae560ff731bdf49970a5bc6588c0861fac760f/osu.Game/Graphics/OsuColour.cs#L105-L131)
        switch (hitResult) {
            case HitResult.great:
                ctx.fillStyle = "#66ccff";
                text = "300";
                break;
            case HitResult.good:
                ctx.fillStyle = "#b3d944";
                text = "100";
                break;
            case HitResult.meh:
                ctx.fillStyle = "#ffcc22";
                text = "50";
                break;
            case HitResult.miss:
                ctx.fillStyle = "#ed1121";
                text = "❌";
                break;
        }

        ctx.translate(position.x, position.y);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    /**
     * Reevaluates the stacked position of the specified position.
     *
     * @param position The position to reevaluate.
     * @returns The stacked position.
     */
    private reevaluateStackedPosition(position: Vector2): Vector2 {
        if (this.object.type & ObjectTypes.spinner) {
            return position;
        }

        const coordinate = this.object.stackHeight * -6.4 * this.scale;

        return position
            .subtract(this.object.getStackOffset(Modes.droid))
            .add(new Vector2(coordinate, coordinate));
    }
}
