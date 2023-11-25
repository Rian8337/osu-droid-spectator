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
     * The custom CS set in this room.
     */
    readonly customCS?: number;

    /**
     * The custom AR set in this room or by the player.
     */
    readonly customAR?: number;

    /**
     * The custom OD set in this room.
     */
    readonly customOD?: number;

    /**
     * The custom HP set in this room.
     */
    readonly customHP?: number;
}
