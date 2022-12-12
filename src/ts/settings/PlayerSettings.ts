import { MultiplayerPlayer } from "../spectator/structures/MultiplayerPlayer";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";

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
    if (players.size === 4) {
        return;
    }

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

/**
 * Sets a player's team.
 *
 * @param uid The uid of the player.
 * @param team The player's team.
 */
export function setPlayerTeam(uid: number, team?: MultiplayerTeam): void {
    const player = players.get(uid);

    if (player) {
        player.team = team;
    }
}
