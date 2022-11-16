import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "./MultiplayerState";

/**
 * A message received from the server when the required mods of the room was changed.
 */
export interface RequiredModsChangedMessage
    extends BroadcastedMessage<MultiplayerState.requiredModsChanged> {
    /**
     * The new required mods.
     */
    readonly mods: string;
}

/**
 * Checks whether a broadcasted message is a required mods changed message.
 *
 * @param message The message.
 */
export function isRequiredModsChangedMessage(
    message: BroadcastedMessage
): message is RequiredModsChangedMessage {
    return message.state === MultiplayerState.requiredModsChanged;
}
