import { MultiplayerPlayer } from "./MultiplayerPlayer";
import { PickedBeatmap } from "./PickedBeatmap";

/**
 * Represents the information about a multiplayer room that's received from the server.
 */
export interface MultiplayerRoomInfo {
    /**
     * The beatmap that is currently being played.
     */
    beatmap: PickedBeatmap | null;

    /**
     * The combination of mods that are required to be played.
     */
    requiredMods: string;

    /**
     * The custom speed multiplier to be used.
     */
    speedMultiplier: number;

    /**
     * The players who are playing in the room.
     */
    players: MultiplayerPlayer[];

    /**
     * The error message received from the server, if any.
     */
    message?: string;

    /**
     * Custom mod multipliers that overrides the client's default mod multiplier.
     *
     * Each mod is mapped to their own mod multiplier.
     */
    modMultipliers: Record<string, number>;

    /**
     * Settings for forced AR.
     */
    forcedAR: {
        /**
         * Whether players are allowed to use forced AR.
         */
        allowed: boolean;

        /**
         * The allowable minimum value of forced AR if it is allowed.
         */
        minValue: number;

        /**
         * The allowable maximum value of forced AR if it is allowed.
         */
        maxValue: number;
    };
}
