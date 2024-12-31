import { Vector2 } from "@rian8337/osu-base";
import { SpectatorEvent } from "../../spectator/events/SpectatorEvent";
import { SpectatorEventManager } from "../../spectator/managers/SpectatorEventManager";
import { DrawableRollingCounter } from "./DrawableRollingCounter";

/**
 * Represents a synced counter that can be drawn.
 */
export abstract class DrawableStatisticsCounter<
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

    protected override readonly rollingDuration = 1000;

    private currentEventIndex = 0;

    constructor(manager: SpectatorEventManager<TEvent>, sizeScale: Vector2) {
        super();

        this.sizeScale = sizeScale;
        this.manager = manager;
    }

    protected override getTargetValue(time: number): number {
        let event: TEvent;

        if (time < this.lastTargetValueChangeTime) {
            // Currently rewinding, binary search the current index.
            const eventIndex = this.manager.eventIndexAt(time);

            this.currentEventIndex = eventIndex ?? 0;

            event =
                eventIndex === null
                    ? this.manager.defaultEvent
                    : this.manager.events[eventIndex];
        } else {
            while (
                this.currentEventIndex < this.manager.events.length - 1 &&
                this.manager.events[this.currentEventIndex].time <= time
            ) {
                this.currentEventIndex++;
            }

            event =
                this.manager.events.at(this.currentEventIndex) ??
                this.manager.defaultEvent;
        }

        return this.getEventValue(event);
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
