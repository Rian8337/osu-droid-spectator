import { MultiplayerTeam } from "../structures/MultiplayerTeam";
import { MultiplayerState } from "../structures/MultiplayerState";
import { BroadcastedMessage } from "./BroadcastedMessage";

/**
 * A message received from the server when a player's team was changed.
 */
export interface PlayerTeamChangedMessage
    extends BroadcastedMessage<MultiplayerState.playerTeamChanged> {
    /**
     * The uid of the player.
     */
    readonly uid: number;

    /**
     * The team.
     */
    readonly team: MultiplayerTeam;
}

/**
 * Checks whether a broadcasted message is a player team changed message.
 *
 * @param message The message.
 */
export function isPlayerTeamChangedMessage(
    message: BroadcastedMessage
): message is PlayerTeamChangedMessage {
    return message.state === MultiplayerState.playerTeamChanged;
}
