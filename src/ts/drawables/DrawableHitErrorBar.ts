import {
    DroidHitWindow,
    HitWindow,
    MathUtils,
    RGBColor,
    Slider,
    Spinner,
} from "@rian8337/osu-base";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { hitResultColors } from "../settings/SpectatorSettings";
import { SpectatorObjectDataEventManager } from "../spectator/managers/SpectatorObjectDataEventManager";
import { HitResult } from "../spectator/structures/HitResult";

/**
 * Represents a hit error bar that can be drawn.
 */
export class DrawableHitErrorBar {
    /**
     * The event manager responsible for managing object data.
     */
    readonly manager: SpectatorObjectDataEventManager;

    /**
     * The hit window to draw for.
     */
    readonly hitWindow: HitWindow;

    private readonly maxDrawTime = 3000;

    constructor(
        manager: SpectatorObjectDataEventManager,
        hitWindow: HitWindow,
    ) {
        this.manager = manager;
        this.hitWindow = hitWindow;
    }

    /**
     * Draws the hit error bar into the screen.
     *
     * @param ctx The canvas context.
     * @param time The time to draw the hit error bar at.
     */
    draw(ctx: CanvasRenderingContext2D, time: number): void {
        ctx.save();

        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height * 0.85);

        this.drawMehRange(ctx);
        this.drawGoodRange(ctx);
        this.drawGreatRange(ctx);
        this.drawMiddleLine(ctx);
        this.drawHitResults(ctx, time);

        ctx.restore();
    }

    private drawMehRange(ctx: CanvasRenderingContext2D): void {
        this.drawRange(
            ctx,
            this.hitWindow.mehWindow,
            hitResultColors[HitResult.meh],
        );
    }

    private drawGoodRange(ctx: CanvasRenderingContext2D): void {
        this.drawRange(
            ctx,
            this.hitWindow.okWindow,
            hitResultColors[HitResult.good],
        );
    }

    private drawGreatRange(ctx: CanvasRenderingContext2D): void {
        this.drawRange(
            ctx,
            this.hitWindow.greatWindow,
            hitResultColors[HitResult.great],
        );
    }

    private drawRange(
        ctx: CanvasRenderingContext2D,
        hitWindow: number,
        color: RGBColor,
    ): void {
        const drawDistance = this.calculateDrawDistance(ctx, hitWindow);

        ctx.globalAlpha = 1;
        ctx.lineWidth = ctx.canvas.height / 75;
        ctx.strokeStyle = `rgb(${color.toString()})`;
        ctx.beginPath();
        ctx.moveTo(-drawDistance, 0);
        ctx.lineTo(drawDistance, 0);
        ctx.stroke();
        ctx.closePath();
    }

    private drawMiddleLine(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = 1;
        ctx.lineWidth = ctx.canvas.width / 100;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(0, -ctx.canvas.height / 20);
        ctx.lineTo(0, ctx.canvas.height / 20);
        ctx.stroke();
        ctx.closePath();
    }

    private drawHitResults(ctx: CanvasRenderingContext2D, time: number): void {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been parsed yet");
        }

        for (
            let event = this.manager.eventAt(time);
            event && event.index >= 0;
            event = this.manager.eventAtIndex(event.index - 1)
        ) {
            if (event.result === HitResult.miss) {
                continue;
            }

            const object = parsedBeatmap.hitObjects.objects[event.index];

            if (object instanceof Spinner) {
                continue;
            }

            // Check for slider head break.
            if (
                object instanceof Slider &&
                event.accuracy > Math.floor(this.hitWindow.mehWindow)
            ) {
                continue;
            }

            // For hit error, we use the object start time rather than the event time. This is because event
            // times are based on objects' end time, and in sliders, the hit error is drawn when the player
            // hits the slider head rather than after the slider ends. As such, using the event time here
            // would result in an inaccurate hit error bar.
            const eventTime = object.startTime + event.accuracy;
            const dt = time - eventTime;
            if (dt > this.maxDrawTime) {
                break;
            }

            const opacity = MathUtils.clamp(
                (this.maxDrawTime - dt) / 1000,
                0,
                0.8,
            );

            const distanceFromCenter = this.calculateDrawDistance(
                ctx,
                event.accuracy,
            );

            ctx.globalAlpha = opacity;
            ctx.lineWidth = ctx.canvas.width / 125;
            ctx.strokeStyle = `rgb(${hitResultColors[event.result].toString()})`;
            ctx.beginPath();
            ctx.moveTo(distanceFromCenter, -ctx.canvas.height / 30);
            ctx.lineTo(distanceFromCenter, ctx.canvas.height / 30);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
    }

    private calculateDrawDistance(
        ctx: CanvasRenderingContext2D,
        ms: number,
    ): number {
        const maxDistance = ctx.canvas.width / 2;
        // The highest hit window the player can achieve with mods.
        const maxMs = new DroidHitWindow(0).mehWindow;

        return MathUtils.clamp(ms / maxMs, -1, 1) * maxDistance;
    }
}
