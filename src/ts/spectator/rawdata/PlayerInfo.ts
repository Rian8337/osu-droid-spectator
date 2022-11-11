/**
 * Represents basic information about a player.
 */
export interface PlayerInfo {
    /**
     * The uid of the player.
     */
    readonly uid: number;

    /**
     * The username of the player.
     */
    readonly username: string;

    /**
     * The mods that they used to play.
     */
    readonly mods: string;
}
