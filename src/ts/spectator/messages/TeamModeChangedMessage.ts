import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";
import { MultiplayerTeamMode } from "../structures/MultiplayerTeamMode";

/**
 * A message received from the server when the team mode was changed.
 */
export interface TeamModeChangedMessage
    extends BroadcastedMessage<MultiplayerState.teamModeChanged> {
    /**
     * The team mode.
     */
    readonly mode: MultiplayerTeamMode;
}

/**
 * Checks whether a broadcasted message is a team mode changed message.
 *
 * @param message The message.
 */
export function isTeamModeChangedMessage(
    message: BroadcastedMessage
): message is TeamModeChangedMessage {
    return message.state === MultiplayerState.teamModeChanged;
}
