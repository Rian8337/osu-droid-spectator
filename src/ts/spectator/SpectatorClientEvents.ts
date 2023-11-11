import { MultiplayerRoom } from "./rawdata/MultiplayerRoom";
import { PickedBeatmap } from "./rawdata/PickedBeatmap";
import { SpectatorData } from "./rawdata/SpectatorData";
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
    beatmapChanged: (beatmap?: PickedBeatmap) => void;

    /**
     * Emitted when the round is starting.
     *
     * @param room The state of the multiplayer room upon starting.
     */
    roundStarted: (room: StartingRoundMultiplayerRoom) => void;

    /**
     * Emitted when spectator data is received.
     *
     * @param data The spectator data.
     */
    spectatorData: (data: SpectatorData) => void;

    /**
     * Emitted when a player or the system sends a chat message.
     *
     * @param uid The uid of the player. If `null`, the message is a system message.
     * @param message The message that was sent by the player or system.
     */
    chatMessage: (uid: string | null, message: string) => void;
}
