import {
    Interpolation,
    MathUtils,
    ModHidden,
    Playfield,
} from "@rian8337/osu-base";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/structures/HitResult";
import { DrawableHitObject } from "./DrawableHitObject";

/**
 * Represents a spinner that can be drawn.
 */
export class DrawableSpinner extends DrawableHitObject {
    private readonly isHidden = this.mods.has(ModHidden);
    private static readonly radius = Playfield.baseSize.y / 2;
    private static readonly borderWidth = this.radius / 20;

    override draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitData: SpectatorObjectDataEvent | null,
    ) {
        const dt = time - this.object.startTime;
        let opacity = 1;

        if (dt < 0) {
            // We are in approach time.
            opacity = MathUtils.clamp(1 + dt / this.object.timePreempt, 0, 1);
        } else if (time > this.object.endTime) {
            const fadeOutDuration = 240;

            opacity = Interpolation.lerp(
                1,
                0,
                (time - this.object.endTime) / fadeOutDuration,
            );

            this.updateLifetimeEnd(this.object.endTime + fadeOutDuration);
        }

        if (opacity > 0) {
            ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);
            ctx.save();

            // Spinner
            ctx.beginPath();
            ctx.arc(
                this.object.position.x,
                this.object.position.y,
                DrawableSpinner.radius - DrawableSpinner.borderWidth / 2,
                -Math.PI,
                Math.PI,
            );
            ctx.globalCompositeOperation = "destination-over";
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fill();

            // Border
            ctx.shadowBlur = DrawableSpinner.borderWidth;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = DrawableSpinner.borderWidth;
            ctx.stroke();
            ctx.restore();

            // Approach
            // Only draw approach circle if HD is not used.
            if (dt >= 0 && time <= this.object.endTime && !this.isHidden) {
                const scale = Interpolation.lerp(
                    1,
                    0,
                    MathUtils.clamp(dt / this.object.duration, 0, 1),
                );

                ctx.save();
                ctx.beginPath();
                ctx.arc(
                    this.object.position.x,
                    this.object.position.y,
                    (DrawableSpinner.radius - DrawableSpinner.borderWidth / 2) *
                        scale,
                    -Math.PI,
                    Math.PI,
                );
                ctx.shadowBlur = 3;
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = (DrawableSpinner.borderWidth / 2) * scale;
                ctx.stroke();
                ctx.restore();
            }
        }

        this.drawHitResult(
            ctx,
            time,
            this.object.position,
            this.object.endTime,
            hitData?.result ?? HitResult.miss,
        );
    }
}
