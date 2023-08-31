import { MultiplayerTeamMode } from "../structures/MultiplayerTeamMode";
import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";
import { PickedBeatmap } from "./PickedBeatmap";
import { MultiplayerRoomMods } from "../structures/MultiplayerRoomMods";

/**
 * Represents the information about a multiplayer room that's received from the server.
 */
export interface MultiplayerRoom {
    /**
     * The name of the room.
     */
    readonly name: string;

    /**
     * The beatmap that is currently being played.
     */
    readonly beatmap: PickedBeatmap | null;

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

    /**
     * Whether the room is currently playing.
     */
    readonly isPlaying: boolean;
}
