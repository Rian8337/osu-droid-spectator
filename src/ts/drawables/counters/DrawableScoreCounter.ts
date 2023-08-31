import { Playfield } from "../../osu-base";
import { SpectatorScoreEvent } from "../../spectator/events/SpectatorScoreEvent";
import { SpectatorSyncedScoreEvent } from "../../spectator/events/SpectatorSyncedScoreEvent";
import { SpectatorEventManager } from "../../spectator/managers/SpectatorEventManager";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a score counter.
 */
export class DrawableScoreCounter extends DrawableCounter<
    SpectatorScoreEvent,
    SpectatorSyncedScoreEvent
> {
    static readonly paddingX = 5;
    static readonly paddingY = 35;

    /**
     * The uid of the player represented by this counter.
     */
    readonly uid: number;

    constructor(
        manager: SpectatorEventManager<SpectatorScoreEvent>,
        syncedManager: SpectatorEventManager<SpectatorSyncedScoreEvent>,
        uid: number,
    ) {
        super(manager, syncedManager);

        this.uid = uid;
    }

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { zeroCoordinate } = DrawableBeatmap;

        this.setupContext(ctx, 60);

        ctx.textAlign = "right";
        ctx.fillText(
            this.getValueAt(time).toString().padStart(8, "0"),
            Playfield.baseSize.x +
                zeroCoordinate.x -
                DrawableScoreCounter.paddingX,
            DrawableScoreCounter.paddingY - zeroCoordinate.y,
        );
        ctx.restore();
    }

    protected override getValueAt(time: number): number {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return (syncedEvent.time > event.time ? syncedEvent : event).score;
    }
}
