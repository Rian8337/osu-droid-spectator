import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";
import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";

/**
 * A message received from the server when a player joins the room.
 */
export interface PlayerJoinedMessage
    extends BroadcastedMessage<MultiplayerState.playerJoined> {
    /**
     * The player who joined.
     */
    readonly player: MultiplayerPlayer;
}

/**
 * Checks whether a broadcasted message is a player joined message.
 *
 * @param message The message.
 */
export function isPlayerJoinedMessage(
    message: BroadcastedMessage
): message is PlayerJoinedMessage {
    return message.state === MultiplayerState.playerJoined;
}
