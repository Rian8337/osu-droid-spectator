import { incrementPlayerCount } from "../../settings/PlayerSettings";

/**
 * A handler responsible for handling player join events.
 */
export abstract class PlayerJoinedHandler {
    /**
     * Handles the event when a player joins the room.
     *
     * @param player The player.
     */
    static handle(uid: number) {
        console.log("Player", uid, "joined room");

        incrementPlayerCount();
    }
}
