import { MultiplayerRoomMods } from "./MultiplayerRoomMods";
import { MultiplayerTeam } from "./MultiplayerTeam";

export interface MultiplayerPlayer {
    /**
     * The UID of the player.
     */
    readonly uid: number;

    /**
     * The username of the player.
     */
    readonly username: string;

    /**
     * The mods used by the player.
     */
    readonly mods: MultiplayerRoomMods;

    /**
     * The team this player is at, if in Team VS team mode.
     */
    team: MultiplayerTeam | null;
}
