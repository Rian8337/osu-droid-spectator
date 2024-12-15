import { Interpolation, MathUtils, ModHidden } from "@rian8337/osu-base";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/structures/HitResult";
import { DrawableHitObject } from "./DrawableHitObject";

/**
 * Represents a circle that can be drawn.
 */
export class DrawableCircle extends DrawableHitObject {
    protected readonly isHidden = this.mods.some((m) => m instanceof ModHidden);

    override draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitData: SpectatorObjectDataEvent | null,
    ): void {
        if (!this.object.hitWindow) {
            return;
        }

        const maxHitTime =
            this.object.startTime + this.object.hitWindow.mehWindow;
        const hitTime = hitData?.time ?? maxHitTime;

        this.isHit = time >= hitTime;

        const dt = time - this.object.startTime;
        let opacity = 0;

        if (dt < 0) {
            // We are in approach time.
            if (this.isHidden) {
                const fadeOutDuration =
                    ModHidden.fadeOutDurationMultiplier *
                    this.object.timePreempt;

                const fadeInStartTime =
                    this.object.startTime - this.object.timePreempt;
                const fadeOutStartTime =
                    fadeInStartTime + this.object.timeFadeIn;

                opacity = Math.min(
                    MathUtils.clamp(
                        (time - fadeInStartTime) / this.object.timeFadeIn,
                        0,
                        1,
                    ),
                    1 -
                        MathUtils.clamp(
                            (time - fadeOutStartTime) / fadeOutDuration,
                            0,
                            1,
                        ),
                );
            } else {
                opacity = 1 + dt / this.object.timeFadeIn;
            }
        } else if (!this.isHidden) {
            const fadeOutStartTime = hitData?.time ?? maxHitTime;
            const fadeOutDuration = 100;

            opacity = MathUtils.clamp(
                1 - (time - fadeOutStartTime) / fadeOutDuration,
                0,
                1,
            );
        }

        if (this.isHit) {
            if (!hitData || hitData.result === HitResult.miss) {
                const fadeOutDuration = 100;

                opacity = MathUtils.clamp(
                    1 - (time - hitTime) / fadeOutDuration,
                    0,
                    1,
                );
            } else {
                const dt = time - hitTime;
                const fadeOutDuration = 240;

                opacity = MathUtils.clamp(
                    Interpolation.lerp(1, 0, dt / fadeOutDuration),
                    0,
                    1,
                );
            }
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);

        this.drawCircle(ctx, time, hitTime, hitData?.result);
        this.drawText(ctx, this.comboNumber.toString());

        if (dt < 0 && !this.isHit && !this.isHidden) {
            this.drawApproach(ctx, dt);
        }

        this.drawHitResult(
            ctx,
            time,
            this.stackedEndPosition,
            hitTime,
            hitData?.result ?? HitResult.miss,
        );
    }

    /**
     * Draws this circle.
     *
     * @param ctx The canvas context.
     * @param time The time to draw.
     * @param hitTime The time at which the object was hit.
     * @param hitResult The hit result of the object. Defaults to miss.
     * @param position The position to draw. Defaults to the object's stacked position.
     */
    protected drawCircle(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitTime: number,
        hitResult = HitResult.miss,
        position = this.stackedPosition,
    ): void {
        let scale = 1;

        if (time > hitTime && hitResult !== HitResult.miss) {
            const dt = time - hitTime;
            const fadeOutDuration = 240;

            scale = MathUtils.clamp(
                Interpolation.lerp(1, 1.4, dt / fadeOutDuration),
                1,
                1.4,
            );
        }

        ctx.save();

        // Hit circle
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            this.object.radius * scale - this.circleBorder / 2,
            -Math.PI,
            Math.PI,
        );
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.canvasColor;
        ctx.fill();

        // Overlay
        ctx.shadowBlur = this.shadowBlur;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.circleBorder;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draws a text.
     *
     * @param ctx The canvas context.
     * @param text The text to draw.
     * @param position The position to draw. Defaults to the object's stacked position.
     * @param rotation The rotation for the text in radians. Defaults to 0.
     */
    protected drawText(
        ctx: CanvasRenderingContext2D,
        text: string,
        position = this.stackedPosition,
        rotation = 0,
    ): void {
        ctx.save();
        ctx.shadowBlur = this.shadowBlur;
        ctx.fillStyle = "#fff";
        ctx.translate(position.x, position.y);
        ctx.rotate(rotation);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    /**
     * Draws the approach circle of this object.
     *
     * @param ctx The canvas context.
     * @param dt The time difference between the current clock time and the object's start time.
     */
    protected drawApproach(ctx: CanvasRenderingContext2D, dt: number): void {
        dt = Math.abs(dt);

        const position = this.stackedPosition;

        const scale = MathUtils.clamp(
            Interpolation.lerp(3, 1, dt / this.object.timePreempt),
            1,
            3,
        );

        const opacity = MathUtils.clamp(
            Interpolation.lerp(
                0,
                0.9,
                dt /
                    Math.min(
                        this.object.timePreempt,
                        this.object.timeFadeIn * 2,
                    ),
            ),
            0,
            0.9,
        );

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            this.object.radius * scale - this.circleBorder / 2,
            -Math.PI,
            Math.PI,
        );
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.canvasColor;
        ctx.lineWidth = (this.circleBorder / 2) * scale;
        ctx.stroke();
        ctx.restore();
    }
}
