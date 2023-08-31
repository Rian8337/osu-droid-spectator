import { decrementPlayerCount } from "../../settings/PlayerSettings";

/**
 * A handler responsible for handling player leave events.
 */
export abstract class PlayerLeftHandler {
    /**
     * Handles the event when a player leaves the room.
     *
     * @param uid The uid of the player.
     */
    static handle(uid: number) {
        console.log("Player", uid, "left room");

        decrementPlayerCount();
    }
}
