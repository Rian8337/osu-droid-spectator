import { MultiplayerState } from "./MultiplayerState";

/**
 * A broadcast message received from the server.
 */
export interface BroadcastedMessage<
    State extends MultiplayerState = MultiplayerState
> {
    /**
     * The state that changed.
     */
    readonly state: State;
}
