import {
    HitObject,
    IModApplicableToDroid,
    Mod,
    Modes,
    RGBColor,
    Vector2,
} from "@rian8337/osu-base";
import { hitResultColors } from "../../settings/SpectatorSettings";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/structures/HitResult";

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
     * The mods used by the player.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The duration at which the object fades out, in milliseconds.
     */
    protected abstract get fadeOutTime(): number;

    /**
     * The combo number of the object.
     */
    comboNumber = 1;

    /**
     * The color of the object.
     */
    color = new RGBColor(0, 202, 0);

    /**
     * The stacked position of the object.
     */
    get stackedPosition(): Vector2 {
        return this.object.getStackedPosition(Modes.droid);
    }

    /**
     * The stacked end position of the object.
     */
    get stackedEndPosition(): Vector2 {
        return this.object.getStackedEndPosition(Modes.droid);
    }

    /**
     * The thickness of the object's border.
     */
    protected get circleBorder(): number {
        return this.object.radius / 8;
    }

    /**
     * The shadow blur of the object.
     */
    protected get shadowBlur(): number {
        return this.object.radius / 16;
    }

    /**
     * The combo color in Canvas string format.
     */
    protected get canvasColor(): string {
        return `rgb(${this.color.toString()})`;
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
        maxHitWindow: number,
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
        hitResult: HitResult,
    ): void {
        if (hitResult === HitResult.great) {
            return;
        }

        const dt = time - hitTime;
        if (dt < 0) {
            return;
        }

        let opacity = 1;

        const {
            hitResultFadeIn,
            hitResultFadeOutTime,
            hitResultFadeOutStartTime,
        } = DrawableHitObject;

        if (dt <= hitResultFadeIn) {
            // Consider fade in first.
            opacity = dt / hitResultFadeIn;
        } else if (dt >= hitResultFadeOutStartTime) {
            // Then fade out.
            opacity =
                1 -
                Math.min(
                    1,
                    (dt - hitResultFadeOutStartTime) / hitResultFadeOutTime,
                );
        }

        if (opacity === 0) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = opacity;
        ctx.shadowBlur = this.shadowBlur;
        ctx.fillStyle = `rgb(${hitResultColors[hitResult].toString()})`;

        let text = "";

        switch (hitResult) {
            case HitResult.good:
                text = "100";
                break;
            case HitResult.meh:
                text = "50";
                break;
            case HitResult.miss:
                text = "❌";
                break;
        }

        ctx.translate(position.x, position.y);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
}
