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
     * The mods used by the player, in droid mod string.
     */
    readonly mods: string;

    /**
     * The team this player is at, if in Team VS team mode.
     */
    team?: MultiplayerTeam;

    /**
     * The forced AR setting used by the player.
     */
    forcedAR?: number;
}
