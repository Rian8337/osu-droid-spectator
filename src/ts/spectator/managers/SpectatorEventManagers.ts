import { SpectatorAccuracyEventManager } from "./SpectatorAccuracyEventManager";
import { SpectatorComboEventManager } from "./SpectatorComboEventManager";
import { SpectatorCursorEventManager } from "./SpectatorCursorEventManager";
import { SpectatorObjectDataEventManager } from "./SpectatorObjectDataEventManager";
import { SpectatorScoreEventManager } from "./SpectatorScoreEventManager";
import { SpectatorSyncedAccuracyEventManager } from "./SpectatorSyncedAccuracyEventManager";
import { SpectatorSyncedComboEventManager } from "./SpectatorSyncedComboEventManager";
import { SpectatorSyncedScoreEventManager } from "./SpectatorSyncedScoreEventManager";

/**
 * Managers for spectator events.
 */
export interface SpectatorEventManagers {
    /**
     * The cursor data of the player.
     *
     * Each array is responsible for a cursor instance (index).
     */
    readonly cursor: SpectatorCursorEventManager[];

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

    /**
     * The combo events of a player, obtained every time the player submits spectator data.
     *
     * Used to sync score in case a packet loss occurs.
     */
    readonly syncedScore: SpectatorSyncedScoreEventManager;

    /**
     * The accuracy events of a player, obtained every time the player submits spectator data.
     *
     * Used to sync accuracy in case a packet loss occurs.
     */
    readonly syncedAccuracy: SpectatorSyncedAccuracyEventManager;

    /**
     * The combo events of a player, obtained every time the player submits spectator data.
     *
     * Used to sync combo in case a packet loss occurs.
     */
    readonly syncedCombo: SpectatorSyncedComboEventManager;
}
