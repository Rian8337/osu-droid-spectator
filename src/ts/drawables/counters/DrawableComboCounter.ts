import { Playfield } from "../../osu-base";
import { SpectatorComboEvent } from "../../spectator/events/SpectatorComboEvent";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a combo counter.
 */
export class DrawableComboCounter extends DrawableCounter<SpectatorComboEvent> {
    static readonly paddingX = 5;
    static readonly paddingY = 95;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const combo = this.manager.eventAt(time)?.combo ?? 0;
        const zeroCoordinate = DrawableBeatmap.zeroCoordinate;

        this.setupContext(ctx, 70);

        ctx.textAlign = "left";
        ctx.fillText(
            `${combo}x`,
            DrawableComboCounter.paddingX - zeroCoordinate.x,
            Playfield.baseSize.y +
                zeroCoordinate.y -
                DrawableComboCounter.paddingY
        );
        ctx.restore();
    }
}
