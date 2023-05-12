import { MapStats, MathUtils, ModHidden, Vector2 } from "../../osu-base";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/structures/HitResult";
import { DrawableHitObject } from "./DrawableHitObject";

/**
 * Represents a circle that can be drawn.
 */
export class DrawableCircle extends DrawableHitObject {
    protected readonly isHidden = this.mods.some((m) => m instanceof ModHidden);

    protected override get fadeInTime(): number {
        if (this.isHidden) {
            return this.approachTime * ModHidden.fadeInDurationMultiplier;
        } else {
            // Preempt time can go below 450ms. Normally, this is achieved via the DT mod which uniformly speeds up all animations game wide regardless of AR.
            // This uniform speedup is hard to match 1:1, however we can at least make AR>10 (via mods) feel good by extending the upper linear function above.
            // Note that this doesn't exactly match the AR>10 visuals as they're classically known, but it feels good.
            // This adjustment is necessary for AR>10, otherwise TimePreempt can become smaller leading to hitcircles not fully fading in.
            return 400 * Math.min(1, this.approachTime / MapStats.arToMS(10));
        }
    }

    protected override get fadeOutTime(): number {
        if (this.isHidden) {
            return this.approachTime * ModHidden.fadeOutDurationMultiplier;
        } else {
            return 150;
        }
    }

    override draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitData: SpectatorObjectDataEvent | null,
        maxHitWindow: number
    ): void {
        const maxHitTime = this.object.startTime + maxHitWindow;

        if (hitData) {
            if (hitData.result !== HitResult.miss || hitData.accuracy !== 1e4) {
                this.isHit = time >= this.object.startTime + hitData.accuracy;
            } else {
                this.isHit = time >= maxHitTime;
            }
        } else {
            this.isHit = time >= maxHitTime;
        }

        const dt = this.object.startTime - time;
        let opacity = 0;

        if (dt >= 0 && !this.isHit) {
            if (this.isHidden) {
                const fadeInStartTime =
                    this.object.startTime - this.approachTime;
                const fadeOutStartTime = fadeInStartTime + this.fadeInTime;

                opacity = Math.min(
                    MathUtils.clamp(
                        (time - fadeInStartTime) / this.fadeInTime,
                        0,
                        1
                    ),
                    1 -
                        MathUtils.clamp(
                            (time - fadeOutStartTime) / this.fadeOutTime,
                            0,
                            1
                        )
                );
            } else {
                opacity = (this.approachTime - dt) / this.fadeInTime;
            }
        } else if (!this.isHidden) {
            let fadeDt = dt;

            if (
                hitData &&
                (hitData.result !== HitResult.miss || hitData.accuracy !== 1e4)
            ) {
                fadeDt += hitData.accuracy;
            } else {
                fadeDt += maxHitWindow;
            }

            opacity = 1 + fadeDt / this.fadeOutTime;
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);

        this.drawCircle(ctx, this.stackedPosition);
        this.drawText(ctx, this.comboNumber.toString());

        if (dt >= 0 && !this.isHit && !this.isHidden) {
            this.drawApproach(ctx, dt);
        }

        const endPosition = this.stackedEndPosition;

        if (this.isHit) {
            if (
                hitData &&
                (hitData.result !== HitResult.miss || hitData.accuracy !== 1e4)
            ) {
                this.drawHitResult(
                    ctx,
                    time,
                    endPosition,
                    hitData.time,
                    hitData.result
                );
            } else {
                this.drawHitResult(
                    ctx,
                    time,
                    endPosition,
                    maxHitTime,
                    HitResult.miss
                );
            }
        } else {
            this.drawHitResult(
                ctx,
                time,
                endPosition,
                maxHitTime,
                HitResult.miss
            );
        }
    }

    /**
     * Draws this circle.
     *
     * @param ctx The canvas context.
     * @param position The position to draw. Defaults to the object's stacked position.
     */
    protected drawCircle(
        ctx: CanvasRenderingContext2D,
        position: Vector2 = this.stackedPosition
    ): void {
        ctx.save();

        // Hit circle
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            this.object.radius - this.circleBorder / 2,
            -Math.PI,
            Math.PI
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
        position: Vector2 = this.stackedPosition,
        rotation: number = 0
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
     * @param dt The time between the object's start time and current clock time.
     */
    protected drawApproach(ctx: CanvasRenderingContext2D, dt: number): void {
        const position = this.stackedPosition;
        const scale = 1 + (dt / this.approachTime) * 3;

        ctx.save();
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            this.object.radius * scale - this.circleBorder / 2,
            -Math.PI,
            Math.PI
        );
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.canvasColor;
        ctx.lineWidth = (this.circleBorder / 2) * scale;
        ctx.stroke();
        ctx.restore();
    }
}
