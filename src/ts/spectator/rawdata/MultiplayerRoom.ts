import { PickedBeatmap } from "./PickedBeatmap";
import { StartingRoundMultiplayerRoom } from "./StartingRoundMultiplayerRoom";

/**
 * Represents the information about a multiplayer room that's received from the server.
 */
export interface MultiplayerRoom extends StartingRoundMultiplayerRoom {
    /**
     * The beatmap that is currently being played.
     */
    readonly beatmap: PickedBeatmap | null;

    /**
     * Whether the room is currently playing.
     */
    readonly isPlaying: boolean;
}
