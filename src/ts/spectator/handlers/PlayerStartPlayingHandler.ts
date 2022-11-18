import { ModUtil } from "../../osu-base";
import { pickedBeatmap } from "../../settings/BeatmapSettings";
import { previews } from "../../settings/PreviewSettings";
import { dataProcessor } from "../../settings/SpectatorSettings";

/**
 * A handler responsible for handling events when a player starts playing.
 */
export abstract class PlayerStartPlayingHandler {
    /**
     * Handles the event when a player starts playing.
     *
     * @param uid The uid of the player.
     * @param mods The mods applied by the player.
     * @param beatmapHash The MD5 hash of the beatmap played by the player.
     */
    static async handle(
        uid: number,
        mods: string,
        beatmapHash: string,
        forcedAR?: number
    ): Promise<void> {
        console.log("Player starts playing");

        const manager = dataProcessor?.managers.get(uid);

        if (!manager) {
            throw new Error("No manager for player");
        }

        const preview = previews.get(uid);

        if (!preview) {
            throw new Error("No preview for player");
        }

        manager.reset();

        if (pickedBeatmap?.hash !== beatmapHash) {
            manager.willBeSubmitted = false;
            return;
        }

        manager.applyPlayerSettings(ModUtil.droidStringToMods(mods), forcedAR);
        preview.attachToContainer();
        preview.load(manager);
    }
}
