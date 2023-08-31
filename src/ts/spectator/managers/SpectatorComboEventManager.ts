import { SpectatorComboEvent } from "../events/SpectatorComboEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";

/**
 * Represents a manager for the combo spectator event.
 */
export class SpectatorComboEventManager extends SpectatorEventManager<SpectatorComboEvent> {
    protected override readonly defaultEvent = new SpectatorComboEvent(
        Number.NEGATIVE_INFINITY,
        0,
    );
}
