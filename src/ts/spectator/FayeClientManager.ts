import { Client as FayeClient } from "faye";
import settings from "../Settings";
import { BeatmapChangedHandler } from "./handlers/BeatmapChangedHandler";
import { ModMultiplierChangeHandler } from "./handlers/ModMultiplierChangedHandler";
import { PlayerStartPlayingHandler } from "./handlers/PlayerStartPlayingHandler";
import { RequiredModsChangedHandler } from "./handlers/RequiredModsChangedHandler";
import { RoomClosedHandler } from "./handlers/RoomClosedHandler";
import { SpeedMultiplierChangedHandler } from "./handlers/SpeedMultiplierChangedHandler";
import { PickedBeatmap } from "./rawdata/PickedBeatmap";
import { SpectatorData } from "./rawdata/SpectatorData";
import { SpectatorDataProcessor } from "./SpectatorDataProcessor";

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
     * The spectator data processor.
     */
    readonly processor: SpectatorDataProcessor;

    /**
     * List of all subscriptions currently connected.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly subscriptions: any[] = [];

    /**
     * @param processor The processor used to process the data.
     */
    constructor(processor: SpectatorDataProcessor) {
        this.processor = processor;
    }

    /**
     * Begins subscription to channels.
     */
    async beginSubscriptions(): Promise<void> {
        // End existing subscriptions first.
        await this.endSubscriptions();

        this.subscriptions.push(
            await this.client.subscribe(
                `/${settings.roomId}/beatmapChange`,
                (message: PickedBeatmap) =>
                    BeatmapChangedHandler.handle(message),
                undefined
            )
        );

        this.subscriptions.push(
            await this.client.subscribe(
                `/${settings.roomId}/modMultiplierChange`,
                (message: { mods: string; value: number }) =>
                    ModMultiplierChangeHandler.handle(
                        message.mods,
                        message.value
                    ),
                undefined
            )
        );

        this.subscriptions.push(
            await this.client.subscribe(
                `/${settings.roomId}/requiredModsChange`,
                (message: { mods: string }) =>
                    RequiredModsChangedHandler.handle(message.mods),
                undefined
            )
        );

        this.subscriptions.push(
            await this.client.subscribe(
                `/${settings.roomId}/roomClosed`,
                () => RoomClosedHandler.handle(),
                undefined
            )
        );

        this.subscriptions.push(
            await this.client.subscribe(
                `/${settings.roomId}/speedMultiplierChange`,
                (message: { value: number }) =>
                    SpeedMultiplierChangedHandler.handle(message.value),
                undefined
            )
        );

        for (const uid of this.processor.managers.keys()) {
            this.subscriptions.push(
                await this.client.subscribe(
                    `/${settings.roomId}/playerSettings/${uid}`,
                    (message: { modstring: string; hash: string }) =>
                        PlayerStartPlayingHandler.handle(
                            uid,
                            message.modstring,
                            message.hash
                        ),
                    undefined
                )
            );

            this.subscriptions.push(
                await this.client.subscribe(
                    `/${settings.roomId}/spectatorData/${uid}`,
                    (message: SpectatorData) =>
                        this.processor.processData(message.uid, message),
                    undefined
                )
            );
        }
    }

    /**
     * End subscription to channels.
     */
    async endSubscriptions(): Promise<void> {
        for (const subscription of this.subscriptions) {
            await subscription.cancel();
        }
    }
}
