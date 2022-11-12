import { Client as FayeClient } from "faye";
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

        for (const uid of this.processor.managers.keys()) {
            this.subscriptions.push(
                await this.client.subscribe(
                    `/${uid}`,
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
