import { SpectatorEvent } from "../events/SpectatorEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for any kind of spectator event.
 *
 * Unlike normal spectator event managers, this manager stores events based on their index.
 */
export abstract class SpectatorIndexedEventManager<
    T extends SpectatorEvent
> extends SpectatorEventManager<T> {
    /**
     * The earliest index at which an event exists.
     *
     * Will be `Number.POSITIVE_INFINITY` if there are no events yet.
     */
    earliestIndex = Number.POSITIVE_INFINITY;

    /**
     * The latest index at which an event exists.
     *
     * Will be `Number.NEGATIVE_INFINITY` if there are no events yet.
     */
    latestIndex = Number.NEGATIVE_INFINITY;

    override add(...events: T[]): void {
        for (const event of events) {
            const index = this.getEventIndex(event);
            this._events.splice(this.findInsertionIndexBased(index), 0, event);

            this.earliestIndex = Math.min(this.earliestIndex, index);
            this.latestIndex = Math.max(this.latestIndex, index);
        }
    }

    /**
     * Binary searches the events list to find the active event at the given index.
     *
     * @param index The index to find the event at.
     * @returns The event at the given time, `null` if none found.
     */
    eventAtIndex(index: number): T | null {
        if (index < 0) {
            return null;
        }

        return this._events[this.findInsertionIndexBased(index)] ?? null;
    }

    /**
     * Finds the insertion index of an event at the given event index.
     *
     * @param index The event index.
     */
    protected findInsertionIndexBased(index: number): number {
        if (this.earliestEventTime === null || this.latestEventTime === null) {
            return 0;
        }

        if (this._events.length === 0 || index < this.earliestIndex) {
            return 0;
        }

        if (index > this.latestIndex) {
            return this._events.length;
        }

        let l = 0;
        let r = this._events.length - 2;

        while (l <= r) {
            const pivot = l + ((r - l) >> 1);
            const event = this._events[pivot];
            const eventIndex = this.getEventIndex(event);

            if (eventIndex < index) {
                l = pivot + 1;
            } else if (eventIndex > index) {
                r = pivot - 1;
            } else {
                return pivot;
            }
        }

        return l;
    }

    /**
     * Gets the index of an event.
     *
     * @param event The event.
     * @returns The index of the event.
     */
    protected abstract getEventIndex(event: T): number;
}
