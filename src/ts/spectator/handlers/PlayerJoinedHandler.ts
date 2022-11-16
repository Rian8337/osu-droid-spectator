import { addPlayer } from "../../settings/PlayerSettings";
import { addPreview } from "../../settings/PreviewSettings";
import { dataProcessor } from "../../settings/SpectatorSettings";
import { MultiplayerPlayer } from "../rawdata/MultiplayerPlayer";

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
        if (!addPreview(player.uid)) {
            return;
        }

        addPlayer(player);

        dataProcessor?.addPlayer(player);
    }
}
