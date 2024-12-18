import {
    Easing,
    Interpolation,
    MathUtils,
    Modes,
    Slider,
    SliderTick,
    Vector2,
} from "@rian8337/osu-base";
import { DrawableCircle } from "./DrawableCircle";
import { SpectatorObjectDataEvent } from "../../spectator/events/SpectatorObjectDataEvent";
import { HitResult } from "../../spectator/structures/HitResult";
import { interpolateEasing } from "../../utils/EasingInterpolator";

/**
 * Represents a slider that can be drawn.
 */
export class DrawableSlider extends DrawableCircle {
    private static readonly reverseArrow = String.fromCharCode(10132);

    override draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        hitData: SpectatorObjectDataEvent | null,
    ) {
        // Allow TypeScript to type narrow.
        if (!(this.object instanceof Slider) || !this.object.head.hitWindow) {
            return;
        }

        const maxHitTime =
            this.object.startTime +
            Math.min(
                this.object.head.hitWindow.mehWindow,
                this.object.duration,
            );

        const hitTime = hitData?.time ?? maxHitTime;

        this.isHit = time >= hitTime;

        const dt = time - this.object.startTime;
        let opacity = 1;

        // When the object is still in time
        if (time < this.object.endTime) {
            if (this.isHidden) {
                let timeElapsed =
                    time - (this.object.startTime - this.object.timePreempt);

                if (timeElapsed <= this.object.timeFadeIn) {
                    opacity = timeElapsed / this.object.timeFadeIn;
                } else {
                    timeElapsed -= this.object.timeFadeIn;
                    const fadeOutDuration =
                        this.object.duration +
                        this.object.timePreempt -
                        this.object.timeFadeIn;

                    const t = timeElapsed / fadeOutDuration;

                    opacity = Interpolation.lerp(
                        1,
                        0,
                        interpolateEasing(Easing.out, t),
                    );
                }
            } else {
                opacity = -dt / this.object.timeFadeIn;
            }
        } else if (this.isHidden) {
            opacity = 0;
        } else {
            const fadeOutDuration = 240;

            opacity = 1 - (time - this.object.endTime) / fadeOutDuration;

            this.updateLifetimeEnd(this.object.endTime + fadeOutDuration);
        }

        ctx.globalAlpha = MathUtils.clamp(opacity, 0, 1);

        const position = this.stackedPosition;

        // Obtain the current path to draw.
        const snakingInProgress = MathUtils.clamp(
            (time - (this.object.startTime - this.object.timePreempt)) /
                (this.object.timePreempt / 3),
            0,
            1,
        );

        let currentCurve: Vector2[] = [];

        // Slider path
        if (snakingInProgress < 1) {
            const { calculatedPath } = this.object.path;

            for (let i = 0; i < calculatedPath.length; ++i) {
                const currentVertex = calculatedPath[i];
                const progress = i / calculatedPath.length;

                if (
                    progress > snakingInProgress ||
                    i === calculatedPath.length - 1
                ) {
                    // Interpolate the current position of the path.
                    const prevVertex = calculatedPath[i - 1];

                    const vertex = prevVertex.add(
                        currentVertex.subtract(prevVertex),
                    );

                    currentCurve.push(vertex);
                    break;
                }

                currentCurve.push(currentVertex);
            }

            this.drawPath(ctx, currentCurve);
        } else {
            currentCurve = this.object.path.calculatedPath;

            this.drawPath(ctx, this.object.path.calculatedPath);
        }

        const nestedObjects = this.object.nestedHitObjects;
        const pathEndPosition = this.stackedPosition.add(
            currentCurve[currentCurve.length - 1],
        );

        // Slider tail
        this.drawCircle(
            ctx,
            time,
            this.object.endTime,
            hitData?.tickset[nestedObjects.length - 2]
                ? HitResult.great
                : HitResult.miss,
            pathEndPosition,
        );

        // Slider head
        this.drawCircle(ctx, time, hitTime, hitData?.result);

        const repetitions = this.object.spanCount;
        const repeat = (dt * repetitions) / this.object.duration;
        if (repetitions > 1 && repeat + 1 <= (repetitions & ~1)) {
            const lastPoint = currentCurve[currentCurve.length - 1];
            const secondLastPoint = currentCurve.at(-2) ?? position;

            this.drawText(
                ctx,
                DrawableSlider.reverseArrow,
                pathEndPosition,
                lastPoint.getAngle(secondLastPoint),
            );
        }

        if (
            repeat > 0 &&
            repeat + 1 <= repetitions - Number(!(repetitions & 1))
        ) {
            const { calculatedPath } = this.object.path;
            const firstPoint = calculatedPath[0];
            const secondPoint = calculatedPath[1];

            this.drawText(
                ctx,
                DrawableSlider.reverseArrow,
                position,
                firstPoint.getAngle(secondPoint),
            );
        } else if (dt >= 0) {
            this.drawText(ctx, this.comboNumber.toString());
        }

        const spanIndex = this.object.spanAt(dt / this.object.duration);
        const ticksPerSpan = nestedObjects.length - 2 / this.object.spanCount;

        const spanStartIndex =
            // Amount of slider ticks passed.
            Math.floor(spanIndex * ticksPerSpan) +
            // Amount of slider repeats passed.
            spanIndex +
            // The slider head.
            1;

        for (let i = spanStartIndex; i < spanStartIndex + ticksPerSpan; ++i) {
            const tick = nestedObjects[i];

            if (!(tick instanceof SliderTick)) {
                continue;
            }

            this.drawTick(ctx, time, tick, hitData?.tickset[i - 1] ?? false);
        }

        if (dt >= 0 && !this.isHidden) {
            this.drawApproach(ctx, dt);
        } else if (time < this.object.endTime) {
            this.drawFollowCircle(ctx, repeat);
        }

        this.drawHitResult(
            ctx,
            time,
            this.stackedEndPosition,
            hitData?.time ?? this.object.endTime,
            hitData?.result ?? HitResult.miss,
        );
    }

    /**
     * Draws the path of this slider.
     *
     * @param ctx The canvas context.
     * @param time The current time.
     * @param pathCurve The path curve to draw.
     */
    private drawPath(ctx: CanvasRenderingContext2D, pathCurve: Vector2[]) {
        if (ctx.globalAlpha === 0) {
            return;
        }

        ctx.save();

        // Slider
        const startPosition = this.stackedPosition;
        const radius = this.object.radius;

        ctx.globalAlpha *= 0.3;
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);

        for (const path of pathCurve.slice(1)) {
            const drawPosition = this.stackedPosition.add(path);
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
     * @param time The current time.
     * @param tick The tick to draw.
     * @param isHit Whether the tick is hit.
     */
    private drawTick(
        ctx: CanvasRenderingContext2D,
        time: number,
        tick: SliderTick,
        isHit: boolean,
    ) {
        const fadeInStartTime = tick.startTime - tick.timePreempt;

        if (time < fadeInStartTime) {
            return;
        }

        const position = tick.getStackedPosition(Modes.droid);
        const { radius } = this.object;

        let opacity = 0;
        let scale = 1;

        const animationDuration = 150;

        if (time < tick.startTime) {
            opacity = Interpolation.lerp(
                0,
                1,
                (time - fadeInStartTime) / animationDuration,
            );

            const scaleProgress = MathUtils.clamp(
                (time - fadeInStartTime) / (animationDuration * 4),
                0,
                1,
            );

            scale = Interpolation.lerp(
                0.5,
                1,
                interpolateEasing(Easing.outElasticHalf, scaleProgress),
            );

            this.updateLifetimeEnd(fadeInStartTime + animationDuration * 4);
        } else {
            const dt = time - tick.startTime;
            const progress = dt / animationDuration;

            opacity = Interpolation.lerp(
                1,
                0,
                interpolateEasing(Easing.outQuint, progress),
            );

            if (isHit) {
                scale = Interpolation.lerp(
                    1,
                    1.5,
                    interpolateEasing(Easing.out, progress),
                );
            }

            this.updateLifetimeEnd(tick.startTime + animationDuration);
        }

        if (opacity <= 0) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.arc(
            position.x,
            position.y,
            (radius * scale) / 16,
            -Math.PI,
            Math.PI,
        );
        ctx.shadowBlur = 0;
        ctx.lineWidth = (radius * scale) / 32;
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
        progress: number,
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
            this.object.path.positionAt(progress),
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
            Math.PI,
        );
        ctx.shadowBlur = this.shadowBlur;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.circleBorder;
        ctx.stroke();
        ctx.restore();
    }
}
