import { HitObject, MapStats, Modes, RGBColor } from "../../osu-base";
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
     * The duration at which the object fades in.
     */
    readonly fadeInTime: number = 400;

    /**
     * The duration at which the object fades out.
     */
    readonly fadeOutTime: number = 150;

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
     */
    approachTime = MapStats.arToMS(5);

    /**
     * The thickness of the object's border.
     */
    protected get circleBorder(): number {
        return this.object.getRadius(Modes.droid) / 8;
    }

    /**
     * The shadow blur of the object.
     */
    protected get shadowBlur(): number {
        return this.object.getRadius(Modes.droid) / 16;
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

    constructor(object: HitObject) {
        this.object = object;
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
     * Drwas the hit result of this object at a given time.
     *
     * @param ctx The canvas context.
     * @param time The time.
     * @param hitTime The time at which the object was hit.
     * @param hitResult The hit result of the object.
     */
    protected drawHitResult(
        ctx: CanvasRenderingContext2D,
        time: number,
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

        const position = this.object.getStackedEndPosition(Modes.droid);
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
}
