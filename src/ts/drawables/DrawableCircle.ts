import { MathUtils, Modes, Vector2 } from "../osu-base";
import { SpectatorObjectDataEvent } from "../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../spectator/rawdata/HitResult";
import { DrawableHitObject } from "./DrawableHitObject";

/**
 * Represents a circle that can be drawn.
 */
export class DrawableCircle extends DrawableHitObject {
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
        let opacity = 1;

        if (dt >= 0 && !this.isHit) {
            opacity = (this.approachTime - dt) / this.fadeInTime;
        } else {
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

        this.drawCircle(ctx, this.object.getStackedPosition(Modes.droid));
        this.drawText(ctx, this.combo.toString());

        if (dt >= 0 && !this.isHit) {
            this.drawApproach(ctx, dt);
        }

        if (this.isHit) {
            if (
                hitData &&
                (hitData.result !== HitResult.miss || hitData.accuracy !== 1e4)
            ) {
                this.drawHitResult(ctx, time, hitData.time, hitData.result);
            } else {
                this.drawHitResult(ctx, time, maxHitTime, HitResult.miss);
            }
        } else {
            this.drawHitResult(ctx, time, maxHitTime, HitResult.miss);
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
        position: Vector2 = this.object.getStackedPosition(Modes.droid)
    ): void {
        ctx.save();

        // Hit circle
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            this.object.getRadius(Modes.droid) - this.circleBorder / 2,
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
        position: Vector2 = this.object.getStackedPosition(Modes.droid),
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
        const position = this.object.getStackedPosition(Modes.droid);
        const scale = 1 + (dt / this.approachTime) * 3;

        ctx.save();
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            this.object.getRadius(Modes.droid) * scale - this.circleBorder / 2,
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
