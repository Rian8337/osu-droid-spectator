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
     * @param mods The mods applied by the player, in droid mod string.
     * @param beatmapHash The MD5 hash of the beatmap played by the player.
     */
    static handle(
        uid: number,
        mods: string,
        beatmapHash: string,
        forcedAR?: number
    ): void {
        console.log("Player", uid, "starts playing");

        const manager = dataProcessor?.managers.get(uid);

        if (!manager) {
            // Silently return. This should be intended if there are more than 4 players.
            return;
        }

        const preview = previews.get(uid);

        if (!preview) {
            throw new Error(`No preview for player ${uid}`);
        }

        if (pickedBeatmap?.hash !== beatmapHash) {
            console.log("Player", uid, "played the wrong beatmap");
            return;
        }

        manager.reset();
        manager.applyPlayerSettings(ModUtil.droidStringToMods(mods), forcedAR);
        preview.attachToContainer();
        preview.load(manager);
    }
}
