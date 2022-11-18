import { players, setPlayerTeam } from "../../settings/PlayerSettings";
import { setTeamMode } from "../../settings/RoomSettings";
import { MultiplayerTeam } from "../structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../structures/MultiplayerTeamMode";

/**
 * A handler responsible for handling team mode changed events.
 */
export abstract class TeamModeChangedHandler {
    /**
     * Handles a team mode changed event.
     *
     * @param teamMode The team mode.
     */
    static handle(teamMode: MultiplayerTeamMode): void {
        console.log("Team mode changed");

        setTeamMode(teamMode);

        for (const uid of players.keys()) {
            setPlayerTeam(
                uid,
                teamMode === MultiplayerTeamMode.teamVS
                    ? MultiplayerTeam.red
                    : undefined
            );
        }
    }
}
