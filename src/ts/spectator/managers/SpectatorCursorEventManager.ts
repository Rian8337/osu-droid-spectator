import { Vector2 } from "../../osu-base";
import { SpectatorCursorEvent } from "../events/SpectatorCursorEvent";
import { MovementType } from "../structures/MovementType";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the cursor spectator event.
 */
export class SpectatorCursorEventManager extends SpectatorEventManager<SpectatorCursorEvent> {
    override readonly defaultEvent = new SpectatorCursorEvent(
        0,
        new Vector2(-1, -1),
        MovementType.up
    );
}
