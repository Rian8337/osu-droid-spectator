/**
 * A structure containing mods and other settings that can be accessed via the mods menu.
 */
export interface MultiplayerRoomMods {
    /**
     * The mods set in this room or by the player.
     */
    readonly mods: string | null;

    /**
     * The speed multiplier set in this room or by the player.
     */
    readonly speedMultiplier: number;

    /**
     * The Flashlight follow delay set in this room or by the player.
     */
    readonly flFollowDelay: number;

    /**
     * The force AR set in this room or by the player.
     */
    readonly forceAR: number | null;
}
