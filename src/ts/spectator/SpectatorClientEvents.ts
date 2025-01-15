import { MultiplayerRoom } from "./rawdata/MultiplayerRoom";
import { MultiplayerScore } from "./rawdata/MultiplayerScore";
import { PickedBeatmap } from "./rawdata/PickedBeatmap";
import { StartingRoundMultiplayerRoom } from "./rawdata/StartingRoundMultiplayerRoom";

/**
 * Represents events that can be received from the server.
 */
export interface SpectatorClientEvents {
    /**
     * Emitted after the client connects to the server.
     *
     * @param room The structure of the connected room.
     */
    initialConnection: (room: MultiplayerRoom) => Promise<void>;

    /**
     * Emitted when the host changes the beatmap.
     *
     * @param beatmap The new beatmap. If omitted, no beatmap was selected.
     */
    beatmapChanged: (beatmap: PickedBeatmap | null) => void;

    /**
     * Emitted when the round is starting.
     *
     * @param room The state of the multiplayer room upon starting.
     */
    roundStarted: (room: StartingRoundMultiplayerRoom) => void;

    /**
     * Emitted when a skip in gameplay was performed.
     */
    skipPerformed: () => void;

    /**
     * Emitted when a round ends.
     */
    roundEnded: () => void;

    /**
     * Emitted when spectator data is received.
     *
     * @param data The spectator data.
     */
    spectatorData: (uid: number, data: ArrayBuffer) => void;

    /**
     * Emitted when a player or the system sends a chat message.
     *
     * @param username The username of the player. If `null`, the message is a system message.
     * @param message The message that was sent by the player or system.
     */
    chatMessage: (username: string | null, message: string) => void;

    /**
     * Emitted when a player submits their score.
     *
     * @param score The submitted score.
     */
    scoreSubmission: (score: MultiplayerScore) => void;
}
