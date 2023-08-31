import { Client as FayeClient } from "faye";
import { roomId } from "../settings/RoomSettings";
import { dataProcessor } from "../settings/SpectatorSettings";
import { BeatmapChangedHandler } from "./handlers/BeatmapChangedHandler";
import { PlayerJoinedHandler } from "./handlers/PlayerJoinedHandler";
import { PlayerLeftHandler } from "./handlers/PlayerLeftHandler";
import { RoundStartHandler } from "./handlers/RoundStartHandler";
import { isBeatmapChangedMessage } from "./messages/BeatmapChangedMessage";
import { BroadcastedMessage } from "./messages/BroadcastedMessage";
import { isPlayerJoinedMessage } from "./messages/PlayerJoinedMessage";
import { isPlayerLeftMessage } from "./messages/PlayerLeftMessage";
import { isRoundStartedMessage } from "./messages/RoundStartedMessage";
import { isSpectatorDataMessage } from "./messages/SpectatorDataMessage";

/**
 * A manager for the Faye client.
 */
export class FayeClientManager {
    /**
     * The Faye client.
     */
    readonly client = new FayeClient(
        "https://droidpp.osudroid.moe/api/droid/spectatorDataSocket",
    );

    /**
     * The subscription to the main server.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscription: any;

    /**
     * Begins the subscription to the channel.
     */
    async beginSubscription(): Promise<void> {
        await this.endSubscription();

        this.subscription = await this.client.subscribe(
            `/${roomId}`,
            (message: BroadcastedMessage) => {
                console.log(message);

                if (isSpectatorDataMessage(message)) {
                    dataProcessor?.processData(message.data);
                }

                if (isRoundStartedMessage(message)) {
                    RoundStartHandler.handle(message.room);
                }

                if (isBeatmapChangedMessage(message)) {
                    BeatmapChangedHandler.handle(message.beatmap);
                }

                if (isPlayerJoinedMessage(message)) {
                    PlayerJoinedHandler.handle(message.uid);
                }

                if (isPlayerLeftMessage(message)) {
                    PlayerLeftHandler.handle(message.uid);
                }
            },
            undefined,
        );

        console.log("WebSocket connection established");
    }

    /**
     * Ends the subscription to the channel.
     */
    async endSubscription(): Promise<void> {
        if (this.subscription) {
            await this.subscription.cancel();
            console.log("WebSocket connection dropped");
        }
    }
}
