/**
 * Represents a score from a player.
 */
export interface MultiplayerScore {
    /**
     * The user ID of the player.
     */
    readonly uid: string;

    /**
     * The name of the player.
     */
    readonly username: string;

    /**
     * The string of mod combinations received from the client.
     */
    readonly modstring: string;

    /**
     * The score achieved by the player.
     */
    score: number;

    /**
     * The maximum combo achieved by the player.
     */
    maxCombo: number;

    /**
     * The amount of geki achieved by the player.
     */
    geki: number;

    /**
     * The amount of perfect hits (300) achieved by the player.
     */
    perfect: number;

    /**
     * The amount of katu achieved by the player.
     */
    katu: number;

    /**
     * The amount of good hits (100) achieved by the player.
     */
    good: number;

    /**
     * The amount of bad hits (50) achieved by the player.
     */
    bad: number;

    /**
     * The amount of misses achieved by the player.
     */
    miss: number;

    /**
     * Whether the player is currently alive in gameplay (not failing).
     */
    isAlive: boolean;
}
