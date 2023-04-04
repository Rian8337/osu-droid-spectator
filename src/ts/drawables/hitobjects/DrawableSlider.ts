import {
    IModApplicableToDroid,
    MathUtils,
    Mod,
    Slider,
    SliderTick,
    Vector2,
} from "../../osu-base";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCircle } from "./DrawableCircle";
import { DrawableHitObject } from "./DrawableHitObject";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/structures/HitResult";

/**
 * Represents a slider that can be drawn.
 */
export class DrawableSlider extends DrawableCircle {
    private static readonly opacity = 0.3;
    private static readonly reverseArrow = String.fromCharCode(10132);

    /**
     * Nested hit objects of this slider to draw.
     *
     * This only consists of slider ticks within one span.
     */
    readonly drawableNestedHitObjects: DrawableHitObject[] = [];

    protected override get fadeOutTime(): number {
        return 150;
    }

    constructor(object: Slider, mods: (Mod & IModApplicableToDroid)[]) {
        super(object, mods);

        for (const nestedObject of object.nestedHitObjects.slice(1)) {
            // Only convert one span. We can revert the order when needed.
            if (!(nestedObject instanceof SliderTick)) {
                break;
            }

            const drawableNestedObject =
                DrawableBeatmap.convertHitObjectToDrawable(nestedObject, mods);

            drawableNestedObject.scale = this.scale;
            drawableNestedObject.approachTime = this.approachTime;
            drawableNestedObject.comboNumber = this.comboNumber;
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
            this.isHit = time >= hitData.time || time >= this.object.endTime;
        }

        const dt = this.object.startTime - time;
        let opacity = 1;

        if (dt >= 0 && !this.isHit) {
            opacity = (this.approachTime - dt) / this.fadeInTime;
        } else {
            if (this.isHidden) {
                // Sliders apply quad out easing with HD (https://easings.net/#easeOutQuad).
                opacity =
                    1 -
                    (1 -
                        Math.pow(
                            1 -
                                MathUtils.clamp(-dt, 0, this.object.duration) /
                                    this.object.duration,
                            2
                        ));
            } else {
                opacity = 1 - (time - this.object.endTime) / this.fadeOutTime;
            }
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);

        const position = this.stackedPosition;
        const pathEndPosition = this.stackedPosition.add(
            this.flipPathVertically(this.object.path.positionAt(1))
        );

        this.drawPath(ctx);
        this.drawCircle(ctx, pathEndPosition);
        this.drawCircle(ctx);

        const { calculatedPath } = this.object.path;
        const repetitions = this.object.repeats + 1;
        const repeat = (-dt * repetitions) / this.object.duration;
        if (repetitions > 1 && repeat + 1 <= (repetitions & ~1)) {
            const lastPoint = this.flipPathVertically(calculatedPath.at(-1)!);
            const secondLastPoint = this.flipPathVertically(
                calculatedPath.at(-2)!
            );

            this.drawText(
                ctx,
                DrawableSlider.reverseArrow,
                pathEndPosition,
                lastPoint.getAngle(secondLastPoint)
            );
        }

        if (
            repeat > 0 &&
            repeat + 1 <= repetitions - Number(!(repetitions & 1))
        ) {
            const firstPoint = this.flipPathVertically(calculatedPath[0]);
            const secondPoint = this.flipPathVertically(calculatedPath[1]);

            this.drawText(
                ctx,
                DrawableSlider.reverseArrow,
                position,
                firstPoint.getAngle(secondPoint)
            );
        } else if (dt >= 0) {
            this.drawText(ctx, this.comboNumber.toString());
        }

        const spanIndex = MathUtils.clamp(
            Math.floor(-dt / this.object.spanDuration),
            0,
            this.object.repeats
        );
        const nestedObjects = this.drawableNestedHitObjects.slice();

        if (spanIndex % 2 !== 0) {
            nestedObjects.reverse();
        }

        const fullyOpaqueTicks =
            time >= this.object.startTime && time <= this.object.endTime;

        for (let i = 0; i < nestedObjects.length; ++i) {
            const tick = nestedObjects[i];

            if (!(tick.object instanceof SliderTick)) {
                continue;
            }

            const tickTime =
                tick.object.startTime + this.object.spanDuration * spanIndex;

            if (time >= tickTime && hitData) {
                const tickset =
                    hitData.tickset[
                        spanIndex * nestedObjects.length + spanIndex + i
                    ];

                if (!tickset) {
                    this.drawSliderTick(ctx, tick, fullyOpaqueTicks);
                }
            } else {
                this.drawSliderTick(ctx, tick, fullyOpaqueTicks);
            }
        }

        if (dt >= 0 && !this.isHidden) {
            this.drawApproach(ctx, dt);
        } else if (time < this.object.endTime) {
            this.drawFollowCircle(ctx, repeat);
        }

        const endPosition = this.stackedEndPosition;

        if (this.isHit) {
            if (hitData) {
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
                    this.object.endTime,
                    HitResult.miss
                );
            }
        } else {
            this.drawHitResult(
                ctx,
                time,
                endPosition,
                this.object.endTime,
                HitResult.miss
            );
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
        const startPosition = this.stackedPosition;
        const radius = this.object.radius;

        ctx.globalAlpha *= DrawableSlider.opacity;
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);

        for (const path of this.object.path.calculatedPath.slice(1)) {
            const drawPosition = this.stackedPosition.add(
                this.flipPathVertically(path)
            );
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
     * @param fullyOpaque Whether the tick should be fully opaque.
     */
    private drawSliderTick(
        ctx: CanvasRenderingContext2D,
        tick: DrawableHitObject,
        fullyOpaque: boolean
    ): void {
        if (!(tick.object instanceof SliderTick)) {
            return;
        }

        const position = tick.stackedPosition;
        const { radius } = this.object;

        ctx.save();

        if (fullyOpaque) {
            ctx.globalAlpha = 1;
        }

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

        const drawPosition = this.stackedPosition.add(
            this.flipPathVertically(this.object.path.positionAt(progress))
        );

        ctx.save();
        // Follow circle alpha is always 1 regardless of HD.
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(
            drawPosition.x,
            drawPosition.y,
            this.object.radius - this.circleBorder / 2,
            -Math.PI,
            Math.PI
        );
        ctx.shadowBlur = this.shadowBlur;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.circleBorder;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Flips a path position vertically.
     *
     * Will return the input if HR mod is inactive.
     *
     * @param position The position to flip.
     * @returns The supposed position based on the method's description.
     */
    private flipPathVertically(position: Vector2): Vector2 {
        if (this.isHardRock) {
            return new Vector2(position.x, -position.y);
        } else {
            return position;
        }
    }
}
