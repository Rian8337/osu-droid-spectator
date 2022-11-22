import {
    DroidHitWindow,
    MathUtils,
    Playfield,
    Slider,
    Spinner,
    Vector2,
} from "../osu-base";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { hitResultColors } from "../settings/SpectatorSettings";
import { SpectatorObjectDataEventManager } from "../spectator/managers/SpectatorObjectDataEventManager";
import { HitResult } from "../spectator/structures/HitResult";
import { DrawableBeatmap } from "./DrawableBeatmap";

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
    readonly hitWindow: DroidHitWindow;

    /**
     * Whether to draw the hit window for the Precise mod.
     */
    readonly isPrecise: boolean;

    private get centerCoordinate(): Vector2 {
        const { zeroCoordinate } = DrawableBeatmap;

        return new Vector2(
            zeroCoordinate.x / 2,
            Playfield.baseSize.y + zeroCoordinate.y / 1.75
        );
    }

    constructor(
        manager: SpectatorObjectDataEventManager,
        hitWindow: DroidHitWindow,
        isPrecise: boolean
    ) {
        this.manager = manager;
        this.hitWindow = hitWindow;
        this.isPrecise = isPrecise;
    }

    /**
     * Draws the hit error bar into the screen.
     *
     * @param ctx The canvas context.
     * @param time The time to draw the hit error bar at.
     */
    draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.drawMehRange(ctx);
        this.drawGoodRange(ctx);
        this.drawGreatRange(ctx);
        this.drawMiddleLine(ctx);
        this.drawHitResults(ctx, time);
    }

    private drawMehRange(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const { centerCoordinate } = this;
        const drawDistance = this.calculateDrawDistance(
            ctx,
            this.hitWindow.hitWindowFor50(this.isPrecise)
        );

        ctx.globalAlpha = 1;
        ctx.lineWidth = ctx.canvas.height / 50;
        ctx.strokeStyle = `rgb(${hitResultColors[HitResult.meh]})`;
        ctx.beginPath();
        ctx.moveTo(centerCoordinate.x - drawDistance, centerCoordinate.y);
        ctx.lineTo(centerCoordinate.x + drawDistance, centerCoordinate.y);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    private drawGoodRange(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const { centerCoordinate } = this;
        const drawDistance = this.calculateDrawDistance(
            ctx,
            this.hitWindow.hitWindowFor100(this.isPrecise)
        );

        ctx.globalAlpha = 1;
        ctx.lineWidth = ctx.canvas.height / 50;
        ctx.strokeStyle = `rgb(${hitResultColors[HitResult.good]})`;
        ctx.beginPath();
        ctx.moveTo(centerCoordinate.x - drawDistance, centerCoordinate.y);
        ctx.lineTo(centerCoordinate.x + drawDistance, centerCoordinate.y);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    private drawGreatRange(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const { centerCoordinate } = this;
        const drawDistance = this.calculateDrawDistance(
            ctx,
            this.hitWindow.hitWindowFor300(this.isPrecise)
        );

        ctx.globalAlpha = 1;
        ctx.lineWidth = ctx.canvas.height / 50;
        ctx.strokeStyle = `rgb(${hitResultColors[HitResult.great]})`;
        ctx.beginPath();
        ctx.moveTo(centerCoordinate.x - drawDistance, centerCoordinate.y);
        ctx.lineTo(centerCoordinate.x + drawDistance, centerCoordinate.y);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    private drawMiddleLine(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const { centerCoordinate } = this;

        ctx.globalAlpha = 1;
        ctx.lineWidth = ctx.canvas.width / 80;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(
            centerCoordinate.x,
            centerCoordinate.y - ctx.canvas.height / 20
        );
        ctx.lineTo(
            centerCoordinate.x,
            centerCoordinate.y + ctx.canvas.height / 20
        );
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    private drawHitResults(ctx: CanvasRenderingContext2D, time: number): void {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been parsed yet");
        }

        const maxDrawTime = 3000;
        const { centerCoordinate } = this;

        ctx.save();

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

            let eventTime = event.time;

            // Hit data events occur in object end time. However, that should not be the case for sliders.
            if (object instanceof Slider) {
                // Check for slider head break.
                if (
                    event.accuracy ===
                    Math.floor(this.hitWindow.hitWindowFor50(this.isPrecise)) +
                        13
                ) {
                    continue;
                }

                eventTime = object.startTime + event.accuracy;
            }

            const dt = time - eventTime;
            if (dt > maxDrawTime) {
                break;
            }

            const opacity = MathUtils.clamp((maxDrawTime - dt) / 1000, 0, 0.8);

            const distanceFromCenter = this.calculateDrawDistance(
                ctx,
                event.accuracy
            );

            ctx.globalAlpha = opacity;
            ctx.lineWidth = ctx.canvas.width / 100;
            ctx.strokeStyle = `rgb(${hitResultColors[event.result]})`;
            ctx.beginPath();
            ctx.moveTo(
                centerCoordinate.x + distanceFromCenter,
                centerCoordinate.y - ctx.canvas.height / 30
            );
            ctx.lineTo(
                centerCoordinate.x + distanceFromCenter,
                centerCoordinate.y + ctx.canvas.height / 30
            );
            ctx.stroke();
            ctx.closePath();
        }

        ctx.restore();
    }

    private calculateDrawDistance(
        ctx: CanvasRenderingContext2D,
        ms: number
    ): number {
        const maxDistance = ctx.canvas.width / 2;
        // The highest hit window the player can achieve with mods.
        const maxMs = new DroidHitWindow(0).hitWindowFor50();

        return (ms / maxMs) * maxDistance;
    }
}
