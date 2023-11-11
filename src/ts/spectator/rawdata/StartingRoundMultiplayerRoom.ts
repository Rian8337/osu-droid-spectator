import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";
import { MultiplayerRoomMods } from "../structures/MultiplayerRoomMods";
import { MultiplayerTeamMode } from "../structures/MultiplayerTeamMode";

/**
 * Represents a multiplayer room received when a round is starting.
 */
export interface StartingRoundMultiplayerRoom {
    /**
     * The mods that must be played.
     */
    readonly mods: MultiplayerRoomMods;

    /**
     * The amount of players who are in this room.
     */
    readonly playerCount: number;

    /**
     * The players who are playing in the room.
     */
    readonly playingPlayers: MultiplayerPlayer[];

    /**
     * The team mode of the room.
     */
    readonly teamMode: MultiplayerTeamMode;
}
