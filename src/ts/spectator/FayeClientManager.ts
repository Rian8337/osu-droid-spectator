import { Client as FayeClient } from "faye";
import { roomId } from "../settings/RoomSettings";
import { dataProcessor } from "../settings/SpectatorSettings";
import { BeatmapChangedHandler } from "./handlers/BeatmapChangedHandler";
import { ModMultiplierChangeHandler } from "./handlers/ModMultiplierChangedHandler";
import { PlayerJoinedHandler } from "./handlers/PlayerJoinedHandler";
import { PlayerLeftHandler } from "./handlers/PlayerLeftHandler";
import { PlayerStartPlayingHandler } from "./handlers/PlayerStartPlayingHandler";
import { RequiredModsChangedHandler } from "./handlers/RequiredModsChangedHandler";
import { RoomClosedHandler } from "./handlers/RoomClosedHandler";
import { SpeedMultiplierChangedHandler } from "./handlers/SpeedMultiplierChangedHandler";
import { isBeatmapChangedMessage } from "./messages/BeatmapChangedMessage";
import { BroadcastedMessage } from "./messages/BroadcastedMessage";
import { isModMultiplierChangedMessage } from "./messages/ModMultiplierChangedMessage";
import { isPlayerJoinedMessage } from "./messages/PlayerJoinedMessage";
import { isPlayerLeftMessage } from "./messages/PlayerLeftMessage";
import { isPlayerStartPlayingMessage } from "./messages/PlayerStartPlayingMessage";
import { isRequiredModsChangedMessage } from "./messages/RequiredModsChangedMessage";
import { isRoomClosedMessage } from "./messages/RoomClosedMessage";
import { isSpectatorDataMessage } from "./messages/SpectatorDataMessage";
import { isSpeedMultiplierChangedMessage } from "./messages/SpeedMultiplierChangedMessage";

/**
 * A manager for the Faye client.
 */
export class FayeClientManager {
    /**
     * The Faye client.
     */
    readonly client = new FayeClient(
        "https://droidpp.osudroid.moe/api/droid/spectatorDataSocket"
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
        if (!dataProcessor) {
            throw new Error("Spectator data processor is not initialized yet");
        }

        await this.endSubscription();

        this.subscription = await this.client.subscribe(
            `/${roomId}`,
            (message: BroadcastedMessage) => {
                if (isSpectatorDataMessage(message)) {
                    dataProcessor?.processData(message.data);
                }

                if (isBeatmapChangedMessage(message)) {
                    BeatmapChangedHandler.handle(message.beatmap);
                }

                if (isModMultiplierChangedMessage(message)) {
                    ModMultiplierChangeHandler.handle(message.multipliers);
                }

                if (isPlayerJoinedMessage(message)) {
                    PlayerJoinedHandler.handle(message.player);
                }

                if (isPlayerLeftMessage(message)) {
                    PlayerLeftHandler.handle(message.uid);
                }

                if (isRequiredModsChangedMessage(message)) {
                    RequiredModsChangedHandler.handle(message.mods);
                }

                if (isRoomClosedMessage(message)) {
                    RoomClosedHandler.handle();
                }

                if (isSpeedMultiplierChangedMessage(message)) {
                    SpeedMultiplierChangedHandler.handle(message.value);
                }

                if (isPlayerStartPlayingMessage(message)) {
                    PlayerStartPlayingHandler.handle(
                        message.uid,
                        message.mods,
                        message.hash,
                        message.forcedAR
                    );
                }
            },
            undefined
        );
    }

    /**
     * Ends the subscription to the channel.
     */
    async endSubscription(): Promise<void> {
        if (this.subscription) {
            await this.subscription.cancel();
        }
    }
}
