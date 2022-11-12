import { SpectatorAccuracyEvent } from "./SpectatorAccuracyEvent";
import { SpectatorComboEvent } from "./SpectatorComboEvent";
import { SpectatorScoreEvent } from "./SpectatorScoreEvent";

/**
 * Events that can be displayed in a counter.
 */
export type SpectatorCountableEvent =
    | SpectatorAccuracyEvent
    | SpectatorComboEvent
    | SpectatorScoreEvent;
