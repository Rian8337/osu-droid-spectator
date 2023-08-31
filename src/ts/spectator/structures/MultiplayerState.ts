/**
 * Different types of multiplayer states sent from the server.
 */
export enum MultiplayerState {
    /**
     * Received when the beatmap changed.
     */
    beatmapChanged,

    /**
     * Received when a player joins the room.
     */
    playerJoined,

    /**
     * Received when a player leaves the room.
     */
    playerLeft,

    /**
     * Received when a round starts.
     */
    roundStarted,

    /**
     * Received when a player sends their spectator data.
     */
    spectatorData,
}
