import { Vector2 } from "@rian8337/osu-base";
import { SpectatorComboEvent } from "../../spectator/events/SpectatorComboEvent";
import { DrawableStatisticsCounter } from "./DrawableStatisticsCounter";

/**
 * Represents a combo counter.
 */
export class DrawableComboCounter extends DrawableStatisticsCounter<SpectatorComboEvent> {
    private static readonly paddingX = 5;
    private static readonly paddingY = 30;
    private static readonly fontSize = 70;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.update(time);

        const { fontSize, paddingX, paddingY } = DrawableComboCounter;

        this.setupContext(ctx, new Vector2(0, ctx.canvas.height), fontSize);

        ctx.textAlign = "left";
        ctx.fillText(`${this.currentValue.toString()}x`, paddingX, -paddingY);
        ctx.restore();
    }

    protected override getEventValue(event: SpectatorComboEvent): number {
        return event.combo;
    }
}
