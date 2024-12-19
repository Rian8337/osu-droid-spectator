import { SpectatorAccuracyEventManager } from "./SpectatorAccuracyEventManager";
import { SpectatorClickEventManager } from "./SpectatorClickEventManager";
import { SpectatorComboEventManager } from "./SpectatorComboEventManager";
import { SpectatorCursorEventManager } from "./SpectatorCursorEventManager";
import { SpectatorObjectDataEventManager } from "./SpectatorObjectDataEventManager";
import { SpectatorScoreEventManager } from "./SpectatorScoreEventManager";

/**
 * Managers for spectator events.
 */
export interface SpectatorEventManagers {
    /**
     * The cursor data of the player.
     *
     * Each array is responsible for a cursor instance (index).
     */
    readonly cursors: SpectatorCursorEventManager[];

    /**
     * The click (`MovementType.down`) data of the player.
     *
     * Each array is responsible for a cursor instance (index).
     */
    readonly clicks: SpectatorClickEventManager[];

    /**
     * The object data of the player.
     */
    readonly objectData: SpectatorObjectDataEventManager;

    /**
     * The score events of the player, obtained and derived from hit object data.
     */
    readonly score: SpectatorScoreEventManager;

    /**
     * The accuracy events of a player, derived from hit object data.
     */
    readonly accuracy: SpectatorAccuracyEventManager;

    /**
     * The combo events of a player, obtained and derived from hit object data.
     */
    readonly combo: SpectatorComboEventManager;
}
