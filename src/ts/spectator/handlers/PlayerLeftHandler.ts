import { removePlayer } from "../../settings/PlayerSettings";
import { removePreview } from "../../settings/PreviewSettings";
import { dataProcessor } from "../../settings/SpectatorSettings";

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

        removePreview(uid);
        removePlayer(uid);

        dataProcessor?.removePlayer(uid);
    }
}
