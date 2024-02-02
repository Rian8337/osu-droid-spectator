import { SpectatorClickEvent } from "../events/SpectatorClickCounterEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the click spectator event.
 */
export class SpectatorClickEventManager extends SpectatorEventManager<SpectatorClickEvent> {
    protected override readonly defaultEvent = new SpectatorClickEvent(0);

    /**
     * Returns the amount of clicks of a cursor index from a player at a given time.
     *
     * @param time The time.
     * @returns The amount of clicks of a cursor index from a player at the given time.
     */
    clickCountAt(time: number): number {
        return this.findInsertionIndex(time);
    }
}
