import { SpectatorCursorData } from "./SpectatorCursorData";
import { SpectatorObjectData } from "./SpectatorObjectData";

/**
 * Represents spectator data to be sent to the spectator client.
 */
export interface SpectatorData {
    /**
     * The uid of the player.
     */
    readonly uid: number;

    /**
     * The cursor movements of the player.
     *
     * Each index represents cursor index.
     */
    readonly cursorMovement: SpectatorCursorData[][];

    /**
     * Object data for whatever object that was hit by the player.
     */
    readonly hitObjectData: SpectatorObjectData[];

    /**
     * The current score of the player.
     */
    readonly currentScore: number;

    /**
     * The current combo of the player.
     */
    readonly currentCombo: number;

    /**
     * The current accuracy of the player.
     */
    readonly currentAccuracy: number;

    /**
     * The current great hits achieved by the player.
     */
    readonly currentHit300: number;

    /**
     * The current good hits achieved by the player.
     */
    readonly currentHit100: number;

    /**
     * The current meh hits achieved by the player.
     */
    readonly currentHit50: number;

    /**
     * The current misses achieved by the player.
     */
    readonly currentMisses: number;

    /**
     * The amount of seconds that has passed for the player.
     */
    readonly secPassed: number;
}
