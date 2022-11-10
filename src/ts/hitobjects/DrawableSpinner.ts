import { MathUtils, Playfield } from "../osu-base";
import { DrawableCircle } from "./DrawableCircle";

/**
 * Represents a spinner that can be drawn.
 */
export class DrawableSpinner extends DrawableCircle {
    override readonly fadeInTime = 500;

    private static readonly radius = Playfield.baseSize.y / 2;
    private static readonly borderWidth = this.radius / 20;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const dt = this.object.startTime - time;
        let opacity = 1;

        if (dt >= 0) {
            opacity = (this.approachTime - dt) / this.fadeInTime;
        } else if (time > this.object.endTime) {
            opacity = 1 - (time - this.object.endTime) / this.fadeOutTime;
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);
        ctx.save();

        // Spinner
        ctx.beginPath();
        ctx.arc(
            this.object.position.x,
            this.object.position.y,
            DrawableSpinner.radius - DrawableSpinner.borderWidth / 2,
            -Math.PI,
            Math.PI
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
        if (dt < 0 && time <= this.object.endTime) {
            const scale = 1 + dt / this.object.duration;

            ctx.beginPath();
            ctx.arc(
                this.object.position.x,
                this.object.position.y,
                (DrawableSpinner.radius - DrawableSpinner.borderWidth / 2) *
                    scale,
                -Math.PI,
                Math.PI
            );
            ctx.shadowBlur = 3;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = (DrawableSpinner.borderWidth / 2) * scale;
            ctx.stroke();
        }
    }
}
