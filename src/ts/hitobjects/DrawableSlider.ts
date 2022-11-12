import { MathUtils, Modes, Slider, SliderTick } from "../osu-base";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCircle } from "./DrawableCircle";
import { DrawableHitObject } from "./DrawableHitObject";
import { SpectatorObjectDataEvent } from "../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../spectator/rawdata/HitResult";

/**
 * Represents a slider that can be drawn.
 */
export class DrawableSlider extends DrawableCircle {
    private static readonly opacity = 0.5;
    private static readonly reverseArrow = String.fromCharCode(10132);

    /**
     * Nested hit objects of this slider to draw.
     *
     * This only consists of slider ticks within one span.
     */
    readonly drawableNestedHitObjects: DrawableHitObject[] = [];

    constructor(object: Slider) {
        super(object);

        for (const nestedObject of object.nestedHitObjects.slice(1)) {
            // Only convert one span. We can revert the order when needed.
            if (!(nestedObject instanceof SliderTick)) {
                break;
            }

            const drawableNestedObject =
                DrawableBeatmap.convertHitObjectToDrawable(nestedObject);

            drawableNestedObject.approachTime = this.approachTime;
            drawableNestedObject.combo = this.combo;
            drawableNestedObject.color = this.color;

            this.drawableNestedHitObjects.push(drawableNestedObject);
        }
    }

    override draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitData: SpectatorObjectDataEvent | null
    ): void {
        // Allow TypeScript to type narrow.
        if (!(this.object instanceof Slider)) {
            return;
        }

        if (hitData) {
            this.isHit = time >= hitData.time;
        }

        const dt = this.object.startTime - time;
        let opacity = 1;

        if (dt >= 0 && !this.isHit) {
            opacity = (this.approachTime - dt) / this.fadeInTime;
        } else {
            opacity = 1 - (time - this.object.endTime) / this.fadeOutTime;
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);

        const position = this.object.getStackedPosition(Modes.droid);
        const pathEndPosition = position.add(this.object.path.positionAt(1));

        this.drawPath(ctx);
        this.drawCircle(ctx, pathEndPosition);
        this.drawCircle(ctx);

        const { controlPoints } = this.object.path;
        const repetitions = this.object.repeats + 1;
        const repeat = (-dt * repetitions) / this.object.duration;
        if (repetitions > 1 && repeat + 1 <= (repetitions & ~1)) {
            this.drawText(
                ctx,
                DrawableSlider.reverseArrow,
                pathEndPosition,
                controlPoints.at(-1)!.getAngle(controlPoints.at(-2)!)
            );
        }

        if (
            repeat > 0 &&
            repeat + 1 <= repetitions - Number(!(repetitions & 1))
        ) {
            this.drawText(
                ctx,
                DrawableSlider.reverseArrow,
                position,
                controlPoints[0].getAngle(controlPoints[1])
            );
        } else if (dt >= 0) {
            this.drawText(ctx, this.combo.toString());
        }

        const spanIndex = Math.max(
            0,
            Math.floor(-dt / this.object.spanDuration)
        );
        const nestedObjects = this.drawableNestedHitObjects.slice();

        if (spanIndex % 2 !== 0) {
            nestedObjects.reverse();
        }

        for (let i = 0; i < nestedObjects.length; ++i) {
            const tick = nestedObjects[i];

            if (!(tick.object instanceof SliderTick)) {
                continue;
            }

            const tickTime =
                tick.object.startTime + this.object.spanDuration * spanIndex;

            if (time >= tickTime && hitData) {
                const tickset =
                    hitData.tickset[spanIndex * nestedObjects.length + i];

                if (!tickset) {
                    this.drawSliderTick(ctx, tick);
                }
            } else {
                this.drawSliderTick(ctx, tick);
            }
        }

        if (dt >= 0) {
            this.drawApproach(ctx, dt);
        } else if (time < this.object.endTime) {
            this.drawFollowCircle(ctx, repeat);
        }

        if (this.isHit) {
            if (hitData) {
                this.drawHitResult(ctx, time, hitData.time, hitData.result);
            } else {
                this.drawHitResult(
                    ctx,
                    time,
                    this.object.endTime,
                    HitResult.miss
                );
            }
        }
    }

    /**
     * Draws the path of this slider.
     *
     * @param ctx The canvas context.
     */
    private drawPath(ctx: CanvasRenderingContext2D): void {
        // Allow TypeScript to type narrow.
        if (!(this.object instanceof Slider)) {
            return;
        }

        ctx.save();

        // Slider
        const startPosition = this.object.getStackedPosition(Modes.droid);
        const radius = this.object.getRadius(Modes.droid);

        ctx.globalAlpha *= DrawableSlider.opacity;
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);

        for (const path of this.object.path.calculatedPath.slice(1)) {
            const drawPosition = startPosition.add(path);
            ctx.lineTo(drawPosition.x, drawPosition.y);
        }

        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.canvasColor;
        ctx.lineWidth = (radius - this.circleBorder) * 2;
        ctx.stroke();

        // Border
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = radius * 2;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws a slider tick.
     *
     * @param ctx The canvas context.
     * @param tick The tick to draw.
     */
    private drawSliderTick(
        ctx: CanvasRenderingContext2D,
        tick: DrawableHitObject
    ): void {
        if (!(tick.object instanceof SliderTick)) {
            return;
        }

        const position = tick.object.getStackedPosition(Modes.droid);
        const radius = this.object.getRadius(Modes.droid);

        ctx.save();

        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.arc(position.x, position.y, radius / 16, -Math.PI, Math.PI);
        ctx.shadowBlur = 0;
        ctx.lineWidth = radius / 32;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws the follow circle of the slider.
     *
     * @param ctx The canvas context.
     * @param progress The progress of the slider on the path, from 0 to 1.
     */
    private drawFollowCircle(
        ctx: CanvasRenderingContext2D,
        progress: number
    ): void {
        // Allow TypeScript to type narrow.
        if (!(this.object instanceof Slider)) {
            return;
        }

        progress %= 2;

        if (progress > 1) {
            progress = 2 - progress;
        }

        const drawPosition = this.object
            .getStackedPosition(Modes.droid)
            .add(this.object.path.positionAt(progress));

        ctx.save();
        ctx.beginPath();
        ctx.arc(
            drawPosition.x,
            drawPosition.y,
            this.object.getRadius(Modes.droid) - this.circleBorder / 2,
            -Math.PI,
            Math.PI
        );
        ctx.shadowBlur = this.shadowBlur;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.circleBorder;
        ctx.stroke();
        ctx.restore();
    }
}
