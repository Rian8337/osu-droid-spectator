import { Vector2 } from "@rian8337/osu-base";
import { SpectatorEvent } from "../../spectator/events/SpectatorEvent";
import { SpectatorEventManager } from "../../spectator/managers/SpectatorEventManager";
import { DrawableRollingCounter } from "./DrawableRollingCounter";

/**
 * Represents a synced counter that can be drawn.
 */
export abstract class DrawableSyncedCounter<
    TEvent extends SpectatorEvent,
> extends DrawableRollingCounter {
    /**
     * The size scale of the underlying preview.
     */
    protected readonly sizeScale: Vector2;

    /**
     * The event manager of this drawable counter.
     */
    protected readonly manager: SpectatorEventManager<TEvent>;

    /**
     * The synced event manager of this drawable counter.
     */
    protected readonly syncedManager: SpectatorEventManager<TEvent>;

    protected override readonly rollingDuration = 1000;

    private currentEventIndex = 0;
    private currentSyncedEventIndex = 0;

    constructor(
        manager: SpectatorEventManager<TEvent>,
        syncedManager: SpectatorEventManager<TEvent>,
        sizeScale: Vector2,
    ) {
        super();

        this.sizeScale = sizeScale;
        this.manager = manager;
        this.syncedManager = syncedManager;
    }

    protected override getTargetValue(time: number): number {
        let event: TEvent;
        let syncedEvent: TEvent;

        if (time < this.lastTargetValueChangeTime) {
            // Currently rewinding, binary search the current index.
            const eventIndex = this.manager.eventIndexAt(time);
            const syncedEventIndex = this.syncedManager.eventIndexAt(time);

            this.currentEventIndex = eventIndex ?? 0;
            this.currentSyncedEventIndex = syncedEventIndex ?? 0;

            event =
                eventIndex === null
                    ? this.manager.defaultEvent
                    : this.manager.events[eventIndex];

            syncedEvent =
                syncedEventIndex === null
                    ? this.syncedManager.defaultEvent
                    : this.syncedManager.events[syncedEventIndex];
        } else {
            while (
                this.currentEventIndex < this.manager.events.length &&
                this.manager.events[this.currentEventIndex].time <= time
            ) {
                this.currentEventIndex++;
            }

            while (
                this.currentSyncedEventIndex <
                    this.syncedManager.events.length &&
                this.syncedManager.events[this.currentSyncedEventIndex].time <=
                    time
            ) {
                this.currentSyncedEventIndex++;
            }

            event = this.manager.events[this.currentEventIndex];
            syncedEvent =
                this.syncedManager.events[this.currentSyncedEventIndex];
        }

        const targetEvent = syncedEvent.time > event.time ? syncedEvent : event;

        return this.getEventValue(targetEvent);
    }

    protected override setupContext(
        ctx: CanvasRenderingContext2D,
        origin: Vector2,
        fontSize: number,
    ) {
        super.setupContext(ctx, origin, fontSize, this.sizeScale);
    }

    /**
     * Obtains the value to display on the counter.
     *
     * @param event The event to obtain the value from.
     * @returns The value to display.
     */
    protected abstract getEventValue(event: TEvent): number;
}
