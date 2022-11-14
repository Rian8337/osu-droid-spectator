import { SpectatorAccuracyEvent } from "./events/SpectatorAccuracyEvent";
import { SpectatorComboEvent } from "./events/SpectatorComboEvent";
import { SpectatorCursorEvent } from "./events/SpectatorCursorEvent";
import { SpectatorScoreEvent } from "./events/SpectatorScoreEvent";
import { SpectatorEventManager } from "./SpectatorEventManager";
import { SpectatorObjectDataEventManager } from "./SpectatorObjectDataEventManager";

/**
 * Managers for spectator events.
 */
export interface SpectatorEventManagers {
    /**
     * The cursor data of the player.
     *
     * Each array is responsible for a cursor instance (index).
     */
    readonly cursor: SpectatorEventManager<SpectatorCursorEvent>[];

    /**
     * The object data of the player.
     */
    readonly objectData: SpectatorObjectDataEventManager;

    /**
     * The score events of the player.
     */
    readonly score: SpectatorEventManager<SpectatorScoreEvent>;

    /**
     * The accuracy events of a player.
     */
    readonly accuracy: SpectatorEventManager<SpectatorAccuracyEvent>;

    /**
     * The combo events of a player.
     */
    readonly combo: SpectatorEventManager<SpectatorComboEvent>;
}