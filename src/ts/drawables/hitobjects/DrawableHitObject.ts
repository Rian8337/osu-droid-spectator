import {
    HitObject,
    IModApplicableToDroid,
    MapStats,
    Mod,
    ModHardRock,
    ObjectTypes,
    Playfield,
    RGBColor,
    Vector2,
} from "../../osu-base";
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
     * Whether the Hard Rock mod is active.
     */
    protected readonly isHardRock: boolean;

    /**
     * The duration at which the object fades in, in milliseconds.
     */
    protected abstract get fadeInTime(): number;

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
     * The stacked position of the object with mods applied.
     */
    get stackedPosition(): Vector2 {
        return this.reevaluateStackedPosition(
            this.flipVertically(this.object.position)
        );
    }

    /**
     * The stacked end position of the object with mods applied.
     */
    get stackedEndPosition(): Vector2 {
        return this.reevaluateStackedPosition(
            this.flipVertically(this.object.endPosition)
        );
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
        return `rgb(${this.color})`;
    }

    /**
     * Whether the object was hit.
     */
    isHit = false;

    constructor(object: HitObject, mods: (Mod & IModApplicableToDroid)[]) {
        this.object = object;
        this.mods = mods;
        this.isHardRock = this.mods.some((m) => m instanceof ModHardRock);
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
        if (hitResult === HitResult.great) {
            return;
        }

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
        ctx.fillStyle = `rgb(${hitResultColors[hitResult]})`;

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

    /**
     * Flips a position vertically with respect to the playfield.
     *
     * Will return the input if HR mod is inactive.
     *
     * @param position The position to flip.
     * @returns The supposed position based on the method's description.
     */
    protected flipVertically(position: Vector2): Vector2 {
        if (this.isHardRock) {
            return new Vector2(position.x, Playfield.baseSize.y - position.y);
        } else {
            return position;
        }
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

        const coordinate = this.object.stackHeight * 4 * this.scale;

        return position.add(new Vector2(coordinate, coordinate));
    }
}
