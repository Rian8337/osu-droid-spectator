import { Vector2 } from "@rian8337/osu-base";
import { SpectatorEvent } from "../../spectator/events/SpectatorEvent";
import { SpectatorEventManager } from "../../spectator/managers/SpectatorEventManager";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a synced counter that can be drawn.
 */
export abstract class DrawableSyncedCounter<
    TEvent extends SpectatorEvent,
> extends DrawableCounter {
    /**
     * The event manager of this drawable counter.
     */
    protected readonly manager: SpectatorEventManager<TEvent>;

    /**
     * The synced event manager of this drawable counter.
     */
    protected readonly syncedManager: SpectatorEventManager<TEvent>;

    constructor(
        manager: SpectatorEventManager<TEvent>,
        syncedManager: SpectatorEventManager<TEvent>,
        sizeScale: Vector2,
    ) {
        super(sizeScale);

        this.manager = manager;
        this.syncedManager = syncedManager;
    }

    /**
     * Gets an event that occurs in a clock time. Accounts for synced events.
     *
     * @param time The clock time.
     * @returns The event.
     */
    protected getEventAt(time: number): TEvent {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return syncedEvent.time > event.time ? syncedEvent : event;
    }
}
