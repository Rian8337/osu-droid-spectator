import { SpectatorEvent } from "../events/SpectatorEvent";

/**
 * Represents a manager for any kind of spectator event.
 */
export abstract class SpectatorEventManager<T extends SpectatorEvent> {
    /**
     * The default event of this manager.
     */
    abstract readonly defaultEvent: T;

    /**
     * The events associated with this manager.
     */
    protected _events: T[] = [];

    /**
     * The events associated with this manager.
     */
    get events(): readonly T[] {
        return this._events;
    }

    /**
     * The time at which the earliest event of this type occurs for the player.
     *
     * Returns `null` if there are no events yet.
     */
    get earliestEventTime(): number | null {
        return this._events[0]?.time ?? null;
    }

    /**
     * The time at which the latest event of this type occurs for the player.
     *
     * Returns `null` if there are no events yet.
     */
    get latestEventTime(): number | null {
        return this._events.at(-1)?.time ?? null;
    }

    /**
     * Adds an event to this manager.
     *
     * @param events The events to add.
     */
    add(...events: T[]): void {
        for (const event of events) {
            let existing = this.eventAt(event.time);

            if (existing && event.isRedundant(existing)) {
                continue;
            }

            // Remove the existing event if the new event overrides it at the same time.
            while (existing?.time === event.time) {
                if (!this.remove(existing)) {
                    break;
                }

                existing = this.eventAt(event.time);
            }

            this._events.splice(this.findInsertionIndex(event.time), 0, event);
        }
    }

    /**
     * Removes an event.
     *
     * This method will remove the earliest event in the array that is equal to the given event.
     *
     * @param event The event to remove.
     * @returns Whether the event was removed.
     */
    remove(event: T): boolean {
        for (let i = 0; i < this._events.length; ++i) {
            if (this._events[i].time > event.time) {
                break;
            }

            // isRedundant doesn't check for time equality, so we need to specify it separately.
            if (
                this._events[i].time === event.time &&
                this._events[i].isRedundant(event)
            ) {
                this._events.splice(i, 1);

                return true;
            }
        }

        return false;
    }

    /**
     * Removes an event at an index.
     *
     * @param index The index of the event to remove.
     * @returns The event that was removed.
     */
    removeAt(index: number): T {
        return this._events.splice(index, 1)[0];
    }

    /**
     * Clears the events of this manager.
     */
    clear(): void {
        this._events.length = 0;
    }

    /**
     * Binary searches the events list to find the active event at the given time.
     *
     * Includes logic for returning the default event if no events were found.
     *
     * @param time The time to find the event at.
     * @returns The event at the given time, or the default event.
     */
    eventAtOrDefault(time: number): T {
        return this.eventAt(time) ?? this.defaultEvent;
    }

    /**
     * Binary searches the events list to find the active event at the given time.
     *
     * @param time The time to find the event at.
     * @returns The event at the given time, `null` if none found.
     */
    eventAt(time: number): T | null {
        if (this._events.length === 0 || time < this._events[0].time) {
            return null;
        }

        if (time >= this._events.at(-1)!.time) {
            return this._events.at(-1)!;
        }

        let l: number = 0;
        let r: number = this._events.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (this._events[pivot].time < time) {
                l = pivot + 1;
            } else if (this._events[pivot].time > time) {
                r = pivot - 1;
            } else {
                return this._events[pivot];
            }
        }

        // l will be the first event with time > this._events[l].time, but we want the one before it
        return this._events[l - 1];
    }

    /**
     * Finds the insertion index of an event in a given time.
     *
     * @param time The start time of the event.
     */
    protected findInsertionIndex(time: number): number {
        if (this._events.length === 0 || time < this._events[0].time) {
            return 0;
        }

        if (time >= this._events.at(-1)!.time) {
            return this._events.length;
        }

        let l: number = 0;
        let r: number = this._events.length - 2;

        while (l <= r) {
            const pivot: number = l + ((r - l) >> 1);

            if (this._events[pivot].time < time) {
                l = pivot + 1;
            } else if (this._events[pivot].time > time) {
                r = pivot - 1;
            } else {
                return pivot;
            }
        }

        return l;
    }
}
