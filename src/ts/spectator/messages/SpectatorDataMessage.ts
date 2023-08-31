import { SpectatorData } from "../rawdata/SpectatorData";
import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";

/**
 * A message received from the server when a player sends their spectator data.
 */
export interface SpectatorDataMessage
    extends BroadcastedMessage<MultiplayerState.spectatorData> {
    /**
     * The spectator data.
     */
    readonly data: SpectatorData;
}

/**
 * Checks whether a broadcasted message is a spectator data message.
 *
 * @param message The message.
 */
export function isSpectatorDataMessage(
    message: BroadcastedMessage,
): message is SpectatorDataMessage {
    return message.state === MultiplayerState.spectatorData;
}
