import {
    HitObject,
    IModApplicableToDroid,
    Interpolation,
    MathUtils,
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
    /**
     * The underlying object.
     */
    readonly object: HitObject;

    /**
     * The mods used by the player.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The start time of the object's lifetime.
     */
    readonly lifetimeStart: number;

    /**
     * The end time of the object's lifetime.
     */
    lifetimeEnd: number;

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

    constructor(object: HitObject, mods: (Mod & IModApplicableToDroid)[]) {
        this.object = object;
        this.mods = mods;

        this.lifetimeStart = object.startTime - object.timePreempt;

        // Add 800ms to ensure that all animations play properly when needed.
        this.lifetimeEnd =
            object.endTime + (object.hitWindow?.mehWindow ?? 0) + 800;
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
     * Updates the lifetime end of this object.
     *
     * @param newTime The new time.
     * @param force Whether to force the update.
     */
    protected updateLifetimeEnd(newTime: number, force = false) {
        if (force) {
            this.lifetimeEnd = newTime;
        } else {
            this.lifetimeEnd = Math.max(this.lifetimeEnd, newTime);
        }
    }

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

        const fadeInDuration = 120;
        const fadeOutDuration = 600;
        const fadeOutDelay = 500;

        let opacity = 1;
        let scale = 1;
        let yPos = position.y;

        if (dt < fadeInDuration) {
            opacity = dt / fadeInDuration;
        } else if (dt > fadeOutDelay) {
            opacity = 1 - Math.min(1, (dt - fadeOutDelay) / fadeOutDuration);

            this.updateLifetimeEnd(hitTime + fadeOutDuration);
        }

        if (opacity <= 0) {
            return;
        }

        if (hitResult === HitResult.miss) {
            scale = Interpolation.lerp(
                1.6,
                1,
                MathUtils.clamp(Math.pow(dt / 100, 2), 0, 1),
            );

            const yTranslateDuration = fadeOutDelay + fadeOutDuration;

            yPos = Interpolation.lerp(
                yPos - 5,
                yPos + 80,
                MathUtils.clamp(Math.pow(dt / yTranslateDuration, 2), 0, 1),
            );

            this.updateLifetimeEnd(hitTime + yTranslateDuration);
        } else {
            scale = 0.6;
            let currentTime = dt;

            // Start at t = 0.8
            scale = Interpolation.lerp(
                0.6,
                1.1,
                MathUtils.clamp(dt / (fadeInDuration * 0.8), 0, 1),
            );

            currentTime -= fadeInDuration * 0.8;

            // Delay for t = 0.2
            currentTime -= fadeInDuration * 0.2;

            // t = 1.2
            if (currentTime > 0) {
                scale = Interpolation.lerp(
                    1.1,
                    0.9,
                    MathUtils.clamp(currentTime / (fadeInDuration * 0.2), 0, 1),
                );

                currentTime -= fadeInDuration * 0.2;
            }

            // Stable dictates scale of 0.9->1 over time 1.0 to 1.4, but we are already at 1.2.
            // so we need to force the current value to be correct at 1.2 (0.95) then complete the
            // second half of the animation.
            if (currentTime > 0) {
                scale = Interpolation.lerp(
                    0.95,
                    1,
                    MathUtils.clamp(currentTime / (fadeInDuration * 0.2), 0, 1),
                );
            }

            this.updateLifetimeEnd(hitTime + fadeInDuration * 1.4);
        }

        ctx.save();

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${(this.object.radius * scale).toString()}px Torus, sans-serif`;
        } catch {
            // Ignore error
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);
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

        ctx.translate(position.x, yPos);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
}
