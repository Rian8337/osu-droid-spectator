import { setPlayerTeam } from "../../settings/PlayerSettings";
import { addPreview, removePreview } from "../../settings/PreviewSettings";
import { MultiplayerTeam } from "../structures/MultiplayerTeam";

/**
 * A handler responsible for handling player team changed events.
 */
export abstract class PlayerTeamChangedHandler {
    /**
     * Handles the event when a player's team was changed.
     *
     * @param uid The uid of the player.
     * @param team The team.
     */
    static handle(uid: number, team: MultiplayerTeam): void {
        console.log("Player", uid, "team changed to", team);

        setPlayerTeam(uid, team);
        removePreview(uid);
        addPreview(uid);
    }
}
