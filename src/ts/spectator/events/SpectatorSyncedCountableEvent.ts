import { SpectatorSyncedAccuracyEvent } from "./SpectatorSyncedAccuracyEvent";
import { SpectatorSyncedComboEvent } from "./SpectatorSyncedComboEvent";
import { SpectatorSyncedScoreEvent } from "./SpectatorSyncedScoreEvent";

/**
 * Synced events that can be displayed in a counter.
 */
export type SpectatorSyncedCountableEvent =
    | SpectatorSyncedAccuracyEvent
    | SpectatorSyncedComboEvent
    | SpectatorSyncedScoreEvent;
