import { addPlayer } from "../../settings/PlayerSettings";
import { addPreview } from "../../settings/PreviewSettings";
import { dataProcessor } from "../../settings/SpectatorSettings";
import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";

/**
 * A handler responsible for handling player join events.
 */
export abstract class PlayerJoinedHandler {
    /**
     * Handles the event when a player joins the room.
     *
     * @param player The player.
     */
    static handle(player: MultiplayerPlayer) {
        addPlayer(player);
        addPreview(player.uid);

        dataProcessor?.addPlayer(player);
    }
}
