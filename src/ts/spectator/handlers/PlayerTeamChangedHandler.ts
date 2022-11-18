import { setPlayerTeam } from "../../settings/PlayerSettings";
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
        console.log("Player team changed");

        setPlayerTeam(uid, team);
    }
}
