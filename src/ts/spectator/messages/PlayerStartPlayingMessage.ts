import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "./MultiplayerState";

/**
 * A message received from the server when a player starts playing.
 */
export interface PlayerStartPlayingMessage
    extends BroadcastedMessage<MultiplayerState.playerStartPlaying> {
    /**
     * The uid of the player.
     */
    readonly uid: number;

    /**
     * The mods used by the player, in droid mod string.
     */
    readonly mods: string;

    /**
     * The MD5 hash of the beatmap played by the player.
     */
    readonly hash: string;

    /**
     * The force AR value used by the player, if any.
     */
    readonly forcedAR?: number;
}

/**
 * Checks whether a broadcasted message is a player joined message.
 *
 * @param message The message.
 */
export function isPlayerStartPlayingMessage(
    message: BroadcastedMessage
): message is PlayerStartPlayingMessage {
    return message.state === MultiplayerState.playerStartPlaying;
}
