/**
 * Different types of multiplayer states sent from the server.
 */
export enum MultiplayerState {
    /**
     * Received when the beatmap changed.
     */
    beatmapChanged,

    /**
     * Received when mod multipliers changed.
     */
    modMultiplierChanged,

    /**
     * Received when a player joins the room.
     */
    playerJoined,

    /**
     * Received when a player leaves the room.
     */
    playerLeft,

    /**
     * Received when a player starts playing.
     */
    playerStartPlaying,

    /**
     * Received when the required mods of the room changed.
     */
    requiredModsChanged,

    /**
     * Received when the room was closed.
     */
    roomClosed,

    /**
     * Received when a round starts.
     */
    roundStarted,

    /**
     * Received when a player sends their spectator data.
     */
    spectatorData,

    /**
     * Received when the speed multiplier of the room changed.
     */
    speedMultiplierChanged,
}
