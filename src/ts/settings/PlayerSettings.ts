import { askRoomID } from "../RoomLoader";
import { MultiplayerPlayer } from "../spectator/structures/MultiplayerPlayer";

/**
 * The players who are playing in the room.
 */
export const players = new Map<number, MultiplayerPlayer>();

/**
 * The uid of players who are ignored by the spectator client.
 */
export const ignoredPlayers = new Set<number>();

/**
 * Adds a player.
 *
 * @param player The player to add.
 */
export function addPlayer(player: MultiplayerPlayer): void {
    if (players.size === 4 || ignoredPlayers.has(player.uid)) {
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
 * The amount of players in the room.
 */
let playerCount = 0;

/**
 * Sets the current player count in the room.
 *
 * @param count The player count.
 */
export function setPlayerCount(count: number): void {
    playerCount = count;
}

/**
 * Increments the player count in the room.
 */
export function incrementPlayerCount(): void {
    ++playerCount;
}

/**
 * Decrements the player count in the room.
 */
export function decrementPlayerCount(): void {
    --playerCount;

    if (playerCount <= 0) {
        console.log("Room closed");

        askRoomID();
    }
}

/**
 * Sets the set of ignored players by a room's name.
 *
 * @param name The name of the room.
 */
export function setIgnoredPlayersFromRoomName(name: string): void {
    console.log("Resetting list of ignored players");
    ignoredPlayers.clear();

    const match = name.match(/Ref:\d+(?:[ \t]*,[ \t]*\d+)+/);
    if (!match) {
        return;
    }

    const uids = name
        .substring(4)
        .split(",")
        .map((s) => parseInt(s));

    for (const uid of uids) {
        ignoredPlayers.add(uid);
        console.log("Added uid", uid, "to the list of ignored players");
    }
}
