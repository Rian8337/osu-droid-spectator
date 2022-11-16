import { MultiplayerPlayer } from "../spectator/rawdata/MultiplayerPlayer";

/**
 * The players who are playing in the room.
 */
export const players = new Map<number, MultiplayerPlayer>();

/**
 * Adds a player.
 *
 * @param player The player to add.
 */
export function addPlayer(player: MultiplayerPlayer): void {
    players.set(player.uid, player);
}

/**
 * Removes a player.
 *
 * @param uid The uid of the player.
 */
export function removePlayer(uid: number): void {
    players.delete(uid);
}
