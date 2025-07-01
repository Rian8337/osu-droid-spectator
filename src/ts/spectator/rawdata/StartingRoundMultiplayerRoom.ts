import { SerializedMod } from "@rian8337/osu-base";
import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";
import { MultiplayerTeamMode } from "../structures/MultiplayerTeamMode";

/**
 * Represents a multiplayer room received when a round is starting.
 */
export interface StartingRoundMultiplayerRoom {
    /**
     * The name of the room.
     */
    readonly name: string;

    /**
     * The mods that must be played.
     */
    readonly mods: SerializedMod[];

    /**
     * The players who are playing in the room.
     */
    readonly playingPlayers: MultiplayerPlayer[];

    /**
     * The team mode of the room.
     */
    readonly teamMode: MultiplayerTeamMode;
}
