import { SpectatorAccuracyEvent } from "../events/SpectatorAccuracyEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the accuracy spectator event.
 */
export class SpectatorAccuracyEventManager extends SpectatorEventManager<SpectatorAccuracyEvent> {
    override readonly defaultEvent = new SpectatorAccuracyEvent(
        Number.NEGATIVE_INFINITY,
        1,
    );
}
