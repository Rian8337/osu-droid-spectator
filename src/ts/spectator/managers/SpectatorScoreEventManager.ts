import { SpectatorScoreEvent } from "../events/SpectatorScoreEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the score spectator event.
 */
export class SpectatorScoreEventManager extends SpectatorEventManager<SpectatorScoreEvent> {
    protected override readonly defaultEvent = new SpectatorScoreEvent(
        Number.NEGATIVE_INFINITY,
        0
    );
}
